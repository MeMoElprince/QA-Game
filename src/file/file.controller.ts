import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('File')
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Delete(':fileId')
    @ApiOperation({
        summary: 'Delete file',
        description: 'This endpoint deletes a file by its ID.',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
    async deleteFile(@Param('fileId') fileId: number) {
        return this.fileService.deleteFile(+fileId);
    }
}
