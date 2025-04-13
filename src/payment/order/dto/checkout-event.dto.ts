import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from 'src/payment/edfa-payment/enum/payment-type.enum';

export class CheckoutPackageDto {
    @ApiProperty({
        description: 'ID of the package associated with the order',
        example: 1,
        required: true,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    packageId: number;

    @ApiPropertyOptional({
        description: 'Promo code applied to the order',
        type: String,
        example: 'SUMMER2021',
        required: false,
    })
    @IsOptional()
    @IsString()
    promoCode?: string;

    @ApiProperty({
        description: 'Payment Method',
        example: PaymentType.APPLE,
        required: true,
        enum: PaymentType,
    })
    @IsEnum(PaymentType)
    @IsNotEmpty()
    paymentMethod: PaymentType;

    @ApiProperty({
        description: 'Apple Token',
        example: 'apple_token',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    @ValidateIf((o) => o.paymentMethod === PaymentType.APPLE)
    appleToken?: string;

    @ApiProperty({
        description: 'card number',
        example: '4111111111111111',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    @ValidateIf((o) => o.paymentMethod === PaymentType.CARD)
    cardNumber?: string;

    @ApiProperty({
        description: 'card holder name',
        example: 'Test Card',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    @ValidateIf((o) => o.paymentMethod === PaymentType.CARD)
    holderName?: string;

    @ApiProperty({
        description: 'card expiry month',
        example: 12,
        required: false,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    @ValidateIf((o) => o.paymentMethod === PaymentType.CARD)
    expiryMonth?: number;

    @ApiProperty({
        description: 'card expiry year',
        example: 2025,
        required: false,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    @ValidateIf((o) => o.paymentMethod === PaymentType.CARD)
    expiryYear?: number;

    @ApiProperty({
        description: 'card cvv',
        example: 123,
        required: false,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @ValidateIf((o) => o.paymentMethod === PaymentType.CARD)
    cvc?: number;

    @ApiProperty({
        description: 'STC mobile number',
        example: '966500000000',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    @ValidateIf((o) => o.paymentMethod === PaymentType.STC)
    stcMobileNumber?: string;
}
