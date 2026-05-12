const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://eduplay_db_48aw_user:w7legxdcXSg3XfZaJbNZ7W0fD8P4Bjee@dpg-d6omrjcr85hc739ifuvg-a.oregon-postgres.render.com/eduplay_db_48aw',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Conectado ao banco de producao.');

  const sqls = [
    [`CREATE TABLE IF NOT EXISTS "IrpLicense" (
      "id" TEXT NOT NULL,
      "licenseKey" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'active',
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "activeDeviceId" TEXT,
      "lastSeenAt" TIMESTAMP(3),
      "extensionVersion" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "IrpLicense_pkey" PRIMARY KEY ("id")
    )`, 'Tabela IrpLicense'],

    [`CREATE UNIQUE INDEX IF NOT EXISTS "IrpLicense_licenseKey_key" ON "IrpLicense"("licenseKey")`, 'Index licenseKey'],
    [`CREATE INDEX IF NOT EXISTS "IrpLicense_email_idx" ON "IrpLicense"("email")`, 'Index email'],
    [`CREATE INDEX IF NOT EXISTS "IrpLicense_status_idx" ON "IrpLicense"("status")`, 'Index status'],

    [`CREATE TABLE IF NOT EXISTS "IrpLicenseEvent" (
      "id" TEXT NOT NULL,
      "licenseId" TEXT NOT NULL,
      "eventType" TEXT NOT NULL,
      "deviceId" TEXT,
      "extensionVersion" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "IrpLicenseEvent_pkey" PRIMARY KEY ("id")
    )`, 'Tabela IrpLicenseEvent'],

    [`CREATE INDEX IF NOT EXISTS "IrpLicenseEvent_licenseId_idx" ON "IrpLicenseEvent"("licenseId")`, 'Index licenseId'],

    [`ALTER TABLE "IrpLicenseEvent" ADD CONSTRAINT "IrpLicenseEvent_licenseId_fkey"
      FOREIGN KEY ("licenseId") REFERENCES "IrpLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'Foreign key'],

    [`INSERT INTO "IrpLicense" ("id","licenseKey","email","status","expiresAt","createdAt","updatedAt")
      VALUES (gen_random_uuid(),'IRP-TEST-AAAA-BBBB-CCCC','adao1980aguiar@gmail.com','active',
      NOW() + INTERVAL '30 days',NOW(),NOW())
      ON CONFLICT ("licenseKey") DO NOTHING`, 'Chave de teste'],
  ];

  for (const [sql, label] of sqls) {
    try {
      await client.query(sql);
      console.log('OK:', label);
    } catch(e) {
      if (e.message.includes('already exists')) {
        console.log('Ja existe:', label);
      } else {
        console.error('ERRO em', label, ':', e.message);
      }
    }
  }

  const res = await client.query(`SELECT "licenseKey", "status", "expiresAt" FROM "IrpLicense"`);
  console.log('\nLicencas no banco:');
  res.rows.forEach(r => console.log(' -', r.licenseKey, '|', r.status, '| validade:', new Date(r.expiresAt).toLocaleDateString('pt-BR')));

  await client.end();
  console.log('\nPronto!');
}

run().catch(e => { console.error('Erro fatal:', e.message); process.exit(1); });
