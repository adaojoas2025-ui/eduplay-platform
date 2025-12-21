const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('\n=== Usuário adao1980aguiar@gmail.com ===\n');
    if (user) {
      console.log('ID:', user.id);
      console.log('Nome:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('\nÉ ADMIN?', user.role === 'ADMIN' ? 'SIM ✅' : 'NÃO ❌');
    } else {
      console.log('Usuário não encontrado');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
