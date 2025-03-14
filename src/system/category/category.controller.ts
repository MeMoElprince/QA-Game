import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UseGuards,
    UploadedFile,
    Query,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { RoleEnum } from '@prisma/client';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: `${UPLOAD_PATH}/categories/tmp`, // Specify the folder to store files
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image')) {
                    return callback(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new category',
        description: 'Create a new category with image, by admin',
    })
    create(
        @Body() createCategoryDto: CreateCategoryDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        createCategoryDto.image = file;
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all categories',
        description: 'Get all categories',
    })
    findAll(@Query() pagination: PaginationDto) {
        return this.categoryService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a category',
        description: 'Get a category by id',
    })
    @ApiParam({
        name: 'id',
        description: 'The id of the category',
        type: Number,
        required: true,
    })
    findOne(@Param('id') id: number) {
        return this.categoryService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update a category',
        description: 'Update a category by id',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: `${UPLOAD_PATH}/categories/tmp`, // Specify the folder to store files
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image')) {
                    return callback(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    @ApiConsumes('multipart/form-data')
    update(
        @Param('id') id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        updateCategoryDto.image = file;
        return this.categoryService.update(+id, updateCategoryDto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a category',
        description: 'Delete a category by id',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiParam({
        name: 'id',
        description: 'The id of the category',
        type: Number,
        required: true,
    })
    remove(@Param('id') id: number) {
        return this.categoryService.remove(+id);
    }
}
