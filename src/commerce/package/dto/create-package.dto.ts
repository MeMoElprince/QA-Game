import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class CreatePackageDto {
    @ApiProperty({
        description: 'The name of the package',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The description of the package',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The price of the package',
        required: false,
    })
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        description: 'The quantity of games that this package offer.',
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    quantity: number;
}
