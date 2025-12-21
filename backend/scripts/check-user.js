const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'adao18aguiar@hotmail.com';

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    console.log('✅ Usuário EXISTE:');
    console.log('   Nome:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   ID:', user.id);
  } else {
    console.log('❌ Usuário NÃO EXISTE no banco de dados');
    console.log('   Email procurado:', email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
