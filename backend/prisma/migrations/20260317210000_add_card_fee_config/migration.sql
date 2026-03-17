-- AddColumn cardFeeOnCash and cardFeeOnInstallments to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cardFeeOnCash" TEXT NOT NULL DEFAULT 'SELLER';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cardFeeOnInstallments" TEXT NOT NULL DEFAULT 'BUYER';
