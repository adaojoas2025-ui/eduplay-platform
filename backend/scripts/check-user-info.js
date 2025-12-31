const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'adao1980aguiar@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, cpf: true, createdAt: true }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('👤 INFORMAÇÕES DO USUÁRIO:');
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('CPF:', user.cpf);
    console.log('Role:', user.role);
    console.log('Criado em:', user.createdAt);
    console.log('\n📝 A senha registrada para esta conta foi: Senha123@');
    console.log('\n🔑 CREDENCIAIS PARA LOGIN:');
    console.log('Email:', email);
    console.log('Senha: Senha123@');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUser();
