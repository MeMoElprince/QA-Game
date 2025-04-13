/*
  Warnings:

  - A unique constraint covering the columns `[questionFileId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[answerFileId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_questionFileId_key" ON "Question"("questionFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_answerFileId_key" ON "Question"("answerFileId");
