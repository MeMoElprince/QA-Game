import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ConfirmCheckoutOrderDto {
    @ApiProperty({
        description: 'Order ID',
        example: 1,
        required: true,
    })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    orderId: number;

    @ApiProperty({
        description: 'Transaction ID of edfa payment',
        example: '12312-23131-231321-321123',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    transactionId: string;
}
