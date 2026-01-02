/**
 * Check Admin Emails in Production Database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminEmails() {
  try {
    console.log('🔍 Verificando emails de administradores...\n');

    // Check all users with ADMIN role
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('📋 Total de administradores:', admins.length);
    console.log('');

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`);
      console.log(`   Nome: ${admin.name}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Criado em: ${admin.createdAt}`);
      console.log('');
    });

    // Check if ja.eduplay@gmail.com exists
    const correctEmail = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' }
    });

    if (correctEmail) {
      console.log('✅ Email correto encontrado:');
      console.log(`   Email: ${correctEmail.email}`);
      console.log(`   Role: ${correctEmail.role}`);
      console.log(`   ID: ${correctEmail.id}`);
    } else {
      console.log('❌ Email ja.eduplay@gmail.com NÃO encontrado');
    }

    console.log('');

    // Check if joasjosefarias@gmail.com exists
    const wrongEmail = await prisma.user.findUnique({
      where: { email: 'joasjosefarias@gmail.com' }
    });

    if (wrongEmail) {
      console.log('❌ Email errado encontrado:');
      console.log(`   Email: ${wrongEmail.email}`);
      console.log(`   Role: ${wrongEmail.role}`);
      console.log(`   ID: ${wrongEmail.id}`);
    } else {
      console.log('✅ Email joasjosefarias@gmail.com NÃO encontrado (bom!)');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminEmails();
