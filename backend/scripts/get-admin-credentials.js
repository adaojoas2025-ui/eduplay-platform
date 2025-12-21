const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdminCredentials() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      name: true,
      email: true,
    },
  });

  console.log('\n👑 CONTAS DE ADMINISTRADOR:\n');
  admins.forEach(admin => {
    console.log(`Nome: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log('Senha: (você precisa saber a senha configurada)\n');
  });

  await prisma.$disconnect();
}

getAdminCredentials();
