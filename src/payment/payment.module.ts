import { Module } from '@nestjs/common';
import { EdfaPaymentModule } from './edfa-payment/edfa-payment.module';
import { OrderModule } from './order/order.module';

@Module({
    imports: [OrderModule, EdfaPaymentModule],
    controllers: [],
    providers: [],
})
export class PaymentModule {}
