/**
 * Fix user role directly in production database
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function fixUserRole() {
  const email = 'adao1980aguiar@gmail.com';

  try {
    console.log('\n🔍 Buscando usuário no banco de PRODUÇÃO...');
    console.log('📧 Email:', email);
    console.log('🗄️  Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Unknown');

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    if (!user) {
      console.error('❌ Usuário não encontrado no banco de produção!');
      process.exit(1);
    }

    console.log('\n✅ Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Nome:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role ATUAL:', user.role);
    console.log('   Status:', user.status);

    if (user.role === 'PRODUCER') {
      console.log('\n✅ Usuário JÁ É PRODUCER!');
      console.log('⚠️  O problema pode ser outro (cache, token, etc)');
      process.exit(0);
    }

    console.log('\n🔄 Atualizando role para PRODUCER...');

    // Atualizar para PRODUCER
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'PRODUCER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    console.log('\n✅ SUCESSO! Usuário atualizado:');
    console.log('   Nome:', updated.name);
    console.log('   Email:', updated.email);
    console.log('   Role NOVA:', updated.role);
    console.log('\n🎉 Agora faça logout e login novamente no site!');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRole();
