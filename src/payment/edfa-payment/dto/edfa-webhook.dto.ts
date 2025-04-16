import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EdfaWebhookDto {
    @ApiProperty({
        description: 'The order ID from Edfa payment gateway',
        example: '10',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    order_id: string;

    @ApiProperty({
        description: 'The transaction ID from Edfa payment gateway',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    trans_id: string;

    id?: string;
    order_number?: string;
    type?: string;
    hash?: string;
    currency?: string;
    amount?: string;
    status?: string;

    @ApiProperty({
        description: 'The result of the transaction',
        example: 'SUCCESS',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    result: string;

    @ApiProperty({
        description: 'The status of the transaction',
        example: 'SALE',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    action: string;

    constructor(data: {
        order_id: string;
        trans_id: string;
        result: string;
        action: string;
    }) {
        Object.assign(this, data);
    }
}
