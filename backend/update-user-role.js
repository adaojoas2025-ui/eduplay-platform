const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Atualizar o usuário com email adao1980aguiar@gmail.com para PRODUCER
    const user = await prisma.user.update({
      where: {
        email: 'adao1980aguiar@gmail.com'
      },
      data: {
        role: 'PRODUCER'
      }
    });

    console.log('✅ Usuário atualizado com sucesso!');
    console.log('Email:', user.email);
    console.log('Nome:', user.name);
    console.log('Role:', user.role);
    console.log('\n🎉 Agora você pode fazer login e cadastrar produtos!');
    console.log('Faça logout e login novamente para as mudanças terem efeito.');
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
