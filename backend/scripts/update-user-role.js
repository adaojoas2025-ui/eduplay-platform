/**
 * Script para verificar pedidos em produção
 * Uso: DATABASE_URL="..." node scripts/update-user-role.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'adao1980aguiar@gmail.com';

    console.log(`🔍 Buscando usuário: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log(`✅ Usuário: ${user.name} (${user.role})`);

    // Busca pedidos
    console.log(`\n🔍 Buscando pedidos...`);
    const orders = await prisma.order.findMany({
      where: {
        buyerId: user.id
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            filesUrl: true,
            videoUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (orders.length === 0) {
      console.log('❌ Nenhum pedido encontrado');
      return;
    }

    console.log(`✅ ${orders.length} pedido(s) encontrado(s):\n`);

    for (const order of orders) {
      console.log(`📦 ${order.product.title}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Pagamento: ${order.paymentStatus || 'N/A'}`);
      console.log(`   Valor: R$ ${order.amount}`);
      console.log(`   Arquivos no produto: ${order.product.filesUrl?.length || 0}`);

      // Atualiza PENDING para APPROVED se o pagamento foi aprovado
      if (order.status === 'PENDING' && order.paymentStatus === 'approved') {
        console.log(`   🔧 Atualizando status para APPROVED...`);
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'APPROVED',
            paidAt: new Date()
          }
        });
        console.log(`   ✅ Atualizado!`);
      }

      console.log('');
    }

    // Mostra produtos aprovados
    const approved = orders.filter(o => o.status === 'APPROVED');
    console.log(`\n✅ ${approved.length} produto(s) disponível(is) em "Meus Produtos"`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
