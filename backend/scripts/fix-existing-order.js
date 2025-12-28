const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExistingOrder() {
  try {
    const orderId = 'e7fc1f5d-f42a-47b5-83d1-cf0a8a0ccdde';

    console.log('🔧 Corrigindo pedido existente...\n');

    // 1. Buscar o pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            producer: true
          }
        },
        buyer: true
      }
    });

    if (!order) {
      console.log('❌ Pedido não encontrado!');
      return;
    }

    console.log('📦 Pedido encontrado:');
    console.log(`   ID: ${order.id}`);
    console.log(`   Status atual: ${order.status}`);
    console.log(`   Valor: R$ ${order.amount}`);
    console.log(`   Produto: ${order.product.title}`);
    console.log(`   Produtor: ${order.product.producer.name}`);
    console.log(`   Comprador: ${order.buyer.name}`);

    // 2. Atualizar status do pedido para COMPLETED
    console.log('\n🔄 Atualizando status para COMPLETED...');
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    });
    console.log('✅ Status atualizado');

    // 3. Calcular comissão (3%)
    const commissionRate = 0.03;
    const commissionAmount = order.producerAmount * commissionRate;

    console.log('\n💰 Criando comissão:');
    console.log(`   Valor do produto: R$ ${order.amount}`);
    console.log(`   Valor do produtor: R$ ${order.producerAmount}`);
    console.log(`   Taxa de comissão: 3%`);
    console.log(`   Valor da comissão: R$ ${commissionAmount.toFixed(2)}`);

    // 4. Criar comissão
    const commission = await prisma.commission.create({
      data: {
        orderId: order.id,
        producerId: order.product.producerId,
        amount: commissionAmount,
        status: 'PENDING'
      }
    });

    console.log('\n✅ Comissão criada com sucesso!');
    console.log(`   ID da comissão: ${commission.id}`);
    console.log(`   Valor: R$ ${commission.amount.toFixed(2)}`);
    console.log(`   Status: ${commission.status}`);

    // 5. Incrementar vendas do produto
    console.log('\n📈 Incrementando contador de vendas...');
    await prisma.product.update({
      where: { id: order.productId },
      data: {
        sales: {
          increment: 1
        }
      }
    });
    console.log('✅ Vendas incrementadas');

    console.log('\n🎉 Correção concluída com sucesso!');
    console.log('\nResumo:');
    console.log(`   - Pedido atualizado para COMPLETED`);
    console.log(`   - Comissão de R$ ${commissionAmount.toFixed(2)} criada`);
    console.log(`   - Vendas do produto incrementadas`);

  } catch (error) {
    console.error('\n❌ Erro ao corrigir pedido:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingOrder();
