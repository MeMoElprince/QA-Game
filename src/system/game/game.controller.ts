import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Put,
} from '@nestjs/common';
import { GameService } from './game.service';
import {
    AdminCreateGameDto,
    CreateGameDto,
    GameQueryDto,
    MarkHelperAsUsedDto,
    UpdateGameDto,
    UserMarkHelperAsUsedDto,
    UserReplayGameDto,
} from './dto/game.dto';
import { GetUser } from 'src/core/auth/decorator/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { RoleEnum, User } from '@prisma/client';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';

@ApiTags('Game')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Create a new game for ALL',
        description: 'Create a new game for ALL',
    })
    @ApiBearerAuth('default')
    create(
        @Body() createGameDto: CreateGameDto,
        @GetUser('id') userId: number,
    ) {
        return this.gameService.create(+userId, createGameDto);
    }

    @Post('free/admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Create a free new game for ADMIN',
        description: 'Create a new free game for ADMIN',
    })
    @ApiBearerAuth('default')
    createFreeGame(@Body() createGameDto: AdminCreateGameDto) {
        return this.gameService.createFreeGame(createGameDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all games',
        description: 'Get all games',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    findAll(@Query() gameQueryDto: GameQueryDto, @GetUser() user: User) {
        return this.gameService.findAll(user, gameQueryDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
        return this.gameService.update(+id, updateGameDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.gameService.remove(+id);
    }

    @Patch(':counter/users/:userId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Increase game count',
        description: 'Increase game count',
    })
    @ApiBearerAuth('default')
    increaseCounter(
        @Param('userId') userId: string,
        @Param('counter') counter: string,
    ) {
        return this.gameService.increaseUserGameCount(+counter, +userId);
    }

    @Patch(':gameId/game-question/:gameQuestionId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'mark question for team as answered to increase his score',
        description: 'if no team answered send no query of teamId',
    })
    @ApiBearerAuth('default')
    @ApiQuery({
        name: 'teamId',
        required: false,
        description: 'teamId of the team that answered the question',
        schema: {
            type: 'string',
        },
        type: String,
    })
    markGameQuestionMarkedForTeam(
        @Param('gameId') gameId: string,
        @Param('gameQuestionId') gameQuestionId: string,
        @Query('teamId') teamId: string,
        @GetUser('id') userId: number,
    ) {
        return this.gameService.markGameQuestionMarkedForTeam(
            +userId,
            +gameId,
            +gameQuestionId,
            teamId ? +teamId : undefined,
        );
    }

    @Patch(':gameId/teams/:teamId/mark-helper-as-used')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'mark helper as used for team in a game',
        description: 'mark helper as used for team',
    })
    markHelperAsUsedForTeam(
        @GetUser('id') userId: number,
        @Param('gameId') gameId: number,
        @Param('teamId') teamId: number,
        @Body() userMarkHelperAsUsed: UserMarkHelperAsUsedDto,
    ) {
        const markHelperAsUsed: MarkHelperAsUsedDto = {
            gameId: +gameId,
            teamId: +teamId,
            ...userMarkHelperAsUsed,
        };
        return this.gameService.markHelperAsUsed(+userId, markHelperAsUsed);
    }

    @Patch(
        ':gameId/teams/:teamId/game-questions/:gameQuestionId/luck-wheel-helper',
    )
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'mark helper as used for team in a game',
        description: 'mark helper as used for team',
    })
    async spinLuckWheel(
        @GetUser('id') userId: number,
        @Param('gameId') gameId: number,
        @Param('teamId') teamId: number,
        @Param('gameQuestionId') gameQuestionId: number,
    ) {
        return await this.gameService.spinLuckWheel(
            +userId,
            +gameId,
            +teamId,
            +gameQuestionId,
        );
    }

    @Get(':id/gameQuestions/:gameQuestionId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Get game question',
        description: 'Get game question by id and gameId',
    })
    @ApiBearerAuth('default')
    async getGameQuestion(
        @Param('id') gameId: string,
        @Param('gameQuestionId') gameQuestionId: string,
        @GetUser('id') userId: number,
    ) {
        return await this.gameService.getGameQuestion(
            +userId,
            +gameId,
            +gameQuestionId,
        );
    }

    @Patch(':id/finish-game')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Finish game',
        description: 'Finish game by id',
    })
    @ApiBearerAuth('default')
    async finishGame(@Param('id') id: string, @GetUser('id') userId: number) {
        return await this.gameService.finishGame(+id, +userId);
    }

    @Put(':id/replay-game')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Replay game',
        description: 'Replay game by id',
    })
    @ApiBearerAuth('default')
    async replayGame(
        @Param('id') id: string,
        @GetUser('id') userId: number,
        @Body() userReplayGame: UserReplayGameDto,
    ) {
        console.log('HRERETERTERTET E@');
        return await this.gameService.userReplayGame(
            +userId,
            +id,
            userReplayGame,
        );
    }

    @Patch(':id/teams/:teamId/score')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Update team score',
        description: 'Update team score by id and gameId',
    })
    @ApiBody({
        description: 'Update team score',
        required: true,
        schema: {
            type: 'object',
            properties: {
                score: {
                    type: 'number',
                    example: 100,
                },
            },
        },
    })
    @ApiBearerAuth('default')
    async updateTeamScore(
        @Param('id') gameId: number,
        @Param('teamId') teamId: number,
        @GetUser('id') userId: number,
        @Body('score') score: number,
    ) {
        return await this.gameService.updateTeamScore(
            +gameId,
            +teamId,
            +userId,
            score,
        );
    }
}
