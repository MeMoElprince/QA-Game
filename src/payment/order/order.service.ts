import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { PromoService } from 'src/commerce/promo/promo.service';
import { DiscountUnit, OrderStatus, User } from '@prisma/client';
import { EdfaPaymentService } from 'src/payment/edfa-payment/edfa-payment.service';
import { ConfirmCheckoutOrderDto } from './dto/confirm-checkout-order.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckoutPackageDto } from './dto/checkout-event.dto';
import { EdfaWebhookDto } from '../edfa-payment/dto/edfa-webhook.dto';

@Injectable()
export class OrderService {
    constructor(
        private prismaService: PrismaService,
        private promoService: PromoService,
        private edfaPaymentService: EdfaPaymentService,
    ) {}

    async checkoutPackage(
        user: User,
        checkoutPackage: CheckoutPackageDto,
        ip: string,
    ) {
        const userId = user.id;
        const currentUser = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!currentUser.phoneNumber)
            throw new BadRequestException(
                'Please add your phone number to checkout the package',
            );
        if (!currentUser.address)
            throw new BadRequestException(
                'Please add your address to checkout the package',
            );
        if (!currentUser.city)
            throw new BadRequestException(
                'Please add your city to checkout the package',
            );
        if (!currentUser.zipCode)
            throw new BadRequestException(
                'Please add your zip code to checkout the package',
            );
        const pack = await this.prismaService.package.findUnique({
            where: {
                id: checkoutPackage.packageId,
            },
            select: {
                id: true,
                price: true,
            },
        });
        if (!pack) throw new NotFoundException('Package not found');
        const totalPrice = pack.price;
        let finalPrice = totalPrice;
        let promoId = undefined;
        if (checkoutPackage.promoCode) {
            const promo = await this.promoService.checkPromoCode(
                userId,
                checkoutPackage.promoCode,
            );
            if (promo.discountUnit === DiscountUnit.PERCENTAGE)
                finalPrice =
                    totalPrice -
                    Math.min(
                        (totalPrice * promo.discount) / 100,
                        promo.maxAmountForDiscount,
                    );
            else if (promo.discountUnit === DiscountUnit.MONEY)
                finalPrice =
                    totalPrice -
                    Math.min(promo.discount, promo.maxAmountForDiscount);
            else throw new BadRequestException('Invalid discount unit');
            if (finalPrice < 0) finalPrice = 0;
            promoId = promo.id;
        }
        const createOrderDto = new CreateOrderDto({
            packageId: checkoutPackage.packageId,
            userId,
            finalPrice,
            totalPrice,
            status: OrderStatus.PENDING,
            promoId,
        });
        const order = await this.create(createOrderDto);
        // TODO final price to be increased with taxes
        if (order.finalPrice === 0)
            return await this.handleOrderPaidSuccess(order.id);
        const usernames = currentUser.name.split(' ');
        const sz = usernames.length;
        const firstName = usernames[0];
        const lastName = usernames[sz - 1];
        console.log({ address: currentUser.address });
        const checkout = await this.edfaPaymentService.checkout({
            amount: order.finalPrice,
            description: `Checkout package ${pack.id}`,
            orderNumber: `${order.id}`,
            firstName,
            lastName,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            ip,
            address: currentUser.address,
            city: currentUser.city,
            zip: currentUser.zipCode,
        });

        return checkout;
    }

    async create(createOrderDto: CreateOrderDto) {
        const pack = await this.prismaService.package.findUnique({
            where: {
                id: createOrderDto.packageId,
            },
            select: {
                id: true,
            },
        });
        if (!pack) throw new NotFoundException('package not found or deleted');
        const { ...rest } = createOrderDto;
        const order = await this.prismaService.order.create({
            data: {
                ...rest,
            },
        });
        return order;
    }

    async findAll(
        userId: number,
        orderQueryDto: OrderQueryDto,
        isAdmin: boolean,
    ) {
        const { limit = 10, page = 1, ...rest } = orderQueryDto;
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const where = { ...rest };
        if (!isAdmin) where.userId = userId;
        const orders = await this.prismaService.order.findMany({
            where,
            take,
            skip,
            include: {
                Package: true,
                Promo: true,
                User: true,
            },
        });
        return orders;
    }

    async handleEdfaWebhook(body: EdfaWebhookDto) {
        console.log('Webhook body:', body);
        const { order_id: orderId, trans_id: transactionId } = body;
        if (!orderId) throw new BadRequestException('Order ID is required');
        const order = await this.prismaService.order.findUnique({
            where: {
                id: Number(orderId),
            },
        });
        if (!order) throw new NotFoundException('Order not found');
        await this.confirmOrder({
            orderId: Number(orderId),
            transactionId,
        });
    }

    async handleOrderPaidSuccess(orderId: number) {
        if (!orderId) throw new BadRequestException('Order ID is required');
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
            },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.status === OrderStatus.COMPLETED)
            throw new BadRequestException('Order is already paid');
        return await this.prismaService.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: OrderStatus.COMPLETED,
            },
        });
    }

    async handleOrderPaidFailed(orderId: number) {
        if (!orderId) throw new BadRequestException('Order ID is required');
        const order = await this.prismaService.order.findUnique({
            where: {
                id: orderId,
            },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (order.status === OrderStatus.CANCELLED)
            throw new BadRequestException('Order is already cancelled');
        return await this.prismaService.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: OrderStatus.CANCELLED,
            },
        });
    }

    async confirmOrder(confirmCheckoutOrderDto: ConfirmCheckoutOrderDto) {
        const paymentStatus = await this.edfaPaymentService.checkPaymentStatus(
            confirmCheckoutOrderDto.transactionId,
            `${confirmCheckoutOrderDto.orderId}`,
        );
        let result = null;
        if (paymentStatus.responseBody.status === 'decline') {
            result = await this.handleOrderPaidFailed(
                confirmCheckoutOrderDto.orderId,
            );
        }
        if (paymentStatus.responseBody.status === 'settled') {
            result = await this.handleOrderPaidSuccess(
                confirmCheckoutOrderDto.orderId,
            );
        }
        return result;
    }

    // orders with 20 minutes creation and not paid and pending status should be handled
    @Cron(CronExpression.EVERY_10_MINUTES)
    async captureIncompleteOrders() {
        const orders = await this.prismaService.order.findMany({
            where: {
                status: OrderStatus.PENDING,
                createdAt: {
                    lt: new Date(Date.now() - 20 * 60 * 1000), // 20 mintues
                },
            },
        });
        console.log('Incomplete orders:', orders);
        if (!orders.length) return;
        const updatedOrders = await this.prismaService.order.updateMany({
            where: {
                id: {
                    in: orders.map((o) => o.id),
                },
            },
            data: {
                status: OrderStatus.CANCELLED,
            },
        });
        console.log(`Updated ${updatedOrders.count} orders`);
        return updatedOrders;
    }
}
