import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

/**
 * 支付宝 SDK 集成服务
 * 实际部署时需要安装 alipay-sdk 包
 * npm install alipay-sdk
 */
@Injectable()
export class AlipayService {
  private config: {
    appId: string;
    privateKey: string;
    alipayPublicKey: string;
    gatewayUrl: string;
  };

  constructor(private configService: ConfigService) {
    this.config = {
      appId: this.configService.get<string>('ALIPAY_APP_ID') || '',
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY') || '',
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY') || '',
      gatewayUrl: 'https://openapi.alipay.com/gateway.do',
    };
  }

  /**
   * 生成支付宝预下单参数
   */
  createOrder(params: {
    outTradeNo: string;
    totalAmount: string;
    subject: string;
  }) {
    // 实际应该调用支付宝 API
    // 这里返回模拟参数
    return {
      outTradeNo: params.outTradeNo,
      totalAmount: params.totalAmount,
      subject: params.subject,
      productCode: 'QUICK_MSECURITY_PAY',
      timeoutExpress: '30m',
    };
  }

  /**
   * 生成手机支付 string
   */
  createAppPayString(orderParams: any): string {
    // 实际应该用 alipay-sdk 生成签名的 string
    // 格式：app_id=xxx&method=alipay.trade.app.pay&...
    return `app_id=${this.config.appId}&method=alipay.trade.app.pay&out_trade_no=${orderParams.outTradeNo}&total_amount=${orderParams.totalAmount}`;
  }

  /**
   * 验证支付宝回调签名
   */
  verifySign(params: any): boolean {
    // 实际应该验证支付宝返回的签名
    // 这里简化处理
    return true;
  }

  /**
   * 查询订单状态
   */
  async queryOrder(outTradeNo: string) {
    // 实际应该调用支付宝查询 API
    return {
      tradeNo: outTradeNo,
      status: 'TRADE_SUCCESS',
      amount: '20.00',
    };
  }

  /**
   * 退款
   */
  async refund(params: {
    outTradeNo: string;
    refundAmount: string;
    refundReason?: string;
  }) {
    // 实际应该调用支付宝退款 API
    return {
      refundNo: `REF_${Date.now()}`,
      status: 'SUCCESS',
    };
  }
}
