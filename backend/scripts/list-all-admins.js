const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    console.log('=== TODOS OS ADMINISTRADORES ===\n');
    console.log(JSON.stringify(admins, null, 2));

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllAdmins();
