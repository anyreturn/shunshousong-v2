import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

export interface CreatePaymentDto {
  orderId: string;
  paymentMethod: 'alipay' | 'wechat';
}

export interface CreateWithdrawalDto {
  amount: number;
  alipayAccount?: string;
  bankAccount?: string;
}

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建支付订单
   */
  async createPayment(userId: string, data: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 只有发布者可以支付
    if (order.publisherId !== userId) {
      throw new ForbiddenException('无权支付此订单');
    }

    if (order.status !== 'ACCEPTED' && order.status !== 'DELIVERING') {
      throw new ForbiddenException('订单状态不允许支付');
    }

    // 检查是否已支付
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { orderId: data.orderId },
    });

    if (existingTransaction) {
      throw new ForbiddenException('订单已支付');
    }

    // 创建交易记录
    const transaction = await this.prisma.transaction.create({
      data: {
        orderId: data.orderId,
        userId,
        amount: order.price,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        paymentMethod: data.paymentMethod,
      },
      include: {
        order: {
          select: {
            id: true,
            price: true,
            status: true,
          },
        },
      },
    });

    // TODO: 调用支付宝/微信支付 API 获取支付参数
    // 这里返回模拟的支付参数
    const paymentParams = this.generatePaymentParams(
      transaction.id,
      order.price,
      data.paymentMethod,
    );

    return {
      transaction,
      paymentParams,
    };
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(
    transactionId: string,
    success: boolean,
    externalTransactionId?: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('交易不存在');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ForbiddenException('交易状态不允许更新');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: success ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
        transactionId: externalTransactionId,
      },
      include: {
        order: true,
      },
    });

    // 如果支付成功，更新订单状态
    if (success) {
      await this.prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'DELIVERING',
        },
      });
    }

    return updatedTransaction;
  }

  /**
   * 申请提现
   */
  async createWithdrawal(userId: string, data: CreateWithdrawalDto) {
    // 检查用户余额
    const totalIncome = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    const totalWithdrawn = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    const availableBalance =
      (totalIncome._sum.amount || 0) -
      (totalWithdrawn._sum.amount || 0);

    if (data.amount > availableBalance) {
      throw new ForbiddenException('余额不足');
    }

    if (data.amount < 10) {
      throw new ForbiddenException('最低提现金额为 10 元');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        orderId: '',
        amount: -data.amount, // 负数表示支出
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        paymentMethod: data.alipayAccount ? 'alipay' : 'bank',
      },
    });

    return transaction;
  }

  /**
   * 获取用户交易记录
   */
  async getUserTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            pickupAddress: true,
            deliveryAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.transaction.count({
      where: { userId },
    });

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取用户余额
   */
  async getBalance(userId: string) {
    const totalIncome = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    const totalWithdrawn = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      balance:
        (totalIncome._sum.amount || 0) -
        (totalWithdrawn._sum.amount || 0),
      totalIncome: totalIncome._sum.amount || 0,
      totalWithdrawn: totalWithdrawn._sum.amount || 0,
    };
  }

  /**
   * 生成支付参数 (模拟)
   */
  private generatePaymentParams(
    transactionId: string,
    amount: number,
    paymentMethod: string,
  ) {
    // 实际应该调用支付宝/微信支付 API
    return {
      transactionId,
      amount,
      paymentMethod,
      // 模拟的支付参数
      alipay: {
        outTradeNo: transactionId,
        totalAmount: amount.toFixed(2),
        subject: '顺手送订单支付',
        productCode: 'FAST_INSTANT_TRADE_PAY',
      },
      wechat: {
        outTradeNo: transactionId,
        totalFee: Math.round(amount * 100), // 单位：分
        body: '顺手送订单支付',
        tradeType: 'JSAPI',
      },
    };
  }
}
