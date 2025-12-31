const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'adao1980aguiar@gmail.com';
    const newPassword = 'Asa122448@';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('\n✅ Senha atualizada com sucesso!');
    console.log('Nova senha:', newPassword);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
