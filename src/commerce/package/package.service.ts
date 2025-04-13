import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PackageService {
    constructor(private prismaService: PrismaService) {}

    async create(createPackageDto: CreatePackageDto) {
        const pack = await this.prismaService.package.create({
            data: createPackageDto,
        });
        return pack;
    }

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 20 } = pagination;
        const take = Math.min(50, limit);
        const skip = (page - 1) * take;
        const packages = await this.prismaService.package.findMany({
            take,
            skip,
        });
        const total = await this.prismaService.package.count();
        return {
            data: packages,
            totalDocs: total,
        };
    }

    async findOne(id: number) {
        const pack = await this.prismaService.package.findUnique({
            where: {
                id,
            },
        });
        if (!pack) throw new NotFoundException('Package not found');
        return pack;
    }

    async update(id: number, updatePackageDto: UpdatePackageDto) {
        const oldPackage = await this.prismaService.package.findUnique({
            where: {
                id,
            },
        });
        if (!oldPackage) throw new NotFoundException('Package not found');

        const pack = await this.prismaService.$transaction(async (prisma) => {
            return await prisma.package.update({
                where: {
                    id,
                },
                data: updatePackageDto,
            });
        });
        return pack;
    }

    async remove(id: number) {
        const pack = await this.prismaService.package.findUnique({
            where: {
                id,
            },
        });
        if (!pack) throw new NotFoundException('Package not found');
        await this.prismaService.package.delete({
            where: {
                id,
            },
        });
        return pack;
    }
}
