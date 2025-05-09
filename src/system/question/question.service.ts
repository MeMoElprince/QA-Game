import { Injectable, NotFoundException } from '@nestjs/common';
import {
    CreateQuestionDto,
    QuestionQueryDto,
    UpdateQuestionDto,
} from './dto/question.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { changeFileLocation } from 'src/common/utils/move-file';
import mimeType from 'mime-types';
import { getFileCategoryFromMimetype } from 'src/common/utils/file-category';
import { existsSync, unlinkSync } from 'fs';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';

@Injectable()
export class QuestionService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(createQuestionDto: CreateQuestionDto) {
        const { questionFile, answerFile, categoryId, ...rest } =
            createQuestionDto;

        const newQuestion = await this.prismaService.$transaction(
            async (prisma) => {
                const data: Prisma.QuestionCreateInput = {
                    ...rest,
                    Category: {
                        connect: {
                            id: categoryId,
                        },
                    },
                };

                if (questionFile) {
                    const questionFilePath = changeFileLocation(
                        join('questions', 'tmp'),
                        'questions',
                        questionFile.filename,
                    );
                    data.QuestionFile = {
                        create: {
                            name: questionFile.filename,
                            path: questionFilePath,
                            size: questionFile.size,
                            type: getFileCategoryFromMimetype(
                                mimeType.lookup(questionFile.originalname),
                            ),
                        },
                    };
                }

                if (answerFile) {
                    const answerFilePath = changeFileLocation(
                        join('answers', 'tmp'),
                        'answers',
                        answerFile.filename,
                    );
                    data.AnswerFile = {
                        create: {
                            name: answerFile.filename,
                            path: answerFilePath,
                            size: answerFile.size,
                            type: getFileCategoryFromMimetype(
                                mimeType.lookup(answerFile.originalname),
                            ),
                        },
                    };
                }
                const question = await prisma.question.create({
                    data,
                });
                return question;
            },
        );
        return newQuestion;
    }

    async findAll(questionQueryDto: QuestionQueryDto) {
        const { page = 1, limit = 20, ...filter } = questionQueryDto;
        const take = Math.min(limit, 20);
        const skip = (page - 1) * take;
        const where: Prisma.QuestionWhereInput = filter;
        const questions = await this.prismaService.question.findMany({
            where,
            take,
            skip,
            include: {
                Category: true,
                QuestionFile: true,
                AnswerFile: true,
            },
        });
        const total = await this.prismaService.question.count({
            where,
        });
        return {
            data: questions,
            totalDocs: total,
        };
    }

    async update(id: number, updateQuestionDto: UpdateQuestionDto) {
        const { questionFile, answerFile, categoryId, ...rest } =
            updateQuestionDto;
        const data: Prisma.QuestionUpdateInput = {
            ...rest,
            Category: categoryId
                ? {
                      connect: {
                          id: categoryId,
                      },
                  }
                : undefined,
        };

        if (questionFile) {
            const questionFilePath = changeFileLocation(
                join('questions', 'tmp'),
                'questions',
                questionFile.filename,
            );
            data.QuestionFile = {
                upsert: {
                    create: {
                        name: questionFile.filename,
                        path: questionFilePath,
                        size: questionFile.size,
                        type: getFileCategoryFromMimetype(
                            mimeType.lookup(questionFile.originalname),
                        ),
                    },
                    update: {
                        name: questionFile.filename,
                        path: questionFilePath,
                        size: questionFile.size,
                        type: getFileCategoryFromMimetype(
                            mimeType.lookup(questionFile.originalname),
                        ),
                    },
                },
            };
        }

        if (answerFile) {
            const answerFilePath = changeFileLocation(
                join('answers', 'tmp'),
                'answers',
                answerFile.filename,
            );
            data.AnswerFile = {
                upsert: {
                    create: {
                        name: answerFile.filename,
                        path: answerFilePath,
                        size: answerFile.size,
                        type: getFileCategoryFromMimetype(
                            mimeType.lookup(answerFile.originalname),
                        ),
                    },
                    update: {
                        name: answerFile.filename,
                        path: answerFilePath,
                        size: answerFile.size,
                        type: getFileCategoryFromMimetype(
                            mimeType.lookup(answerFile.originalname),
                        ),
                    },
                },
            };
        }

        const updatedQuestion = await this.prismaService.question.update({
            where: {
                id,
            },
            data,
        });
        return updatedQuestion;
    }

    async remove(id: number) {
        const question = await this.prismaService.question.findUnique({
            where: {
                id,
            },
            include: {
                QuestionFile: true,
                AnswerFile: true,
            },
        });
        if (!question) throw new NotFoundException('السؤال غير موجود');
        const pathToRemove = join(UPLOAD_PATH, question.QuestionFile.path);
        const pathToRemoveAnswer = join(UPLOAD_PATH, question.AnswerFile.path);
        await this.prismaService.question.delete({
            where: {
                id,
            },
        });
        if (existsSync(pathToRemove)) unlinkSync(pathToRemove);
        if (existsSync(pathToRemoveAnswer)) unlinkSync(pathToRemoveAnswer);
        return question;
    }
}
