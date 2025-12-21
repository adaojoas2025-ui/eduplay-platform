const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
  try {
    // Pegar o pedido mais recente
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        buyer: { select: { email: true } },
        product: { select: { title: true } }
      }
    });

    if (!lastOrder) {
      console.log('Nenhum pedido encontrado');
      return;
    }

    console.log('\n=== Pedido Antes ===');
    console.log('ID:', lastOrder.id);
    console.log('Status ANTES:', lastOrder.status);
    console.log('Comprador:', lastOrder.buyer.email);
    console.log('Produto:', lastOrder.product.title);

    // Atualizar para APPROVED
    console.log('\n=== Atualizando para APPROVED ===');
    const updated = await prisma.order.update({
      where: { id: lastOrder.id },
      data: { status: 'APPROVED' },
      select: { id: true, status: true }
    });

    console.log('Status DEPOIS da atualização:', updated.status);

    // Buscar novamente para confirmar
    const check = await prisma.order.findUnique({
      where: { id: lastOrder.id },
      select: { id: true, status: true }
    });

    console.log('\n=== Verificação Final ===');
    console.log('Status FINAL no banco:', check.status);
    console.log('Atualização bem-sucedida?', check.status === 'APPROVED' ? '✅ SIM' : '❌ NÃO');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();
