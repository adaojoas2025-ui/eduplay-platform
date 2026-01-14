require('dotenv').config();
const prisma = require('../src/config/database');

async function testOrderBump() {
  try {
    console.log('🧪 Testando Sistema de Order Bump\n');

    // 1. Buscar um produto existente
    console.log('1️⃣ Buscando produtos...');
    const products = await prisma.products.findMany({
      where: { status: 'PUBLISHED' },
      take: 2
    });

    if (products.length < 2) {
      console.log('❌ Não há produtos suficientes. Crie pelo menos 2 produtos.');
      return;
    }

    console.log(`✅ Encontrados ${products.length} produtos:`);
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.category}) - R$ ${p.price}`);
    });

    // 2. Buscar um produtor
    console.log('\n2️⃣ Buscando produtor...');
    const producer = await prisma.users.findFirst({
      where: { role: { in: ['PRODUCER', 'ADMIN'] } }
    });

    if (!producer) {
      console.log('❌ Nenhum produtor encontrado');
      return;
    }

    console.log(`✅ Produtor: ${producer.name} (${producer.email})`);

    // 3. Criar Order Bump de teste
    console.log('\n3️⃣ Criando Order Bump...');
    const orderBump = await prisma.order_bumps.create({
      data: {
        id: require('crypto').randomUUID(),
        productId: products[1].id,
        title: `🔥 Adicione "${products[1].title}" agora!`,
        description: 'Aproveite esta oferta especial! Produto complementar com 30% de desconto.',
        discountPercent: 30,
        triggerType: 'CATEGORY',
        triggerValues: [products[0].category],
        producerId: producer.id,
        isActive: true,
        priority: 10,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Order Bump criado com ID: ${orderBump.id}`);
    console.log(`   Produto: ${products[1].title}`);
    console.log(`   Desconto: ${orderBump.discountPercent}%`);
    console.log(`   Trigger: ${orderBump.triggerType} = "${orderBump.triggerValues.join(', ')}"`);
    console.log(`   Produtor: ${producer.name}`);

    // 4. Testar sugestões
    console.log('\n4️⃣ Testando sugestões...');
    const suggestions = await prisma.order_bumps.findMany({
      where: {
        isActive: true,
        triggerType: 'CATEGORY',
        triggerValues: { has: products[0].category }
      },
      include: {
        products: true
      }
    });

    console.log(`✅ Encontradas ${suggestions.length} sugestões para categoria "${products[0].category}":`);
    suggestions.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title}`);
      console.log(`      Produto: ${s.products.title}`);
      console.log(`      Preço original: R$ ${s.products.price}`);
      const finalPrice = s.products.price * (1 - s.discountPercent / 100);
      console.log(`      Preço com desconto: R$ ${finalPrice.toFixed(2)}`);
    });

    // 5. Simular tracking
    console.log('\n5️⃣ Simulando analytics...');
    await prisma.order_bumps.update({
      where: { id: orderBump.id },
      data: {
        impressions: { increment: 1 },
        clicks: { increment: 1 },
        conversions: { increment: 1 },
        revenue: { increment: (products[1].price * 0.7) }
      }
    });

    const updated = await prisma.order_bumps.findUnique({
      where: { id: orderBump.id }
    });

    console.log(`✅ Analytics atualizados:`);
    console.log(`   Impressões: ${updated.impressions}`);
    console.log(`   Cliques: ${updated.clicks}`);
    console.log(`   Conversões: ${updated.conversions}`);
    console.log(`   Receita: R$ ${updated.revenue.toFixed(2)}`);
    console.log(`   Taxa de conversão: ${(updated.conversions / updated.impressions * 100).toFixed(1)}%`);

    // 6. Resumo
    console.log('\n\n✅ TESTE COMPLETO!');
    console.log('\n📊 Próximos Passos:');
    console.log('   1. Aguardar deploy do backend no Render (automático)');
    console.log('   2. Testar endpoint: GET /api/v1/order-bumps/suggestions');
    console.log('   3. Implementar frontend (Fase 3)');
    console.log(`\n🌐 URLs para testar:`);
    console.log(`   Backend: https://eduplayja-backend.onrender.com/api/v1/order-bumps/suggestions?category=${products[0].category}`);
    console.log(`   Frontend: https://eduplayja.vercel.app/checkout`);

    console.log('\n🧹 Limpando dados de teste...');
    await prisma.order_bumps.delete({
      where: { id: orderBump.id }
    });
    console.log('✅ Order Bump de teste removido');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderBump();
