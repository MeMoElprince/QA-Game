import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import {
    AdminCreateGameDto,
    CreateGameDto,
    GameQueryDto,
    MarkHelperAsUsedDto,
    UpdateGameDto,
} from './dto/game.dto';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    GameStatusEnum,
    Prisma,
    Question,
    RoleEnum,
    User,
} from '@prisma/client';
import { LuckWheelEnum } from './enum/luck-wheel.enum';

@Injectable()
export class GameService {
    constructor(private readonly prismaService: PrismaService) {}

    async updateTeamScore(
        gameId: number,
        teamId: number,
        userId: number,
        score: number,
    ) {
        const team = await this.prismaService.team.findUnique({
            where: {
                id: teamId,
                gameId,
            },
            include: {
                Game: true,
            },
        });
        if (!team) throw new BadRequestException('Team not found in game');
        if (team.Game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to update this game',
            );
        return await this.prismaService.team.update({
            where: {
                id: teamId,
            },
            data: {
                score,
            },
        });
    }

    async finishGame(gameId: number, userId: number) {
        const game = await this.prismaService.game.findUnique({
            where: {
                id: gameId,
            },
        });
        if (!game) throw new BadRequestException('Game not found');
        if (game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to update this game',
            );
        return await this.prismaService.game.update({
            where: {
                id: gameId,
            },
            data: {
                status: GameStatusEnum.FINISHED,
            },
        });
    }

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
                        const questions = await prisma.$queryRaw<
                            Question[]
                        >`SELECT id FROM "Question"
                        WHERE "categoryId" = ${category.id}
                            AND "score" = ${score}
                        ORDER BY RANDOM()
                        LIMIT 2`;
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

    async userReplayGame(
        userId: number,
        gameId: number,
        createGameDto: CreateGameDto,
    ) {
        const existingGame = await this.prismaService.game.findUnique({
            where: {
                id: gameId,
                userId,
            },
        });
        if (!existingGame)
            throw new BadRequestException(
                'Game not found or not owned by user',
            );

        // no need to check if he owns game

        // clear all game questions, game categories and teams
        await this.prismaService.$transaction(async (prisma) => {
            await prisma.gameQuestion.deleteMany({
                where: {
                    gameId,
                },
            });
            await prisma.gameCategory.deleteMany({
                where: {
                    gameId,
                },
            });
            await prisma.team.deleteMany({
                where: {
                    gameId,
                },
            });

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
                    const questions = await prisma.$queryRaw<
                        Question[]
                    >`SELECT id FROM "Question"
                        WHERE "categoryId" = ${category.id}
                            AND "score" = ${score}
                        ORDER BY RANDOM()
                        LIMIT 2`;

                    if (questions.length < 2)
                        throw new ConflictException(
                            `Category ${category.name} does not have enough questions for score ${score}`,
                        );
                    category.Question.push(...questions);
                }
            }

            const game = await prisma.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    rePlayCount: {
                        increment: 1,
                    },
                    status: GameStatusEnum.PLAYING,
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
        });
        return existingGame;
    }

    async createFreeGame(adminCreateGameDto: AdminCreateGameDto) {
        const { userId, ...createGameDto } = adminCreateGameDto;
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new BadRequestException('User not found');
        console.log({ user });
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
                return game;
            },
        );
        return newGame;
    }

    async increaseUserGameCount(count: number, userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new BadRequestException('User not found');
        return this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                ownedGameCount: {
                    increment: count,
                },
            },
        });
    }

    async findAll(user: User, gameQueryDto: GameQueryDto) {
        const { page = 1, limit = 20, name, ...filter } = gameQueryDto;
        const take = Math.min(limit, 20);
        const skip = (page - 1) * take;
        const where: Prisma.GameWhereInput = filter;
        if (name)
            where.name = {
                contains: name,
                mode: 'insensitive',
            };
        if (user.role !== RoleEnum.ADMIN) where.userId = user.id;

        const games = await this.prismaService.game.findMany({
            where,
            take,
            skip,
            include: {
                GameCategory: {
                    include: {
                        Category: {
                            include: {
                                Image: true,
                            },
                        },
                        GameQuestion: {
                            include: {
                                Question: {
                                    include: {
                                        QuestionFile: true,
                                        AnswerFile: true,
                                    },
                                },
                            },
                        },
                    },
                },
                Team: true,
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

    async markGameQuestionMarkedForTeam(
        userId: number,
        gameId: number,
        gameQuestionId: number,
        teamId: number,
    ) {
        const game = await this.prismaService.game.findUnique({
            where: {
                id: gameId,
            },
        });
        if (!game) throw new BadRequestException('Game not found');
        if (game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to update this game',
            );
        const gameQuestion = await this.prismaService.gameQuestion.findUnique({
            where: {
                id: gameQuestionId,
                gameId,
                answered: false,
            },
            select: {
                Question: true,
            },
        });

        if (!gameQuestion)
            throw new BadRequestException(
                'Game question not found, solved or not in game',
            );

        return await this.prismaService.$transaction(async (prisma) => {
            if (teamId)
                await prisma.team.update({
                    where: {
                        id: teamId,
                        gameId,
                    },
                    data: {
                        score: {
                            increment: gameQuestion.Question.score,
                        },
                    },
                });
            await prisma.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    playerTurn: {
                        increment: 1,
                    },
                },
            });
            return await prisma.gameQuestion.update({
                where: {
                    id: gameQuestionId,
                    gameId,
                },
                data: {
                    answered: true,
                    teamId,
                },
            });
        });
    }

    async markHelperAsUsed(
        userId: number,
        markHelperAsUsedDto: MarkHelperAsUsedDto,
    ) {
        const game = await this.prismaService.game.findUnique({
            where: {
                id: markHelperAsUsedDto.gameId,
            },
            include: {
                Team: true,
            },
        });
        if (!game) throw new BadRequestException('Game not found');
        if (game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to update this game',
            );
        const team = game.Team.find(
            (team) => team.id === markHelperAsUsedDto.teamId,
        );
        if (!team) throw new BadRequestException('Team not found in game');
        console.log({ team, markHelperAsUsedDto, userId });
        return await this.prismaService.team.update({
            where: {
                id: team.id,
            },
            data: {
                usedAnswerAgain: markHelperAsUsedDto.usedAnswerAgain,
                usedLuckWheel: markHelperAsUsedDto.usedLuckWheel,
                usedCallFriend: markHelperAsUsedDto.usedCallFriend,
            },
        });
    }

    async spinLuckWheel(
        userId: number,
        gameId: number,
        teamId: number,
        gameQuestionId: number,
    ): Promise<LuckWheelEnum> {
        const game = await this.prismaService.game.findUnique({
            where: {
                id: gameId,
            },
            include: {
                Team: true,
            },
        });
        if (!game) throw new BadRequestException('Game not found');
        if (game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to update this game',
            );
        const team = game.Team.find((team) => team.id === teamId);
        if (!team) throw new BadRequestException('Team not found in game');
        if (team.usedLuckWheel)
            throw new ConflictException('Luck wheel already used');
        const luckWheelSize = Object.keys(LuckWheelEnum).length;
        const randomLuckWheelValue = Math.floor(Math.random() * luckWheelSize);
        console.log({ randomLuckWheelValue });
        const luckWheelKey = Object.keys(LuckWheelEnum)[
            randomLuckWheelValue
        ] as keyof typeof LuckWheelEnum;
        const luckWheelValue: LuckWheelEnum = LuckWheelEnum[luckWheelKey];
        console.log({ luckWheelValue });
        if (luckWheelValue === LuckWheelEnum.LUCK_OVER)
            await this.markLuckWheelAsUsed(gameId, teamId, this.prismaService);
        else if (luckWheelValue === LuckWheelEnum.GIFT) {
            await this.prismaService.$transaction(async (prisma) => {
                await this.getQuestionScore(
                    teamId,
                    gameId,
                    gameQuestionId,
                    prisma,
                );
                await this.markLuckWheelAsUsed(gameId, teamId, prisma);
                await this.markGameQuestionAsAnswered(gameQuestionId, prisma);
            });
        } else if (luckWheelValue === LuckWheelEnum.DECREASE300POINTSOPPONENT) {
            await this.prismaService.$transaction(async (prisma) => {
                const opponentTeam = game.Team.find((t) => t.id !== team.id);
                if (!opponentTeam)
                    throw new BadRequestException('Opponent team not found');
                await this.decreaseTeamScore(
                    gameId,
                    opponentTeam.id,
                    300,
                    prisma,
                );
                await this.markLuckWheelAsUsed(gameId, team.id, prisma);
            });
        } else if (luckWheelValue === LuckWheelEnum.GOOGLE_SEARCH) {
            await this.prismaService.$transaction(async (prisma) => {
                await this.markLuckWheelAsUsed(gameId, team.id, prisma);
            });
        } else {
            throw new BadRequestException(
                'Luck wheel value not found, please try again',
            );
        }
        console.log({ luckWheelValue });
        return luckWheelValue;
    }

    private async markLuckWheelAsUsed(
        gameId: number,
        teamId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return await prisma.team.update({
            where: {
                id: teamId,
                gameId,
            },
            data: {
                usedLuckWheel: true,
            },
        });
    }

    private async getQuestionScore(
        teamId: number,
        gameId: number,
        gameQuestionId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const gameQuestion = await prisma.gameQuestion.findUnique({
            where: {
                id: gameQuestionId,
                gameId,
            },
            select: {
                Question: {
                    select: {
                        score: true,
                    },
                },
            },
        });
        if (!gameQuestion)
            throw new BadRequestException(
                'Game question not found or not in game',
            );
        return await prisma.team.update({
            where: {
                id: teamId,
            },
            data: {
                score: {
                    increment: gameQuestion.Question.score,
                },
            },
        });
    }

    private async markGameQuestionAsAnswered(
        gameQuestionId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return await prisma.gameQuestion.update({
            where: {
                id: gameQuestionId,
            },
            data: {
                answered: true,
            },
        });
    }

    private async decreaseTeamScore(
        gameId: number,
        teamId: number,
        value: number = 300,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return await prisma.team.update({
            where: {
                id: teamId,
                gameId,
            },
            data: {
                score: {
                    decrement: value,
                },
            },
        });
    }

    async getGameQuestion(
        userId: number,
        gameId: number,
        gameQuestionId: number,
    ) {
        const gameQuestion = await this.prismaService.gameQuestion.findUnique({
            where: {
                id: gameQuestionId,
            },
            select: {
                Game: true,
                Question: {
                    include: {
                        QuestionFile: true,
                        AnswerFile: true,
                        Category: true,
                    },
                },
            },
        });

        if (!gameQuestion || gameQuestion.Game.id !== gameId)
            throw new BadRequestException(
                'Game or the question does not exist!',
            );

        if (gameQuestion.Game.userId !== userId)
            throw new ForbiddenException(
                'You are not allowed to access this game question',
            );

        const question = gameQuestion.Question;
        if (!question) throw new BadRequestException('question not found');
        return { data: [question] };
    }
}
