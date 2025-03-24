import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { CreateGameDto, GameQueryDto, UpdateGameDto } from './dto/game.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma, RoleEnum, User } from '@prisma/client';

@Injectable()
export class GameService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, createGameDto: CreateGameDto) {
        // create game then create 6 categories then create for each category 6 questions 2 of 200 and 2 of 400 and 2 of 600
        // then create teams provided in the createGameDto
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new BadRequestException('User not found');
        if (!user.ownedGameCount)
            throw new ConflictException(
                "You don't have any games left, buy one",
            );
        const newGame = await this.prismaService.$transaction(
            async (prisma) => {
                const categories = await prisma.category.findMany({
                    where: {
                        id: {
                            in: createGameDto.categoriesId,
                        },
                    },
                    select: {
                        name: true,
                        id: true,
                        Question: {
                            take: 0,
                        },
                    },
                });
                if (categories.length !== createGameDto.categoriesId.length)
                    throw new BadRequestException(
                        `There are ${createGameDto.categoriesId.length - categories.length} categories that do not exist`,
                    );

                for (const category of categories) {
                    const scores = [200, 400, 600];
                    for (const score of scores) {
                        const questions = await prisma.question.findMany({
                            where: {
                                categoryId: category.id,
                                score,
                                GameQuestion: {
                                    none: {
                                        Game: {
                                            userId: userId,
                                        },
                                    },
                                },
                            },
                            take: 2,
                        });
                        if (questions.length < 2)
                            throw new ConflictException(
                                `Category ${category.name} does not have enough questions for score ${score}`,
                            );
                        category.Question.push(...questions);
                    }
                }

                const game = await prisma.game.create({
                    data: {
                        name: createGameDto.name,
                        Team: {
                            createMany: {
                                data: createGameDto.teams.map((team, idx) => {
                                    return {
                                        name: team.name,
                                        order: idx,
                                        playerCount: team.playerCount,
                                        score: 0,
                                    };
                                }),
                            },
                        },
                        GameCategory: {
                            createMany: {
                                data: categories.map((category) => {
                                    return {
                                        categoryId: category.id,
                                    };
                                }),
                            },
                        },
                        User: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                });

                const gameCategories = await prisma.gameCategory.findMany({
                    where: {
                        gameId: game.id,
                    },
                    select: {
                        id: true,
                        categoryId: true,
                    },
                });

                for (const gameCategory of gameCategories) {
                    const categoryQuestions = categories.find(
                        (category) => category.id === gameCategory.categoryId,
                    ).Question;
                    await prisma.gameQuestion.createMany({
                        data: categoryQuestions.map((question) => {
                            return {
                                gameId: game.id,
                                gameCategoryId: gameCategory.id,
                                questionId: question.id,
                            };
                        }),
                    });
                }

                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        ownedGameCount: {
                            decrement: 1,
                        },
                    },
                });

                return game;
            },
        );
        return newGame;
    }

    async findAll(user: User, gameQueryDto: GameQueryDto) {
        const { page = 1, limit = 20, ...filter } = gameQueryDto;
        const take = Math.min(limit, 20);
        const skip = (page - 1) * take;
        const where: Prisma.GameWhereInput = filter;

        if (user.role !== RoleEnum.ADMIN) where.userId = user.id;

        const games = await this.prismaService.game.findMany({
            where,
            take,
            skip,
            include: {
                GameCategory: {
                    select: {
                        categoryId: true,
                    },
                },
                Team: {
                    select: {
                        id: true,
                        name: true,
                        playerCount: true,
                        score: true,
                    },
                },
            },
        });
        const total = await this.prismaService.game.count({
            where,
        });
        return {
            data: games,
            totalDocs: total,
        };
    }

    async update(id: number, updateGameDto: UpdateGameDto) {
        return `This action updates a #${id} game`;
    }

    async remove(id: number) {
        return `This action removes a #${id} game`;
    }
}
