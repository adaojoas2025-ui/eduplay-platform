/**
 * Script para corrigir pedido e adicionar links de arquivos ao produto
 * Uso: node scripts/fix-order-and-product.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando pedido mais recente...');

    // Busca o pedido mais recente
    const order = await prisma.order.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        product: true,
        buyer: true
      }
    });

    if (!order) {
      console.log('❌ Nenhum pedido encontrado');
      return;
    }

    console.log(`✅ Pedido encontrado: ${order.id}`);
    console.log(`   Produto: ${order.product.title}`);
    console.log(`   Comprador: ${order.buyer.email}`);
    console.log(`   Status atual: ${order.status}`);

    // Atualiza o status do pedido para APPROVED se estiver PENDING
    if (order.status === 'PENDING') {
      console.log('\n📝 Atualizando status do pedido para APPROVED...');
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'APPROVED',
          paymentStatus: 'approved',
          paidAt: new Date()
        }
      });
      console.log('✅ Pedido atualizado para APPROVED');
    }

    // Verifica se o produto tem arquivos
    console.log(`\n📦 Produto atual:`);
    console.log(`   filesUrl: ${JSON.stringify(order.product.filesUrl)}`);
    console.log(`   videoUrl: ${order.product.videoUrl || 'nenhum'}`);

    // Atualiza o produto com links de exemplo se estiver vazio
    if (!order.product.filesUrl || order.product.filesUrl.length === 0) {
      console.log('\n📝 Adicionando links de exemplo ao produto...');

      const filesUrl = [
        'https://drive.google.com/file/d/exemplo1/view',
        'https://www.example.com/curso/modulo1.pdf'
      ];

      await prisma.product.update({
        where: { id: order.product.id },
        data: {
          filesUrl: filesUrl,
          videoUrl: 'https://youtube.com/watch?v=exemplo'
        }
      });

      console.log('✅ Produto atualizado com links de exemplo');
      console.log(`   filesUrl: ${JSON.stringify(filesUrl)}`);
    }

    console.log('\n✅ Script executado com sucesso!');
    console.log(`\n🎉 Agora acesse: http://localhost:5173/my-products`);
    console.log(`   Você verá o produto com os links de download!`);

  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
