import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client'; // Replace with the correct path if enums are exported separately
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @ApiProperty({
        description: 'ID of the user placing the order',
        type: Number,
        example: 1,
        required: true,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    userId: number;

    @ApiProperty({
        description: 'ID of the package associated with the order',
        type: Number,
        example: 101,
        required: true,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    packageId: number;

    @ApiProperty({
        description: 'ID of the promo code applied to the order',
        type: Number,
        example: 101,
        required: false,
    })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    promoId?: number;

    @ApiProperty({
        description: 'Total price of the order',
        type: Number,
        example: 500,
        required: true,
    })
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @IsNotEmpty()
    totalPrice: number;

    @ApiProperty({
        description: 'Final price after applying discounts or adjustments',
        type: Number,
        example: 450,
        required: true,
    })
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    finalPrice: number;

    @ApiPropertyOptional({
        description: 'Status of the order',
        enum: OrderStatus,
        example: OrderStatus.PENDING,
        required: false,
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    constructor(data: {
        userId: number;
        packageId: number;
        totalPrice: number;
        finalPrice: number;
        status?: OrderStatus;
        promoId?: number;
    }) {
        Object.assign(this, data);
    }
}
