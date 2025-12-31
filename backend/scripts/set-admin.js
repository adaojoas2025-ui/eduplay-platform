const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    const email = 'ja.eduplay@gmail.com';
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados.');
      console.log('Por favor, primeiro crie a conta via interface web.');
      console.log('Depois execute este script novamente.');
      await prisma.$disconnect();
      process.exit(1);
    }

    // Atualizar para ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        producerApproved: true,
        producerApprovedAt: new Date()
      }
    });
    
    console.log('✅ Usuário atualizado para ADMINISTRADOR com sucesso!');
    console.log('\n📋 Dados do administrador:');
    console.log('Nome:', updatedUser.name);
    console.log('Email:', updatedUser.email);
    console.log('Role:', updatedUser.role);
    console.log('Status:', updatedUser.status);
    console.log('Email Verificado:', updatedUser.emailVerified);
    console.log('Produtor Aprovado:', updatedUser.producerApproved);
    console.log('ID:', updatedUser.id);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setAdmin();
