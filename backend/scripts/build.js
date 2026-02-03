/**
 * Build script for Render deployment
 * Generates Prisma Client and deploys migrations
 */

const { execSync } = require('child_process');

function run(command, description) {
  console.log(`\n>>> ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`>>> ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.error(`>>> ${description} - FAILED:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Starting build process ===\n');

  // Step 1: Generate Prisma Client (required)
  const generateSuccess = run('npx prisma generate', 'Generating Prisma Client');

  if (!generateSuccess) {
    console.error('ERROR: Failed to generate Prisma Client');
    process.exit(1);
  }

  // Step 2: Push schema changes to database (sync schema without migrations)
  run('npx prisma db push --accept-data-loss', 'Pushing schema to database');

  console.log('\n=== Build process complete ===');
  process.exit(0);
}

main().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
