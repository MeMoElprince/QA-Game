-- AlterTable
ALTER TABLE "GameQuestion" ADD COLUMN     "answered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "score" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "GameQuestion" ADD CONSTRAINT "GameQuestion_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
