import { BadRequestException } from '@nestjs/common';
import { FileTypeEnum } from '@prisma/client';

export function getFileCategoryFromMimetype(mimetype: string | false): FileTypeEnum {
    const fileType = mimetype;
    if (!fileType) {
        throw new BadRequestException('نوع الملف غير مدعوم');
    }
    let fileCategory: FileTypeEnum;
    if (fileType.startsWith('image/')) fileCategory = FileTypeEnum.IMAGE;
    else if (fileType.startsWith('video/')) fileCategory = FileTypeEnum.VIDEO;
    else if (
        fileType.startsWith('application/') ||
        fileType.startsWith('text/')
    )
        fileCategory = FileTypeEnum.DOCUMENT;
    else throw new BadRequestException('نوع الملف غير مدعوم');
    return fileCategory;
}
