import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PromoModule } from 'src/commerce/promo/promo.module';
import { EdfaPaymentModule } from 'src/payment/edfa-payment/edfa-payment.module';
import { AuthModule } from 'src/core/auth/auth.module';

@Module({
    imports: [AuthModule, PromoModule, EdfaPaymentModule],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
