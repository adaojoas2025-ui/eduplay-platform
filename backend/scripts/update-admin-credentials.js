/**
 * Atualizar credenciais do administrador
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateAdminCredentials() {
  console.log('\n🔐 ATUALIZANDO CREDENCIAIS DO ADMINISTRADOR\n');

  try {
    const newEmail = 'ja.educaplayja@gmail.com';
    const newPassword = 'Asa122448@';

    // Hash da senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Buscar admin atual
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@educaplayja.com.br' },
    });

    if (admin) {
      // Atualizar admin existente
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          email: newEmail,
          password: hashedPassword,
          name: 'Administrador EducaplayJA',
          emailVerified: true,
        },
      });
      console.log('✅ Admin existente atualizado!');
    } else {
      // Verificar se já existe admin com novo email
      admin = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (admin) {
        // Atualizar senha
        await prisma.user.update({
          where: { id: admin.id },
          data: {
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: true,
          },
        });
        console.log('✅ Senha do admin atualizada!');
      } else {
        // Criar novo admin
        await prisma.user.create({
          data: {
            name: 'Administrador EducaplayJA',
            email: newEmail,
            password: hashedPassword,
            role: 'ADMIN',
            emailVerified: true,
          },
        });
        console.log('✅ Novo admin criado!');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 CREDENCIAIS DO ADMINISTRADOR');
    console.log('='.repeat(60));
    console.log(`Email: ${newEmail}`);
    console.log(`Senha: ${newPassword}`);
    console.log('='.repeat(60));
    console.log('\n✅ Credenciais atualizadas com sucesso!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminCredentials();
