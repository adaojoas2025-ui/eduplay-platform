const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setUserAsAdmin(email) {
  try {
    console.log(`Promovendo ${email} para ADMIN...`);

    const user = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuário promovido para ADMIN com sucesso!');
    console.log('User:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Buscar produtos pendentes
    console.log('\n=== PRODUTOS PENDENTES ===\n');
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        producer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (pendingProducts.length === 0) {
      console.log('Nenhum produto pendente');
    } else {
      console.log(`${pendingProducts.length} produto(s) pendente(s):`);
      pendingProducts.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Producer: ${p.producer.name} (${p.producer.email})`);
        console.log(`   Preço: R$ ${p.price}`);
      });
    }

    return user;
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'ja.eduplay@gmail.com';
setUserAsAdmin(email);
