/**
 * Script to upgrade a user to PRODUCER role
 * Usage: node scripts/upgrade-user-to-producer.js <email>
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upgradeUserToProducer(email) {
  try {
    console.log(`\n🔍 Procurando usuário com email: ${email}...`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Usuário não encontrado com email: ${email}`);
      process.exit(1);
    }

    console.log(`✓ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`  Role atual: ${user.role}`);

    if (user.role === 'PRODUCER') {
      console.log(`\n✅ Usuário já é PRODUCER! Nenhuma alteração necessária.`);
      process.exit(0);
    }

    if (user.role === 'ADMIN') {
      console.error(`\n❌ Não é possível alterar role de ADMIN!`);
      process.exit(1);
    }

    console.log(`\n🔄 Atualizando role para PRODUCER...`);

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'PRODUCER' },
    });

    console.log(`\n✅ SUCESSO! Usuário atualizado:`);
    console.log(`  Nome: ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`\n🎉 Agora você pode criar e vender produtos digitais!`);
    console.log(`\nPróximos passos:`);
    console.log(`  1. Faça logout e login novamente no site`);
    console.log(`  2. Acesse "Meus Produtos"`);
    console.log(`  3. Comece a criar seus produtos!`);

  } catch (error) {
    console.error(`\n❌ Erro ao atualizar usuário:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error(`\n❌ Erro: Email não fornecido!`);
  console.log(`\nUso: node scripts/upgrade-user-to-producer.js <seu-email@exemplo.com>`);
  console.log(`\nExemplo: node scripts/upgrade-user-to-producer.js adao.joas2025@gmail.com`);
  process.exit(1);
}

// Run the upgrade
upgradeUserToProducer(email);
