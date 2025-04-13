import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Validate,
    ValidateIf,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { DiscountUnit, PromoType } from '@prisma/client';

@ValidatorConstraint({ name: 'DiscountRange', async: false })
class DiscountRangeValidator implements ValidatorConstraintInterface {
    validate(value: number, args: ValidationArguments) {
        const dto = args.object as CreatePromoDto;
        // Validate only if discountUnit is PERCENTAGE
        if (
            dto.discountUnit === DiscountUnit.PERCENTAGE &&
            (value < 1 || value > 100)
        ) {
            console.log('Validating discount range');
            console.log({ value });
            return false;
        }

        if (dto.userLimit > dto.maxUsage) {
            console.log('User limit cannot be greater than max usage');
            return false;
        }

        if (dto.type === PromoType.package && !dto.packageId) {
            console.log('Event ID is required for event type promo');
            return false;
        }

        console.log({ dto });
        return true; // Skip validation for other discountUnit values
    }

    defaultMessage(args: ValidationArguments) {
        const dto = args.object as CreatePromoDto;
        if (dto.userLimit > dto.maxUsage) {
            return 'User limit cannot be greater than max usage';
        }

        if (dto.type === PromoType.package && !dto.packageId) {
            return 'Event ID is required for event type promo';
        }

        return 'Discount must be between 1 and 100 when the discount unit is PERCENTAGE';
    }
}

export class CreatePromoDto {
    @ApiProperty({
        description: 'Promo code status',
        default: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    active?: boolean;

    @ApiProperty({
        description: 'Promo code',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({
        description: 'Promo code discount',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    @Validate(DiscountRangeValidator)
    discount: number;

    @ApiProperty({
        description: 'Promo code discount unit',
        example: DiscountUnit.PERCENTAGE,
        required: false,
        default: DiscountUnit.PERCENTAGE,
        enum: DiscountUnit,
    })
    @IsEnum(DiscountUnit)
    @IsOptional()
    discountUnit?: DiscountUnit;

    @ApiProperty({
        description: 'Promo code start date',
        example: new Date(),
        required: false,
        type: Date,
        default: new Date(),
    })
    @IsOptional()
    @Type(() => Date)
    startDate?: Date;

    @ApiProperty({
        description: 'Promo code end date',
        example: new Date(),
        required: true,
        type: Date,
    })
    @IsNotEmpty()
    @Type(() => Date)
    endDate: Date;

    @ApiProperty({
        description: 'Promo code max usage',
        example: 100,
        required: true,
        type: Number,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    maxUsage: number;

    @ApiProperty({
        description: 'Promo code max usage per user',
        example: 4,
        required: false,
        type: Number,
        default: 1,
    })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    userLimit?: number;

    @ApiProperty({
        description: 'Promo code type',
        example: PromoType.package,
        required: false,
        enum: PromoType,
    })
    @IsEnum(PromoType)
    @IsOptional()
    type?: PromoType;

    @ApiProperty({
        description: 'Package ID',
        example: 1,
        required: false,
        type: Number,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    @ValidateIf((o) => o.type === PromoType.package)
    packageId?: number;

    @ApiProperty({
        description: 'Max amount for discount',
        example: 1000,
        required: true,
        type: Number,
    })
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    maxAmountForDiscount: number;
}
