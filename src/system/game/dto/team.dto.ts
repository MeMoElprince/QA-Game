import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { AddTeamInterface } from '../interface/team.interface';

export class CreateTeamDto implements AddTeamInterface {
    @ApiProperty({
        description: 'Team name',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Number of players',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    playerCount: number;
}
