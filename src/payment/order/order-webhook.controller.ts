import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Order Webhook')
@Controller('Order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('webhook/edfapay')
    @ApiConsumes()
    @ApiOperation({
        summary: 'EDFA Pay Webhook',
        description: 'Handle EDFA Pay Webhook',
    })
    edfaWebhook(@Body() body: any) {
        return this.orderService.handleEdfaWebhook(body);
    }
}
