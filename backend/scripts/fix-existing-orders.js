const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingOrders() {
  try {
    console.log('\n=== Verificando pedidos com pagamento aprovado mas status PENDING ===\n');

    // Buscar pedidos PENDING mas com paymentStatus = 'approved'
    const pendingButPaidOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'approved',
        paidAt: {
          not: null
        }
      },
      include: {
        buyer: {
          select: {
            email: true,
            name: true
          }
        },
        product: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`Encontrados ${pendingButPaidOrders.length} pedidos para corrigir\n`);

    if (pendingButPaidOrders.length === 0) {
      console.log('Nenhum pedido precisa ser corrigido.');
      return;
    }

    // Listar os pedidos
    pendingButPaidOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.buyer.email} - ${order.product.title}`);
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Status Atual: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log(`   Paid At: ${order.paidAt.toLocaleString('pt-BR')}\n`);
    });

    // Atualizar todos para APPROVED
    console.log('=== Atualizando pedidos para APPROVED ===\n');

    for (const order of pendingButPaidOrders) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'APPROVED' },
        select: { id: true, status: true }
      });

      console.log(`✅ Pedido ${order.id.substring(0, 8)}... atualizado para ${updated.status}`);
    }

    console.log(`\n✅ Total de ${pendingButPaidOrders.length} pedidos atualizados com sucesso!\n`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingOrders();
