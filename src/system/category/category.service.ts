import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { join } from 'path';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import * as mimeType from 'mime-types';
import { getFileCategoryFromMimetype } from 'src/common/utils/file-category';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { changeFileLocation } from 'src/common/utils/move-file';

@Injectable()
export class CategoryService {
    constructor(private prismaService: PrismaService) {}

    async create(createCategoryDto: CreateCategoryDto) {
        const { image, ...rest } = createCategoryDto;
        if (!image)
            throw new BadRequestException('Image is required for category');
        console.log({ ...rest });
        if (rest.parentCategoryId === 0) delete rest.parentCategoryId;
        const category = await this.prismaService.$transaction(
            async (prisma) => {
                const img = await prisma.file.create({
                    data: {
                        path: join('categories', `${image.filename}`),
                        name: image.filename,
                        size: image.size,
                        // TODO get mime type from buffer
                        type: getFileCategoryFromMimetype(
                            mimeType.lookup(image.originalname),
                        ),
                    },
                });
                const newCategory = await prisma.category.create({
                    data: {
                        ...rest,
                        imageId: img.id,
                    },
                });
                changeFileLocation(
                    join('categories', 'tmp'),
                    'categories',
                    image.filename,
                );
                return newCategory;
            },
        );
        return category;
    }

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const categories = await this.prismaService.category.findMany({
            take: limit,
            skip,
        });
        const total = await this.prismaService.category.count();
        return {
            data: categories,
            totalDocs: total,
        };
    }

    async findOne(id: number) {
        const category = await this.prismaService.category.findUnique({
            where: {
                id,
            },
            include: {
                Image: true,
            },
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        const { image, ...rest } = updateCategoryDto;
        if (rest.parentCategoryId === 0) delete rest.parentCategoryId;
        const oldCategory = await this.prismaService.category.findUnique({
            where: {
                id,
            },
            include: {
                Image: true,
            },
        });
        if (!oldCategory) throw new NotFoundException('Category not found');
        const oldImage = oldCategory.Image;
        const pathToRemove = join(UPLOAD_PATH, oldImage.path);
        let isRemove = false;
        if (image) {
            const newFolderPath = join(UPLOAD_PATH, 'categories');
            const newFilePath = join(newFolderPath, image.filename);
            const oldFilePath = join(
                UPLOAD_PATH,
                'categories',
                'tmp',
                image.filename,
            );
            if (!existsSync(newFolderPath))
                mkdirSync(newFolderPath, { recursive: true });
            renameSync(oldFilePath, newFilePath);
            isRemove = true;
        }
        const category = await this.prismaService.$transaction(
            async (prisma) => {
                if (isRemove) {
                    await prisma.file.update({
                        where: {
                            id: oldImage.id,
                        },
                        data: {
                            path: join('categories', `${image.filename}`),
                            name: image.filename,
                            size: image.size,
                            type: getFileCategoryFromMimetype(
                                mimeType.lookup(image.originalname),
                            ),
                        },
                    });
                }
                return await prisma.category.update({
                    where: {
                        id,
                    },
                    data: {
                        ...rest,
                    },
                });
            },
        );
        if (isRemove && existsSync(pathToRemove)) unlinkSync(pathToRemove);
        return category;
    }

    async remove(id: number) {
        const category = await this.prismaService.category.findUnique({
            where: {
                id,
            },
            include: {
                Image: true,
            },
        });
        if (!category) throw new NotFoundException('Category not found');
        const pathToRemove = join(UPLOAD_PATH, category.Image.path);
        await this.prismaService.category.delete({
            where: {
                id,
            },
        });
        if (existsSync(pathToRemove)) unlinkSync(pathToRemove);
        return category;
    }
}
