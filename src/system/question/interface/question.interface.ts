export interface QuestionInterface {
    question: string;
    questionFileId?: number;
    categoryId: number;
    answer: string;
    answerFileId?: number;
    score: number;
}

export interface CreateQuestionInterface
    extends Pick<
        QuestionInterface,
        'answer' | 'question' | 'score' | 'categoryId'
    > {
    questionFile: Express.Multer.File;
    answerFile: Express.Multer.File;
}
