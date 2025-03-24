export interface TeamInterface {
    name: string;
    playerCount: number;
    score?: number;
    gameId: number;
    usedLuckWheen?: boolean;
    usedAnswerAgain?: boolean;
    usedCallFriend?: boolean;
    order: number;
}

export interface AddTeamInterface
    extends Pick<TeamInterface, 'name' | 'playerCount'> {
    name: string;
    playerCount: number;
}
