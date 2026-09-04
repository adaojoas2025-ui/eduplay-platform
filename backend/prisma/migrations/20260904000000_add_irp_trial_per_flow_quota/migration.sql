-- IRP Master Automação — Trial com pool de itens SEPARADO por automação
-- Migration: add_irp_trial_per_flow_quota
--
-- Decisão explícita do dono do produto (04/09/2026): em vez de um total de
-- "trialItemsLimit" itens compartilhado entre as 3 automações que escrevem no portal
-- (UASG Local/Quantidade, Detalhes do Item, Benefícios ME/EPP), cada uma passa a ter seu
-- próprio contador, todos limitados ao mesmo "trialItemsLimit" — ou seja, um trial novo
-- passa a valer até N itens em CADA automação, não N itens no total.
--
-- "trialItemsUsed" (coluna antiga, compartilhada) fica sem uso novo a partir desta
-- migration — mantida só por compatibilidade com linhas já gravadas antes dela.
--
-- Nota: em produção, "scripts/start-with-migrate.js" garante essas mesmas colunas via SQL
-- idempotente ("ADD COLUMN IF NOT EXISTS") a cada boot do servidor, independente desta
-- migration ter sido aplicada — mantenha os dois em sincronia ao alterar qualquer um.

ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialItemsUsedUasg" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialItemsUsedDetalhes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialItemsUsedBeneficios" INTEGER NOT NULL DEFAULT 0;
