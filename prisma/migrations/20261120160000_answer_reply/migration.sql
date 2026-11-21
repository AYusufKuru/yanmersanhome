ALTER TABLE "ProductAnswer" ADD COLUMN "parentId" TEXT;

CREATE INDEX "ProductAnswer_parentId_idx" ON "ProductAnswer"("parentId");

ALTER TABLE "ProductAnswer" ADD CONSTRAINT "ProductAnswer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
