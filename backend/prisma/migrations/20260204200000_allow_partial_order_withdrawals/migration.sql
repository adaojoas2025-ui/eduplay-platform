-- DropIndex
DROP INDEX IF EXISTS "pix_transfers_orderId_key";

-- AddIndex (non-unique) for performance
CREATE INDEX IF NOT EXISTS "pix_transfers_orderId_idx" ON "pix_transfers"("orderId");
