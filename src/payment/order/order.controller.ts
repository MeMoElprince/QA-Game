import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/core/auth/decorator/get-user.decorator';
import { OrderQueryDto } from './dto/order-query.dto';
import { CheckoutPackageDto } from './dto/checkout-event.dto';
import { RoleEnum, User } from '@prisma/client';
import { Request } from 'express';
import { ConfirmCheckoutOrderDto } from './dto/confirm-checkout-order.dto';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get all orders',
        description: 'Get all orders from the database',
    })
    findAll(@GetUser() user: User, @Query() orderQueryDto: OrderQueryDto) {
        return this.orderService.findAll(
            +user.id,
            orderQueryDto,
            user.role === RoleEnum.ADMIN,
        );
    }

    @Post('checkout')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Checkout a package',
        description: 'Checkout a package and create an order',
    })
    checkoutPackage(
        @GetUser() user: User,
        @Body() checkoutPackageDto: CheckoutPackageDto,
        @Req() req: Request,
    ) {
        return this.orderService.checkoutPackage(
            user,
            checkoutPackageDto,
            req.ip,
        );
    }

    @Patch('confirm-edfa-pay-order')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Confirm EdfaPay Event order',
        description: 'Confirm EdfaPay order for package',
    })
    confirmEdfaPayOrder(@Body() confirmOrderDto: ConfirmCheckoutOrderDto) {
        return this.orderService.confirmOrder(confirmOrderDto);
    }
}
