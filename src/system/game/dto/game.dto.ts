import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
    CreateGameInterface,
    GameInterface,
} from '../interface/game.interface';
import { CreateTeamDto } from './team.dto';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { $Enums } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateGameDto implements CreateGameInterface {
    @ApiProperty({
        description: 'Game name',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Game Teams',
        required: true,
        type: [CreateTeamDto],
    })
    @IsNotEmpty()
    @Type(() => CreateTeamDto)
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    teams: CreateTeamDto[];

    @ApiProperty({
        description: 'Game categories',
        required: true,
        type: [Number],
    })
    @IsNotEmpty()
    @Type(() => Number)
    @ArrayMinSize(6, {
        message: 'You must select 6 categories for the game',
    })
    @ArrayMaxSize(6, {
        message: 'You must select 6 categories for the game',
    })
    categoriesId: number[];
}

export class UserReplayGameDto extends OmitType(CreateGameDto, ['categoriesId']) {}

export class AdminCreateGameDto extends CreateGameDto {
    @ApiProperty({
        description: 'Game user id',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    userId: number;
}

export class GameQueryDto
    extends PaginationDto
    implements Pick<Partial<GameInterface>, 'name' | 'status' | 'userId'>
{
    @ApiProperty({
        description: 'Game id',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id: number;

    @ApiProperty({
        description: 'Game name',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Game status',
        required: false,
        enum: $Enums.GameStatusEnum,
    })
    @IsOptional()
    @IsEnum($Enums.GameStatusEnum)
    status?: $Enums.GameStatusEnum;

    @ApiProperty({
        description: 'Game user id',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    userId: number;
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}

export class MarkHelperAsUsedDto {
    @ApiProperty({
        description: 'Game id',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    gameId: number;

    @ApiProperty({
        description: 'Helper id',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    teamId: number;

    @ApiProperty({
        description: 'used luck wheel to be marked as used',
        required: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @ValidateIf(
        (o) => o.usedCallFriend === false && o.usedAnswerAgain === false,
    )
    usedLuckWheel?: boolean;

    @ApiProperty({
        description: 'used answer again to be marked as used',
        required: false,
    })
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsNotEmpty()
    @ValidateIf((o) => o.usedLuckWheel === false && o.usedCallFriend === false)
    usedAnswerAgain?: boolean;

    @ApiProperty({
        description: 'used call friend to be marked as used',
        required: false,
    })
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsNotEmpty()
    @ValidateIf((o) => o.usedLuckWheel === false && o.usedAnswerAgain === false)
    usedCallFriend?: boolean;
}

export class UserMarkHelperAsUsedDto extends OmitType(MarkHelperAsUsedDto, [
    'gameId',
    'teamId',
]) {}
