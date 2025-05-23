import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleEnum, UserCreationMethodEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class UserRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getUserByEmail(
        email: string,
        prisma: PrismaService = this.prismaService,
    ) {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        return user;
    }

    async getUserById(id: number, prisma: PrismaService = this.prismaService) {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        return user;
    }

    async getUserByUsername(
        username: string,
        prisma: PrismaService = this.prismaService,
    ) {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });
        return user;
    }

    async getUserByPhoneNumber(
        phoneNumber: string,
        prisma: PrismaService = this.prismaService,
    ) {
        const user = await prisma.user.findUnique({
            where: {
                phoneNumber,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async CreateGoogleUser(
        data: Prisma.UserCreateInput,
        prisma: PrismaService = this.prismaService,
    ) {
        data.role = RoleEnum.USER;
        data.userCreationMethod = UserCreationMethodEnum.GOOGLE;
        return prisma.user.create({
            data,
        });
    }

    async createUser(
        data: Prisma.UserCreateInput,
        prisma: PrismaService = this.prismaService,
    ) {
        data.role = RoleEnum.USER;
        return prisma.user.create({
            data,
        });
    }

    async createManager(
        data: Prisma.UserCreateInput,
        prisma: PrismaService = this.prismaService,
    ) {
        data.role = RoleEnum.MANAGER;
        return prisma.user.create({
            data,
        });
    }

    async createAdmin(
        data: Prisma.UserCreateInput,
        prisma: PrismaService = this.prismaService,
    ) {
        data.role = RoleEnum.ADMIN;
        return prisma.user.create({
            data,
        });
    }

    async createUserByRole(
        data: Prisma.UserCreateInput,
        prisma: PrismaService = this.prismaService,
    ) {
        return prisma.user.create({
            data,
        });
    }

    async recoverUser(userId: number, UserUpdateInput: Prisma.UserUpdateInput) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        if (!user.isDeleted)
            throw new BadRequestException('User is not deleted');
        const updatedUser = await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                ...UserUpdateInput,
                isDeleted: false,
                verified: false,
            },
        });
        return updatedUser;
    }
}
