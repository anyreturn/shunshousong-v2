import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentService, CreatePaymentDto, CreateWithdrawalDto } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('支付')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  @ApiOperation({ summary: '创建支付订单' })
  async createPayment(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(
      req.user.userId,
      createPaymentDto,
    );
  }

  @Post('callback')
  @ApiOperation({ summary: '支付回调 (内部使用)' })
  async handleCallback(
    @Body('transactionId') transactionId: string,
    @Body('success') success: boolean,
    @Body('externalTransactionId') externalTransactionId?: string,
  ) {
    return this.paymentService.handlePaymentCallback(
      transactionId,
      success,
      externalTransactionId,
    );
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现' })
  async createWithdrawal(
    @Request() req,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {
    return this.paymentService.createWithdrawal(
      req.user.userId,
      createWithdrawalDto,
    );
  }

  @Get('balance')
  @ApiOperation({ summary: '获取余额' })
  async getBalance(@Request() req) {
    return this.paymentService.getBalance(req.user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取交易记录' })
  async getTransactions(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentService.getUserTransactions(
      req.user.userId,
      page,
      limit,
    );
  }
}
