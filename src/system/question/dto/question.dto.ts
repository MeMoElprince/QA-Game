import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    CreateQuestionInterface,
    QuestionInterface,
} from '../interface/question.interface';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionScoreEnum } from '../enum/score.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateQuestionDto implements CreateQuestionInterface {
    @ApiProperty({
        description: 'The answer of the question',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    answer: string;

    @ApiProperty({
        description: 'The question',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    question: string;

    @ApiProperty({
        description: 'The score of the question',
        required: true,
        enum: QuestionScoreEnum,
        example: QuestionScoreEnum.EASY,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(QuestionScoreEnum)
    score: number;

    @ApiProperty({
        description: 'The category id of the question',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    categoryId: number;

    @ApiProperty({
        description: 'The question file',
        required: false,
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    questionFile: Express.Multer.File;

    @ApiProperty({
        description: 'The answer file',
        required: false,
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    answerFile: Express.Multer.File;
}

export class QuestionQueryDto
    extends PaginationDto
    implements Pick<Partial<QuestionInterface>, 'score' | 'categoryId'>
{
    @ApiProperty({
        description: 'The id of the question',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id?: number;

    @ApiProperty({
        description: 'The answer of the question',
        required: false,
        enum: QuestionScoreEnum,
    })
    @IsOptional()
    @IsNumber()
    @IsEnum(QuestionScoreEnum)
    @Type(() => Number)
    score?: number;

    @ApiProperty({
        description: 'The category id of the question',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    categoryId: number;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
