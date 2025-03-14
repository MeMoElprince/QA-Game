import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { PromoQueryDto } from './dto/get-promo-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromoService {
    constructor(private prismaService: PrismaService) {}

    async create(createPromoDto: CreatePromoDto) {
        const promo = await this.prismaService.promo.create({
            data: createPromoDto,
        });
        return promo;
    }

    async findAll(promoQueryDto: PromoQueryDto) {
        const { page = 1, limit = 25, ...rest } = promoQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * limit;
        const where: Prisma.PromoWhereInput = { ...rest };
        const promos = await this.prismaService.promo.findMany({
            where,
            skip,
            take,
        });
        const totalDocs = await this.prismaService.promo.count({ where });
        return { data: promos, totalDocs };
    }

    async findOne(code: string) {
        const promo = await this.prismaService.promo.findUnique({
            where: {
                code,
            },
        });
        if (!promo) throw new NotFoundException('Promo not found');
        return promo;
    }

    async update(code: string, updatePromoDto: UpdatePromoDto) {
        const promo = await this.prismaService.promo.findUnique({
            where: {
                code,
            },
        });
        if (!promo) throw new NotFoundException('Promo not found');
        return await this.prismaService.promo.update({
            where: {
                code,
            },
            data: updatePromoDto,
        });
    }

    async remove(code: string) {
        const promo = await this.prismaService.promo.findUnique({
            where: {
                code,
            },
        });
        if (!promo) throw new NotFoundException('Promo not found');
        return await this.prismaService.promo.delete({
            where: {
                code,
            },
        });
    }

    async checkPromoCode(userId: number, code: string) {
        const promo = await this.prismaService.promo.findUnique({
            where: {
                code,
                active: true,
                startDate: {
                    lte: new Date(),
                },
            },
            include: {
                PromoUser: {
                    where: {
                        userId,
                    },
                },
            },
        });

        if (!promo) throw new NotFoundException('Promo not found');
        if (promo.endDate < new Date())
            throw new ForbiddenException('Promo has expired');
        if (promo.maxUsage <= promo.usedCount)
            throw new ForbiddenException('Promo has reached its maximum usage');
        if (
            promo.PromoUser.length > 0 &&
            promo.PromoUser[0].usageCount >= promo.userLimit
        )
            throw new ForbiddenException(
                'Promo has reached its maximum usage for this user',
            );

        delete promo.usedCount;
        delete promo.maxUsage;
        delete promo.startDate;
        delete promo.endDate;
        delete promo.active;
        return promo;
    }
}
