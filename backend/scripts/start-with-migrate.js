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

async function main() {
  console.log('===========================================');
  console.log('  EduplayJA Backend Startup Script');
  console.log('===========================================\n');

  // Step 1: Try to resolve the specific failed migration
  console.log('Step 1: Checking for failed migrations...');
  runCommand(
    'npx prisma migrate resolve --rolled-back 20260114190000_add_producer_bank_fields',
    'Resolving failed migration 20260114190000'
  );

  // Step 2: Try to deploy migrations normally
  console.log('\nStep 2: Deploying migrations...');
  const migrateSuccess = runCommand(
    'npx prisma migrate deploy',
    'Prisma migrate deploy'
  );

  if (!migrateSuccess) {
    console.log('\n>>> Migration deploy failed. Trying alternative approach...');

    // Step 3: If migrate deploy fails, try db push as fallback
    console.log('\nStep 3: Trying db push as fallback...');
    const pushSuccess = runCommand(
      'npx prisma db push --accept-data-loss',
      'Prisma db push'
    );

    if (!pushSuccess) {
      console.log('\n>>> WARNING: Could not apply migrations. Server may have issues.');
    }
  }

  // Step 4: Start the server
  console.log('\n===========================================');
  console.log('  Starting Express Server');
  console.log('===========================================\n');

  require('../server.js');
}

main().catch(error => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
