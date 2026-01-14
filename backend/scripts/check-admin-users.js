const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('Buscando usuários ADMIN...\n');

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ Nenhum administrador encontrado no banco de dados');
    } else {
      console.log(`✅ ${admins.length} administrador(es) encontrado(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Status: ${admin.status}`);
        console.log(`   Criado em: ${admin.createdAt}`);
        console.log('');
      });
    }

    return admins;
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
