import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AlipayService } from './alipay.service';
import { WechatService } from './wechat.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, AlipayService, WechatService],
  exports: [PaymentService, AlipayService, WechatService],
})
export class PaymentModule {}
