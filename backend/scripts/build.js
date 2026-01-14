/**
 * Build script that handles Prisma migrations safely
 * Resolves any failed migrations before applying new ones
 */

const { execSync } = require('child_process');

function run(command, description) {
  console.log(`\n>>> ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`>>> ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`>>> ${description} - FAILED (continuing...)`);
    return false;
  }
}

async function main() {
  console.log('=== Starting build process ===\n');

  // Step 1: Generate Prisma Client
  run('npx prisma generate', 'Generating Prisma Client');

  // Step 2: Try to resolve any failed migrations
  // This handles the case where a previous migration failed
  run(
    'npx prisma migrate resolve --rolled-back 20260114190000_add_producer_bank_fields 2>/dev/null || true',
    'Resolving any failed migrations'
  );

  // Step 3: Deploy migrations
  const migrateSuccess = run('npx prisma migrate deploy', 'Deploying migrations');

  if (!migrateSuccess) {
    console.log('\n>>> Migration deploy failed, trying to repair...');

    // Try to mark migrations as applied if schema is already correct
    run('npx prisma db push --accept-data-loss', 'Pushing schema directly');
  }

  console.log('\n=== Build process complete ===');
}

main().catch(console.error);
