/**
 * Script para verificar pedidos e comissões
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCommissions() {
  console.log('\n🔍 VERIFICANDO PEDIDOS E COMISSÕES\n');

  try {
    // Buscar todos os pedidos
    const orders = await prisma.order.findMany({
      include: {
        product: {
          select: {
            title: true,
            price: true,
            producerId: true,
            producer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        buyer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📦 Total de pedidos: ${orders.length}\n`);

    // Buscar todas as comissões
    const commissions = await prisma.commission.findMany({
      include: {
        order: {
          select: {
            id: true,
            status: true,
            amount: true
          }
        },
        producer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`💰 Total de comissões: ${commissions.length}\n`);

    // Mostrar últimos pedidos
    console.log('='.repeat(80));
    console.log('📋 ÚLTIMOS PEDIDOS:');
    console.log('='.repeat(80));

    orders.slice(0, 5).forEach((order, index) => {
      console.log(`\n${index + 1}. Pedido ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`   Produto: ${order.product.title}`);
      console.log(`   Preço do Produto: R$ ${order.product.price.toFixed(2)}`);
      console.log(`   Comprador: ${order.buyer.name} (${order.buyer.email})`);
      console.log(`   Vendedor: ${order.product.producer.name} (${order.product.producer.email})`);
      console.log(`   Data: ${order.createdAt.toLocaleString('pt-BR')}`);

      // Verificar se tem comissão
      const orderCommission = commissions.find(c => c.orderId === order.id);
      if (orderCommission) {
        console.log(`   ✅ Comissão: R$ ${orderCommission.amount.toFixed(2)} (${orderCommission.percentage}%)`);
        console.log(`   Status da Comissão: ${orderCommission.status}`);
      } else {
        console.log(`   ❌ SEM COMISSÃO GERADA!`);
      }
    });

    // Mostrar todas as comissões
    if (commissions.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('💰 TODAS AS COMISSÕES:');
      console.log('='.repeat(80));

      commissions.forEach((commission, index) => {
        console.log(`\n${index + 1}. Comissão ID: ${commission.id}`);
        console.log(`   Pedido ID: ${commission.orderId}`);
        console.log(`   Valor: R$ ${commission.amount.toFixed(2)}`);
        console.log(`   Percentual: ${commission.percentage}%`);
        console.log(`   Status: ${commission.status}`);
        console.log(`   Vendedor: ${commission.producer.name}`);
        console.log(`   Status do Pedido: ${commission.order.status}`);
        console.log(`   Data: ${commission.createdAt.toLocaleString('pt-BR')}`);
      });
    }

    // Calcular totais
    const totalPedidos = orders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
    const totalComissoes = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO:');
    console.log('='.repeat(80));
    console.log(`Total em Pedidos: R$ ${totalPedidos.toFixed(2)}`);
    console.log(`Total em Comissões: R$ ${totalComissoes.toFixed(2)}`);
    console.log(`Pedidos sem comissão: ${orders.length - commissions.length}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkCommissions();
