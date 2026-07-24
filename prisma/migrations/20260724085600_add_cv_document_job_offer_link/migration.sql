-- AlterTable
ALTER TABLE "CvDocument" ADD COLUMN     "jobOfferId" TEXT;

-- CreateIndex
CREATE INDEX "CvDocument_jobOfferId_idx" ON "CvDocument"("jobOfferId");

-- AddForeignKey
ALTER TABLE "CvDocument" ADD CONSTRAINT "CvDocument_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
