-- IRP Master Automação — Trial com pool de itens POR LICITAÇÃO (não mais um total fixo)
-- Migration: add_irp_trial_per_contract_quota
--
-- Decisão explícita do dono do produto (06/09/2026): em vez de um limite fixo de
-- "trialItemsLimit" itens por automação (contado pra sempre, em qualquer licitação), cada
-- combinação (licença, fluxo, licitação) passa a ter seu próprio contador — processar 11
-- itens na licitação A não consome nada do limite da licitação B. O usuário pode abrir e
-- trabalhar em quantas licitações diferentes quiser, sempre com 11 itens disponíveis em
-- cada uma, em cada automação (UASG, Detalhes, Benefícios) — mas dentro da MESMA
-- licitação o contador é cumulativo e permanente: reabrir/repetir nunca reinicia.
--
-- "contractId" vem do número identificador da licitação/IRP na URL do próprio portal do
-- governo (ex: "550740" em ".../execucao/edit?id=550740").
--
-- As colunas trialItemsUsedUasg/Detalhes/Beneficios (migration anterior) ficam sem uso
-- novo a partir desta — mantidas só por compatibilidade com o período em que o pool foi
-- "um total por automação" (04 a 06/09/2026).
--
-- Nota: em produção, "scripts/start-with-migrate.js" garante essas mesmas tabelas via SQL
-- idempotente ("CREATE TABLE IF NOT EXISTS") a cada boot do servidor, independente desta
-- migration ter sido aplicada — mantenha os dois em sincronia ao alterar qualquer um.

CREATE TABLE IF NOT EXISTS "IrpTrialContractUsage" (
    "id" TEXT NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "itemsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrpTrialContractUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialContractUsage_key_flow_contract_key" ON "IrpTrialContractUsage"("licenseKey","flow","contractId");
CREATE INDEX IF NOT EXISTS "IrpTrialContractUsage_licenseKey_idx" ON "IrpTrialContractUsage"("licenseKey");
