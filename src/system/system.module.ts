import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { QuestionModule } from './question/question.module';
import { GameModule } from './game/game.module';

@Module({
    imports: [CategoryModule, QuestionModule, GameModule],
    controllers: [],
    providers: [],
})
export class SystemModule {}
