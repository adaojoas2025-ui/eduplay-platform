-- IRP Master Automação — Trial por quantidade de itens (em vez de só por tempo)
-- Migration: add_irp_trial_item_quota
--
-- Nota: em produção, "scripts/start-with-migrate.js" garante essas mesmas colunas/tabelas
-- via SQL idempotente ("CREATE TABLE IF NOT EXISTS" / "ADD COLUMN IF NOT EXISTS") a cada
-- boot do servidor, independente desta migration ter sido aplicada — mantenha os dois em
-- sincronia ao alterar qualquer um dos dois.

ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialItemsLimit" INTEGER;
ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialItemsUsed" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "IrpTrialConsumption" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "itemsRequested" INTEGER NOT NULL DEFAULT 0,
    "itemsApplied" INTEGER NOT NULL DEFAULT 0,
    "flow" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrpTrialConsumption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialConsumption_runId_key" ON "IrpTrialConsumption"("runId");
CREATE INDEX IF NOT EXISTS "IrpTrialConsumption_licenseKey_idx" ON "IrpTrialConsumption"("licenseKey");

CREATE TABLE IF NOT EXISTS "IrpConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrpConfig_pkey" PRIMARY KEY ("key")
);
