import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    CreateGameInterface,
    GameInterface,
} from '../interface/game.interface';
import { CreateTeamDto } from './team.dto';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
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
    @Type(() => CreateGameDto)
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

export class AdminCreateGameDto extends CreateGameDto {
    @ApiProperty({
        description: 'Game user id',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    userId: number;

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
    @Type(() => CreateGameDto)
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
