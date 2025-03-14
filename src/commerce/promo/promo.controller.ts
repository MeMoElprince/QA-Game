import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RoleEnum } from '@prisma/client';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { PromoQueryDto } from './dto/get-promo-query.dto';
import { GetUser } from 'src/core/auth/decorator/get-user.decorator';

@ApiTags('Promo')
@Controller('promos')
export class PromoController {
    constructor(private readonly promoService: PromoService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create promo',
        description: 'Create a new promo code, only for admin ',
    })
    create(@Body() createPromoDto: CreatePromoDto) {
        return this.promoService.create(createPromoDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get all promo',
        description: 'Get all promo codes, only for admin ',
    })
    findAll(@Query() promoQueryDto: PromoQueryDto) {
        console.log({ promoQueryDto });
        return this.promoService.findAll(promoQueryDto);
    }

    @Get(':code')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get promo by code',
        description: 'Get promo code by code, only for admin',
    })
    @ApiParam({
        name: 'code',
        description: 'Promo code',
        example: 'PROMO20',
        required: true,
        type: String,
    })
    findOne(@Param('code') code: string) {
        return this.promoService.findOne(code);
    }

    @Patch(':code')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update promo by code',
        description: 'Update promo code by code, only for admin ',
    })
    @ApiParam({
        name: 'code',
        description: 'Promo code',
        example: 'PROMO20',
        required: true,
        type: String,
    })
    update(
        @Param('code') code: string,
        @Body() updatePromoDto: UpdatePromoDto,
    ) {
        return this.promoService.update(code, updatePromoDto);
    }

    @Delete(':code')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete promo by code',
        description: 'Delete promo code by code, only for admin',
    })
    @ApiParam({
        name: 'code',
        description: 'Promo code',
        example: 'PROMO20',
        required: true,
        type: String,
    })
    remove(@Param('code') code: string) {
        return this.promoService.remove(code);
    }

    @Get(':code/check')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Apply promo code',
        description: 'Apply promo code to cart',
    })
    checkPromoCode(@Param('code') code: string, @GetUser('id') userId: number) {
        console.log({ code, userId });
        return this.promoService.checkPromoCode(+userId, code);
    }
}
