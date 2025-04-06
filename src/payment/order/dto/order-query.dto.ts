import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client'; // Replace with the correct path if enums are exported separately
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class OrderQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filter by user ID',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    userId?: number;

    @ApiPropertyOptional({
        description: 'Filter by package ID',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    packageId?: number;

    @ApiPropertyOptional({
        description: 'Filter by order ID',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id?: number;

    @ApiPropertyOptional({
        description: 'Filter by maximum total price',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    totalPrice?: number;

    @ApiPropertyOptional({
        description: 'Filter by maximum total price',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    finalPrice?: number;

    @ApiPropertyOptional({
        description: 'Filter by order status',
        enum: OrderStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
