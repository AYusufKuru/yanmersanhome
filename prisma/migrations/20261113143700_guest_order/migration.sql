-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "invoiceType" "InvoiceType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "lookupToken" TEXT NOT NULL,
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "taxOffice" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_lookupToken_key" ON "Order"("lookupToken");
