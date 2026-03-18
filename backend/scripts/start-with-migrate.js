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

  // Step 1: Regenerate Prisma client to ensure it matches current schema
  console.log('\nStep 1: Regenerating Prisma client...');
  runCommand('npx prisma generate', 'Prisma generate (client sync)');

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
