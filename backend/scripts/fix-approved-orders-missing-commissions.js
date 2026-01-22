/**
 * Script para corrigir pedidos aprovados sem comissão
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixApprovedOrders() {
  console.log('\n🔧 CORRIGINDO PEDIDOS APROVADOS SEM COMISSÃO\n');

  try {
    // Buscar todos os pedidos aprovados
    const approvedOrders = await prisma.order.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        commission: true,
        product: {
          select: {
            producerId: true,
            title: true,
          },
        },
      },
    });

    console.log(`📦 Total de pedidos aprovados: ${approvedOrders.length}\n`);

    let fixed = 0;
    let skipped = 0;

    for (const order of approvedOrders) {
      if (order.commission) {
        console.log(`⏭️  Pedido ${order.id} já tem comissão - pulando`);
        skipped++;
        continue;
      }

      const platformFeeAmount = order.amount * 0.03; // 3% platform fee

      // Criar comissão
      await prisma.commissions.create({
        data: {
          orderId: order.id,
          producerId: order.product.producerId,
          amount: platformFeeAmount,
          status: 'PENDING',
        },
      });

      console.log(`✅ Comissão criada para pedido ${order.id}:`);
      console.log(`   Produto: ${order.product.title}`);
      console.log(`   Valor do pedido: R$ ${order.amount.toFixed(2)}`);
      console.log(`   Comissão (3%): R$ ${platformFeeAmount.toFixed(2)}`);
      console.log('');

      fixed++;
    }

    console.log('='.repeat(60));
    console.log('📊 RESUMO:');
    console.log('='.repeat(60));
    console.log(`Total de pedidos aprovados: ${approvedOrders.length}`);
    console.log(`Comissões criadas: ${fixed}`);
    console.log(`Já tinham comissão: ${skipped}`);
    console.log('\n✅ Processamento concluído!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixApprovedOrders();
