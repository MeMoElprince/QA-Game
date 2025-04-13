import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    Query,
    BadRequestException,
    UploadedFiles,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import {
    CreateQuestionDto,
    QuestionQueryDto,
    UpdateQuestionDto,
} from './dto/question.dto';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('Question')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    if (
                        file.fieldname !== 'questionFile' &&
                        file.fieldname !== 'answerFile'
                    )
                        cb(
                            new BadRequestException(
                                `Incorrect file field: ${file.fieldname}`,
                            ),
                            null,
                        );
                    const folder =
                        file.fieldname === 'questionFile'
                            ? 'questions'
                            : 'answers';
                    const dirPath = `${UPLOAD_PATH}/${folder}/tmp`;
                    if (!existsSync(dirPath))
                        mkdirSync(dirPath, { recursive: true });
                    cb(null, dirPath);
                },
                filename: (req, file, cb) => {
                    cb(
                        null,
                        `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`,
                    );
                },
            }),
        }),
    )
    @ApiOperation({
        summary: 'Create a new question for ADMIN and MANAGER',
        description: 'This will create a new main question',
    })
    async create(
        @Body() createQuestionDto: CreateQuestionDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        // Extract files based on fieldname
        const questionFile = files.find(
            (file) => file.fieldname === 'questionFile',
        );
        const answerFile = files.find(
            (file) => file.fieldname === 'answerFile',
        );

        // Store file paths in DTO instead of full file object
        createQuestionDto.questionFile = questionFile || null;
        createQuestionDto.answerFile = answerFile || null;
        return this.questionService.create(createQuestionDto);
    }

    @Get()
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
    @ApiOperation({
        summary: 'Get all questions for ADMIN and MANAGER',
        description: 'This will return all questions',
    })
    async findAll(@Query() questionQueryDto: QuestionQueryDto) {
        return this.questionService.findAll(questionQueryDto);
    }

    @Patch(':id')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    console.log({ file });
                    if (
                        file.fieldname !== 'questionFile' &&
                        file.fieldname !== 'answerFile'
                    )
                        cb(
                            new BadRequestException(
                                `Incorrect file field: ${file.fieldname}`,
                            ),
                            null,
                        );
                    const folder =
                        file.fieldname === 'questionFile'
                            ? 'questions'
                            : 'answers';
                    const dirPath = `${UPLOAD_PATH}/${folder}/tmp`;
                    if (!existsSync(dirPath))
                        mkdirSync(dirPath, { recursive: true });
                    cb(null, dirPath);
                },
                filename: (req, file, cb) => {
                    cb(
                        null,
                        `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`,
                    );
                },
            }),
        }),
    )
    @ApiOperation({
        summary: 'Update a question by id for ADMIN and MANAGER',
        description: 'This will update a question by id',
    })
    update(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        // Extract files based on fieldname
        const questionFile = files.find(
            (file) => file.fieldname === 'questionFile',
        );
        const answerFile = files.find(
            (file) => file.fieldname === 'answerFile',
        );

        // Store file paths in DTO instead of full file object
        updateQuestionDto.questionFile = questionFile || null;
        updateQuestionDto.answerFile = answerFile || null;

        console.log({ questionFile, answerFile });
        return this.questionService.update(+id, updateQuestionDto);
    }

    @Delete(':id')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
    @ApiOperation({
        summary: 'Delete a question by id for ADMIN and MANAGER',
        description: 'This will delete a question by id',
    })
    remove(@Param('id') id: string) {
        return this.questionService.remove(+id);
    }
}
