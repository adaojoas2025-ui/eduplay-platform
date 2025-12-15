/**
 * Script para criar uma compra de teste
 * Uso: node scripts/create-test-purchase.js <buyerEmail> <productId>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const buyerEmail = process.argv[2] || 'adao1980aguiar@gmail.com';
    const productTitle = process.argv[3] || 'apostila de artes';

    console.log(`🔍 Buscando comprador: ${buyerEmail}`);
    const buyer = await prisma.user.findUnique({
      where: { email: buyerEmail }
    });

    if (!buyer) {
      console.log(`❌ Comprador não encontrado: ${buyerEmail}`);
      return;
    }

    console.log(`✅ Comprador encontrado: ${buyer.name}`);

    console.log(`\n🔍 Buscando produto: ${productTitle}`);
    const product = await prisma.product.findFirst({
      where: {
        title: {
          contains: productTitle,
          mode: 'insensitive'
        }
      }
    });

    if (!product) {
      console.log(`❌ Produto não encontrado com título contendo: "${productTitle}"`);
      console.log('\n📋 Produtos disponíveis:');
      const allProducts = await prisma.product.findMany({
        select: { id: true, title: true, price: true }
      });
      allProducts.forEach(p => console.log(`   - ${p.title} (R$ ${p.price})`));
      return;
    }

    console.log(`✅ Produto encontrado: ${product.title} (R$ ${product.price})`);

    // Verifica se já existe uma compra
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: buyer.id,
        productId: product.id
      }
    });

    if (existingOrder) {
      console.log(`\n⚠️  Compra já existe!`);
      console.log(`   Status: ${existingOrder.status}`);

      if (existingOrder.status === 'PENDING') {
        console.log(`\n📝 Atualizando para APPROVED...`);
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: 'APPROVED',
            paymentStatus: 'approved',
            paidAt: new Date()
          }
        });
        console.log(`✅ Pedido atualizado para APPROVED`);
      }
    } else {
      console.log(`\n📝 Criando nova compra...`);

      const platformFeePercent = 10;
      const amount = product.price;
      const platformFee = (amount * platformFeePercent) / 100;
      const producerAmount = amount - platformFee;

      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          productId: product.id,
          amount: amount,
          platformFee: platformFee,
          producerAmount: producerAmount,
          paymentMethod: 'PIX',
          status: 'APPROVED',
          paymentStatus: 'approved',
          paidAt: new Date()
        }
      });

      console.log(`✅ Compra criada com sucesso!`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Valor: R$ ${amount}`);
    }

    // Atualiza o produto com links de exemplo se estiver vazio
    if (!product.filesUrl || product.filesUrl.length === 0) {
      console.log(`\n📝 Adicionando links ao produto...`);

      await prisma.product.update({
        where: { id: product.id },
        data: {
          filesUrl: [
            'https://drive.google.com/file/d/exemplo-apostila-artes/view',
            'https://example.com/materiais/apostila-artes.pdf'
          ],
          videoUrl: 'https://youtube.com/watch?v=exemplo-aula-artes'
        }
      });

      console.log(`✅ Links adicionados ao produto`);
    }

    console.log(`\n🎉 Tudo pronto!`);
    console.log(`\n📱 Acesse: http://localhost:5173/my-products`);
    console.log(`   Você verá o produto com os botões de download!`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
