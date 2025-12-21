/**
 * SCRIPT: Resetar senha do administrador
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('\n🔐 RESETAR SENHA DO ADMINISTRADOR\n');

  try {
    // Nova senha para o admin
    const newPassword = 'admin123'; // TROQUE AQUI pela senha que você quer

    // Hash da senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Buscar admin
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@eduplay.com.br' },
    });

    if (!admin) {
      // Se não existir, criar o admin
      console.log('⚠️  Admin não encontrado. Criando novo admin...\n');

      admin = await prisma.user.create({
        data: {
          name: 'Administrador EDUPLAY',
          email: 'admin@eduplay.com.br',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
        },
      });

      console.log('✅ Admin criado com sucesso!');
    } else {
      // Se existir, atualizar senha
      await prisma.user.update({
        where: { email: 'admin@eduplay.com.br' },
        data: { password: hashedPassword },
      });

      console.log('✅ Senha do admin atualizada com sucesso!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 CREDENCIAIS DO ADMINISTRADOR');
    console.log('='.repeat(60));
    console.log(`Email: admin@eduplay.com.br`);
    console.log(`Senha: ${newPassword}`);
    console.log('='.repeat(60));
    console.log('\n💡 IMPORTANTE: Guarde essas credenciais em local seguro!');
    console.log('💡 Para ver as comissões, acesse:');
    console.log('   http://localhost:5173/admin/commissions\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
