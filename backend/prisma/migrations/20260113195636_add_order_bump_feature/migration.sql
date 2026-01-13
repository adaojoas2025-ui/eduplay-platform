-- CreateEnum
CREATE TYPE "OrderBumpTrigger" AS ENUM ('CATEGORY', 'PRODUCT', 'ANY');

-- CreateTable
CREATE TABLE "order_bumps" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "triggerType" "OrderBumpTrigger" NOT NULL DEFAULT 'CATEGORY',
    "triggerValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "producerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_bumps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_bumps_producerId_idx" ON "order_bumps"("producerId");

-- CreateIndex
CREATE INDEX "order_bumps_isActive_idx" ON "order_bumps"("isActive");

-- CreateIndex
CREATE INDEX "order_bumps_triggerType_idx" ON "order_bumps"("triggerType");

-- AddForeignKey
ALTER TABLE "order_bumps" ADD CONSTRAINT "order_bumps_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_bumps" ADD CONSTRAINT "order_bumps_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
