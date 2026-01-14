const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminAndCheckProducts() {
  try {
    console.log('=== CRIANDO ADMINISTRADOR ===\n');

    // Primeiro verificar se já existe admin com este email
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@educaplayja.com' }
    });

    let admin;
    if (existingAdmin) {
      console.log('Admin já existe, atualizando para role ADMIN...');
      admin = await prisma.user.update({
        where: { email: 'admin@educaplayja.com' },
        data: { role: 'ADMIN' }
      });
    } else {
      console.log('Criando novo administrador...');
      const hashedPassword = await bcrypt.hash('Admin@2025', 10);

      admin = await prisma.user.create({
        data: {
          email: 'admin@educaplayja.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          emailVerifiedAt: new Date()
        }
      });
    }

    console.log('✅ Administrador criado/atualizado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   ID: ${admin.id}\n`);

    console.log('=== VERIFICANDO PRODUTOS PENDENTES ===\n');

    const pendingProducts = await prisma.product.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (pendingProducts.length === 0) {
      console.log('❌ Nenhum produto pendente encontrado\n');
    } else {
      console.log(`✅ ${pendingProducts.length} produto(s) pendente(s):\n`);
      pendingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Producer: ${product.producer.name} (${product.producer.email})`);
        console.log(`   Preço: R$ ${product.price}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Criado em: ${product.createdAt}`);
        console.log('');
      });
    }

    console.log('\n=== CREDENCIAIS DO ADMIN ===');
    console.log('Email: admin@educaplayja.com');
    console.log('Senha: Admin@2025');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAndCheckProducts();
