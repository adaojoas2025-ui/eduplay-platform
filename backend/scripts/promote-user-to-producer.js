const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToProducer(email) {
  try {
    console.log(`Promovendo usuário ${email} para PRODUCER...`);

    const user = await prisma.user.update({
      where: { email },
      data: {
        role: 'PRODUCER',
        producerApproved: true,
        producerApprovedAt: new Date()
      }
    });

    console.log('✅ Usuário promovido com sucesso!');
    console.log('User:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      producerApproved: user.producerApproved
    });

    return user;
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'adao1980aguiar@gmail.com';
promoteToProducer(email);
