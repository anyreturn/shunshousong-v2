import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

/**
 * 微信支付 SDK 集成服务
 * 实际部署时需要安装 tenpay 或 wechat-pay 包
 */
@Injectable()
export class WechatService {
  private config: {
    appId: string;
    mchId: string;
    apiKey: string;
    privateKey: string;
  };

  constructor(private configService: ConfigService) {
    this.config = {
      appId: this.configService.get<string>('WECHAT_APP_ID') || '',
      mchId: this.configService.get<string>('WECHAT_MCH_ID') || '',
      apiKey: this.configService.get<string>('WECHAT_API_KEY') || '',
      privateKey: this.configService.get<string>('WECHAT_PRIVATE_KEY') || '',
    };
  }

  /**
   * 生成微信支付参数 (JSAPI)
   */
  createJsapiParams(params: {
    outTradeNo: string;
    totalFee: number;
    body: string;
    openId: string;
  }) {
    // 实际应该调用微信支付统一下单 API
    return {
      appId: this.config.appId,
      mchId: this.config.mchId,
      nonceStr: this.generateNonceStr(),
      package: `prepay_id=xxx`,
      signType: 'RSA',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
    };
  }

  /**
   * 生成小程序支付参数
   */
  createMiniPayParams(params: {
    outTradeNo: string;
    totalFee: number;
    body: string;
    openId: string;
  }) {
    return {
      appId: this.config.appId,
      mchId: this.config.mchId,
      nonceStr: this.generateNonceStr(),
      package: `prepay_id=xxx`,
      signType: 'RSA',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
    };
  }

  /**
   * 生成 APP 支付参数
   */
  createAppPayParams(params: {
    outTradeNo: string;
    totalFee: number;
    body: string;
  }) {
    return {
      appid: this.config.appId,
      partnerid: this.config.mchId,
      prepayid: 'prepay_id=xxx',
      package: 'Sign=WXPay',
      noncestr: this.generateNonceStr(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };
  }

  /**
   * 查询订单
   */
  async queryOrder(outTradeNo: string) {
    // 实际应该调用微信支付查询 API
    return {
      tradeState: 'SUCCESS',
      totalFee: 2000, // 分
    };
  }

  /**
   * 退款
   */
  async refund(params: {
    outTradeNo: string;
    totalFee: number;
    refundFee: number;
    refundReason?: string;
  }) {
    // 实际应该调用微信支付退款 API
    return {
      refundId: `REF_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成签名
   */
  private generateSign(params: any): string {
    const str = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    const signStr = `${str}&key=${this.config.apiKey}`;
    return createHmac('md5', this.config.apiKey)
      .update(signStr)
      .digest('hex')
      .toUpperCase();
  }
}
