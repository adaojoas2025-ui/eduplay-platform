const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (admin) {
    console.log('Admin encontrado:');
    console.log('  Email:', admin.email);
    console.log('  Nome:', admin.name);
    console.log('  ID:', admin.id);
  } else {
    console.log('Admin não encontrado!');
  }
  
  await prisma.$disconnect();
})();
