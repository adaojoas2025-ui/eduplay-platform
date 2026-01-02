/**
 * Fix Admin Email in Production Database
 * Updates the admin user email from joasjosefarias@gmail.com to ja.eduplay@gmail.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminEmail() {
  try {
    console.log('🔍 Buscando usuário administrador...');

    // Find admin with wrong email
    const wrongAdmin = await prisma.user.findUnique({
      where: { email: 'joasjosefarias@gmail.com' }
    });

    if (wrongAdmin) {
      console.log('❌ Encontrado admin com email errado:', wrongAdmin.email);
      console.log('📧 Atualizando para: ja.eduplay@gmail.com');

      // Update to correct email
      const updated = await prisma.user.update({
        where: { id: wrongAdmin.id },
        data: { email: 'ja.eduplay@gmail.com' }
      });

      console.log('✅ Email atualizado com sucesso!');
      console.log('Novo email:', updated.email);
      console.log('Role:', updated.role);
    } else {
      console.log('⚠️  Usuário com email errado não encontrado');

      // Check if correct email already exists
      const correctAdmin = await prisma.user.findUnique({
        where: { email: 'ja.eduplay@gmail.com' }
      });

      if (correctAdmin) {
        console.log('✅ Email correto já existe no banco!');
        console.log('Email:', correctAdmin.email);
        console.log('Role:', correctAdmin.role);
      }
    }

    // List all admins
    console.log('\n📋 Todos os administradores:');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true }
    });
    console.log(admins);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminEmail();
