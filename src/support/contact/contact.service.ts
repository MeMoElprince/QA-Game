import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ContactService {
    constructor(private prismaService: PrismaService) {}

    async create(createContactDto: CreateContactDto) {
        const contact = await this.prismaService.contact.create({
            data: createContactDto,
        });
        return contact;
    }

    async findAll(pagination: PaginationDto) {
        const page = pagination.page || 1;
        const limit = Math.min(pagination.limit || 25, 50);
        const skip = (page - 1) * limit;
        const contacts = await this.prismaService.contact.findMany({
            take: limit,
            skip,
        });
        return contacts;
    }

    async findOne(id: number) {
        const contact = await this.prismaService.contact.findUnique({
            where: {
                id,
            },
        });
        if (!contact) {
            throw new NotFoundException('Contact not found');
        }
        return contact;
    }
}
