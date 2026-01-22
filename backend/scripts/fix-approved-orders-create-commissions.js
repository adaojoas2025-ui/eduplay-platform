/**
 * SCRIPT: Corrigir pedidos APPROVED e criar comissões
 *
 * Problema: Pedidos foram marcados como APPROVED mas deveriam ser COMPLETED
 * Solução: Atualizar todos os pedidos APPROVED -> COMPLETED e criar comissões
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixApprovedOrders() {
  console.log('\n🔧 CORREÇÃO: Atualizando pedidos APPROVED para COMPLETED e criando comissões\n');

  try {
    // 1. Buscar todos os pedidos APPROVED
    const approvedOrders = await prisma.order.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        product: {
          select: {
            title: true,
            producerId: true,
          },
        },
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📋 Encontrados ${approvedOrders.length} pedidos com status APPROVED\n`);

    if (approvedOrders.length === 0) {
      console.log('✅ Nenhum pedido para corrigir!');
      return;
    }

    let updatedCount = 0;
    let commissionsCreated = 0;

    for (const order of approvedOrders) {
      console.log(`\n  Processando Pedido #${order.id.substring(0, 8)}...`);
      console.log(`  └─ Comprador: ${order.buyer.name}`);
      console.log(`  └─ Produto: ${order.product.title}`);
      console.log(`  └─ Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`  └─ Comissão (97%): R$ ${order.producerAmount.toFixed(2)}`);

      // 2. Atualizar status para COMPLETED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });

      console.log(`  ✅ Status atualizado: APPROVED → COMPLETED`);
      updatedCount++;

      // 3. Verificar se já existe comissão
      const existingCommission = await prisma.commissions.findUnique({
        where: { orderId: order.id },
      });

      if (existingCommission) {
        console.log(`  ⚠️  Comissão já existe (ID: ${existingCommission.id.substring(0, 8)})`);
      } else {
        // 4. Criar comissão
        const commission = await prisma.commissions.create({
          data: {
            orderId: order.id,
            producerId: order.product.producerId,
            amount: order.producerAmount,
            status: 'PENDING',
          },
        });

        console.log(`  💰 Comissão criada (ID: ${commission.id.substring(0, 8)}) - R$ ${commission.amount.toFixed(2)}`);
        commissionsCreated++;
      }

      // 5. Incrementar vendas do produto
      await prisma.product.update({
        where: { id: order.productId },
        data: {
          sales: {
            increment: 1,
          },
        },
      });

      console.log(`  📈 Contador de vendas incrementado`);
    }

    // Estatísticas finais
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA CORREÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Pedidos atualizados: ${updatedCount}`);
    console.log(`💰 Comissões criadas: ${commissionsCreated}`);
    console.log(`⚠️  Comissões já existentes: ${approvedOrders.length - commissionsCreated}`);
    console.log('='.repeat(60));

    // Verificar se todas as comissões foram criadas
    const totalCommissions = await prisma.commissions.count();
    console.log(`\n💰 Total de comissões no sistema agora: ${totalCommissions}`);

    const totalCompletedOrders = await prisma.order.count({
      where: { status: 'COMPLETED' },
    });
    console.log(`📦 Total de pedidos COMPLETED: ${totalCompletedOrders}`);

    if (totalCommissions === totalCompletedOrders) {
      console.log('\n✅ PERFEITO! Todos os pedidos COMPLETED têm comissões!\n');
    } else {
      console.log(`\n⚠️  ATENÇÃO: Diferença de ${Math.abs(totalCompletedOrders - totalCommissions)} entre pedidos e comissões\n`);
    }

  } catch (error) {
    console.error('\n❌ ERRO AO CORRIGIR PEDIDOS:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixApprovedOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
