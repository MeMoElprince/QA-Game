import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'The name of the category',
        type: String,
        required: true,
        example: 'Electronics',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The description of the category',
        type: String,
        required: false,
        example: 'Electronics',
    })
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'The image of the category',
        type: 'string',
        format: 'binary',
        required: true,
    })
    image: Express.Multer.File;

    @ApiProperty({
        description: 'The parent category id',
        type: Number,
        example: 1,
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsOptional()
    parentCategoryId?: number;
}
