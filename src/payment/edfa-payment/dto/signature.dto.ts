import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignatureDto {
    @IsString()
    @IsNotEmpty()
    orderNumber: string;

    @IsNumber()
    @IsNotEmpty()
    orderAmount: number;

    @IsString()
    @IsNotEmpty()
    orderCurrency: string;

    @IsString()
    @IsNotEmpty()
    orderDescription: string;
}
