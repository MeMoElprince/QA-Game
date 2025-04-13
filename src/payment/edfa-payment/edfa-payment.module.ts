import { Module } from '@nestjs/common';
import { EdfaPaymentService } from './edfa-payment.service';

@Module({
    providers: [EdfaPaymentService],
    exports: [EdfaPaymentService],
})
export class EdfaPaymentModule {}
