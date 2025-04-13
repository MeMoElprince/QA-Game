import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { EdfaCurrency } from '../enum/currency.enum';

export class EdfaCheckoutDto {
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    ip: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    orderNumber: string;

    @IsEnum(EdfaCurrency)
    @IsOptional()
    currency?: EdfaCurrency = EdfaCurrency.SAR;

    @IsOptional()
    @IsString()
    action?: string = 'SALE';

    @IsOptional()
    @IsString()
    description?: string = 'Payment for order';

    @IsOptional()
    @IsString()
    urlRedirect?: string = 'https://app.hobbystation.co';

    @IsOptional()
    @IsString()
    country?: string = 'SA';

    @IsOptional()
    @IsString()
    zip?: string = '12221';

    @IsOptional()
    @IsString()
    reqToken?: string = 'N';

    @IsOptional()
    @IsString()
    recurringInit?: string = 'N';
}
