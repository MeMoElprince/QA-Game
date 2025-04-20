import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignatureDto } from './dto/signature.dto';
import * as crypto from 'crypto';
import axios from 'axios';
import { EdfaCheckoutDto } from './dto/checkout.dto';
import FormData from 'form-data';
import { EdfaCurrency } from './enum/currency.enum';

@Injectable()
export class EdfaPaymentService {
    constructor(private configService: ConfigService) {}

    private baseUrl = 'https://api.edfapay.com';

    private getPassword(): string {
        return this.configService.get('EDFA_PASSWORD');
    }

    private getMerchantKey(): string {
        return this.configService.get('EDFA_MERCHANT_KEY');
    }

    private generateSignature(signatureDto: SignatureDto) {
        const password = this.getPassword();
        const amount = signatureDto.orderAmount.toFixed(2);
        const concatString =
            `${signatureDto.orderNumber}${amount}${signatureDto.orderCurrency}${signatureDto.orderDescription}${password}`.toUpperCase();
        console.log({ concatString });
        const md5Hash = crypto
            .createHash('md5')
            .update(concatString)
            .digest('hex');
        const sha1Hash = crypto
            .createHash('sha1')
            .update(md5Hash)
            .digest('hex');
        return sha1Hash;
    }

    private genetrateSignatureStatus(edfaTransactionId: string) {
        if (!edfaTransactionId)
            throw new Error('EDFA transaction ID is required');
        const md5 = edfaTransactionId + this.getPassword();
        const md5Hash = crypto
            .createHash('md5')
            .update(md5.toUpperCase())
            .digest('hex');
        const sha1Hash = crypto
            .createHash('sha1')
            .update(md5Hash)
            .digest('hex');
        return sha1Hash;
    }

    public async checkPaymentStatus(
        edfaTransactionId: string,
        orderId: string,
    ) {
        if (!edfaTransactionId)
            throw new Error('EDFA transaction ID is required');
        if (!orderId) throw new Error('Order ID is required');
        const signature = this.genetrateSignatureStatus(edfaTransactionId);
        const response = await axios.post(`${this.baseUrl}/payment/status`, {
            order_id: orderId,
            merchant_id: this.getMerchantKey(),
            gway_Payment_id: edfaTransactionId,
            hash: signature,
        });
        return response.data;
    }

    public async checkout(edfaCheckoutDto: EdfaCheckoutDto) {
        edfaCheckoutDto.currency = edfaCheckoutDto.currency || EdfaCurrency.SAR;
        edfaCheckoutDto.action = edfaCheckoutDto.action || 'SALE';
        edfaCheckoutDto.description =
            edfaCheckoutDto.description || 'Payment for order';
        edfaCheckoutDto.country = edfaCheckoutDto.country || 'SA';
        edfaCheckoutDto.zip = edfaCheckoutDto.zip || '12221';
        edfaCheckoutDto.recurringInit = edfaCheckoutDto.recurringInit || 'N';
        edfaCheckoutDto.reqToken = edfaCheckoutDto.reqToken || 'N';
        edfaCheckoutDto.urlRedirect =
            edfaCheckoutDto.urlRedirect ||
            this.configService.get('FRONT_URL') ||
            this.configService.get('FRONT_URL_DEV') ||
            'http://localhost:3000';
        console.log({ edfaCheckoutDto });
        const hash = this.generateSignature({
            orderAmount: edfaCheckoutDto.amount,
            orderCurrency: edfaCheckoutDto.currency,
            orderDescription: edfaCheckoutDto.description,
            orderNumber: edfaCheckoutDto.orderNumber,
        });
        console.log({
            orderAmount: edfaCheckoutDto.amount,
            orderCurrency: edfaCheckoutDto.currency,
            orderDescription: edfaCheckoutDto.description,
            orderNumber: edfaCheckoutDto.orderNumber,
        });
        console.log({ hash });
        console.log(this.getMerchantKey(), this.getPassword());
        console.log(
            '------------------------- Full Object ------------------------ ',
        );
        console.log('---------- edfaCheckoutDto --------- ');
        console.log(edfaCheckoutDto);
        console.log(
            '=================================================================',
        );

        const formData = new FormData();
        formData.append('edfa_merchant_id', this.getMerchantKey());
        formData.append('order_amount', edfaCheckoutDto.amount.toFixed(2));
        formData.append('term_url_3ds', edfaCheckoutDto.urlRedirect);
        formData.append('action', edfaCheckoutDto.action);
        formData.append('req_token', edfaCheckoutDto.reqToken);
        formData.append('recurring_init', edfaCheckoutDto.recurringInit);
        formData.append('order_id', edfaCheckoutDto.orderNumber);
        formData.append('order_currency', edfaCheckoutDto.currency);
        formData.append('payer_country', edfaCheckoutDto.country);
        formData.append('payer_city', edfaCheckoutDto.city);
        formData.append('payer_address', edfaCheckoutDto.address);
        formData.append('order_description', edfaCheckoutDto.description);
        formData.append('payer_first_name', edfaCheckoutDto.firstName);
        formData.append('payer_last_name', edfaCheckoutDto.lastName);
        formData.append('payer_email', edfaCheckoutDto.email);
        formData.append('payer_phone', edfaCheckoutDto.phoneNumber);
        formData.append('payer_ip', edfaCheckoutDto.ip);
        formData.append('hash', hash);
        formData.append('payer_zip', edfaCheckoutDto.zip);
        try {
            // Send request with form-data
            const response = await axios.post(
                `${this.baseUrl}/payment/initiate`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(), // Automatically sets Content-Type
                    },
                },
            );
            return response.data;
        } catch (err) {
            console.log('edfa error');
            console.log(err);
            console.log(err.message);
            return null;
        }
    }
}
