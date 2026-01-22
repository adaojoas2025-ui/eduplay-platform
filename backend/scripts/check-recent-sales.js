/**
 * Script para verificar vendas recentes e comissões
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentSales() {
  console.log('\n🔍 VERIFICANDO VENDAS RECENTES\n');

  try {
    // Buscar pedidos aprovados das últimas 24h
    const orders = await prisma.order.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        product: {
          select: {
            title: true,
            producerId: true,
          }
        },
        buyer: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📦 Total de pedidos aprovados: ${orders.length}\n`);

    for (const order of orders) {
      console.log('='.repeat(80));
      console.log(`Pedido ID: ${order.id}`);
      console.log(`Produto: ${order.product.title}`);
      console.log(`Comprador: ${order.buyer.name} (${order.buyer.email})`);
      console.log(`Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`Data: ${order.createdAt.toLocaleString('pt-BR')}`);
      console.log(`Status: ${order.status}`);

      // Verificar se tem comissão
      const commission = await prisma.commissions.findUnique({
        where: { orderId: order.id }
      });

      if (commission) {
        console.log(`✅ COMISSÃO ENCONTRADA:`);
        console.log(`   Valor: R$ ${commission.amount.toFixed(2)}`);
        console.log(`   Status: ${commission.status}`);
        console.log(`   Criada em: ${commission.createdAt.toLocaleString('pt-BR')}`);
      } else {
        console.log(`❌ COMISSÃO NÃO ENCONTRADA!`);
        console.log(`   Comissão esperada: R$ ${(order.amount * 0.03).toFixed(2)} (3%)`);

        // Tentar criar a comissão agora
        try {
          const newCommission = await prisma.commissions.create({
            data: {
              orderId: order.id,
              producerId: order.product.producerId,
              amount: order.amount * 0.03,
              status: 'PENDING',
            }
          });
          console.log(`   ✅ Comissão criada agora: R$ ${newCommission.amount.toFixed(2)}`);
        } catch (err) {
          console.log(`   ❌ Erro ao criar comissão: ${err.message}`);
        }
      }
      console.log('');
    }

    // Resumo de comissões
    const totalCommissions = await prisma.commissions.count();
    const pendingCommissions = await prisma.commissions.count({
      where: { status: 'PENDING' }
    });
    const paidCommissions = await prisma.commissions.count({
      where: { status: 'PAID' }
    });

    console.log('='.repeat(80));
    console.log('📊 RESUMO DE COMISSÕES:');
    console.log('='.repeat(80));
    console.log(`Total de comissões: ${totalCommissions}`);
    console.log(`Pendentes: ${pendingCommissions}`);
    console.log(`Pagas: ${paidCommissions}`);
    console.log(`Pedidos sem comissão: ${orders.length - totalCommissions}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentSales();
