import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class PromoQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filter by status of the promo',
        required: false,
    })
    @Transform(({ value }) => {
        return value === 'true' || value === true;
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by associated package ID',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    packageId?: number;
}
