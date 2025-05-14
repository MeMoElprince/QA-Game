import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class FileService {
    constructor(private readonly prismaService: PrismaService) {}

    async deleteFile(id: number) {
        const file = await this.prismaService.file.findUnique({
            where: {
                id,
            },
        });
        if (!file) throw new NotFoundException('الملف غير موجود');
        const pathToRemove = join(UPLOAD_PATH, file.path);
        await this.prismaService.file.delete({
            where: {
                id,
            },
        });
        if (existsSync(pathToRemove)) unlinkSync(pathToRemove);
        return file;
    }
}
