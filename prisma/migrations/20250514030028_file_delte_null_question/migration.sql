-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_answerFileId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_questionFileId_fkey";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionFileId_fkey" FOREIGN KEY ("questionFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_answerFileId_fkey" FOREIGN KEY ("answerFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
