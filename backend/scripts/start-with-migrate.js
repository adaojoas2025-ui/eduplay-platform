/**
 * Startup script that handles migrations before starting the server
 * Resolves failed migrations and applies pending ones
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n>>> ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`>>> ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`>>> ${description} - FAILED (error: ${error.message})`);
    return false;
  }
}

async function ensureIrpTables() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    const sqls = [
      `CREATE TABLE IF NOT EXISTS "IrpLicense" ("id" TEXT NOT NULL,"licenseKey" TEXT NOT NULL,"email" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'active',"expiresAt" TIMESTAMP(3) NOT NULL,"activeDeviceId" TEXT,"lastSeenAt" TIMESTAMP(3),"extensionVersion" TEXT,"notes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "IrpLicense_pkey" PRIMARY KEY ("id"))`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "email" TEXT`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active'`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "activeDeviceId" TEXT`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3)`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "extensionVersion" TEXT`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "notes" TEXT`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "IrpLicense_licenseKey_key" ON "IrpLicense"("licenseKey")`,
      `CREATE INDEX IF NOT EXISTS "IrpLicense_email_idx" ON "IrpLicense"("email")`,
      `CREATE INDEX IF NOT EXISTS "IrpLicense_status_idx" ON "IrpLicense"("status")`,
      `CREATE TABLE IF NOT EXISTS "IrpLicenseEvent" ("id" TEXT NOT NULL,"licenseId" TEXT NOT NULL,"eventType" TEXT NOT NULL,"deviceId" TEXT,"extensionVersion" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "IrpLicenseEvent_pkey" PRIMARY KEY ("id"))`,
      `ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS "licenseId" TEXT`,
      `ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS "eventType" TEXT`,
      `ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS "deviceId" TEXT`,
      `ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS "extensionVersion" TEXT`,
      `ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
      `CREATE INDEX IF NOT EXISTS "IrpLicenseEvent_licenseId_idx" ON "IrpLicenseEvent"("licenseId")`,
    ];
    for (const sql of sqls) {
      try { await p.$executeRawUnsafe(sql); } catch(e) { /* already exists */ }
    }
    // Add FK separately to avoid errors if already exists
    try {
      await p.$executeRawUnsafe(`ALTER TABLE "IrpLicenseEvent" ADD CONSTRAINT "IrpLicenseEvent_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "IrpLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    } catch(e) { /* already exists */ }
    await p.$disconnect();
    console.log('>>> IRP License tables ready');
  } catch(e) {
    console.log('>>> IRP License tables setup warning:', e.message);
  }
}

async function main() {
  console.log('===========================================');
  console.log('  EduplayJA Backend Startup Script');
  console.log('===========================================\n');

  // Step 1: Regenerate Prisma client to ensure it matches current schema
  console.log('\nStep 1: Regenerating Prisma client...');
  runCommand('npx prisma generate', 'Prisma generate (client sync)');

  // Step 2: Ensure IRP License tables exist
  console.log('\nStep 2: Ensuring IRP License tables...');
  await ensureIrpTables();

  // Step 3: Start the server
  console.log('\n===========================================');
  console.log('  Starting Express Server');
  console.log('===========================================\n');

  require('../server.js');
}

main().catch(error => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
