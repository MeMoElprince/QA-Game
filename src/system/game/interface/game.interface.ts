import { GameStatusEnum } from '@prisma/client';
import { AddTeamInterface } from './team.interface';

export interface GameInterface {
    name: string;
    playerTurn?: number;
    userId: number;
    rePlayCount?: number;
    status?: GameStatusEnum;
}

export interface CreateGameInterface extends Pick<GameInterface, 'name'> {
    name: string;
    categoriesId: number[];
    teams: AddTeamInterface[];
}
