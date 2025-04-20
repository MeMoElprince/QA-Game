import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class GameRepo {
    constructor(private readonly prismaService: PrismaService) {}
}
