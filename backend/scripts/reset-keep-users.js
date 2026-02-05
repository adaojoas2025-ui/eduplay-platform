/**
 * Script para reset do banco mantendo TODOS os usuarios
 * Remove: produtos, pedidos, comissoes, transferencias, reviews, carrinho, combos
 * Mantem: usuarios, gamificacao
 *
 * Uso: node scripts/reset-keep-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetKeepUsers() {
  console.log('🧹 RESET DO BANCO - MANTENDO USUARIOS\n');
  console.log('═'.repeat(60));

  try {
    // Mostrar estado atual
    const before = {
      users: await prisma.users.count(),
      products: await prisma.products.count(),
      orders: await prisma.orders.count(),
      commissions: await prisma.commissions.count(),
      pixTransfers: await prisma.pix_transfers.count(),
      reviews: await prisma.reviews.count(),
      cartItems: await prisma.cart_items.count(),
      combos: await prisma.combos.count(),
      orderBumps: await prisma.order_bumps.count(),
    };

    console.log('\n📊 Estado ANTES:');
    console.log(`   Usuarios: ${before.users} (serao MANTIDOS)`);
    console.log(`   Produtos: ${before.products}`);
    console.log(`   Pedidos: ${before.orders}`);
    console.log(`   Comissoes: ${before.commissions}`);
    console.log(`   Transferencias PIX: ${before.pixTransfers}`);
    console.log(`   Reviews: ${before.reviews}`);
    console.log(`   Itens carrinho: ${before.cartItems}`);
    console.log(`   Combos: ${before.combos}`);
    console.log(`   Order Bumps: ${before.orderBumps}`);

    console.log('\n🗑️  Deletando dados...\n');

    // 1. PIX Transfers (FK: orders)
    const d1 = await prisma.pix_transfers.deleteMany({});
    console.log(`   ✅ Transferencias PIX: ${d1.count}`);

    // 2. Commissions (FK: orders)
    const d2 = await prisma.commissions.deleteMany({});
    console.log(`   ✅ Comissoes: ${d2.count}`);

    // 3. Orders (FK: products)
    const d3 = await prisma.orders.deleteMany({});
    console.log(`   ✅ Pedidos: ${d3.count}`);

    // 4. Reviews (FK: products)
    const d4 = await prisma.reviews.deleteMany({});
    console.log(`   ✅ Reviews: ${d4.count}`);

    // 5. Cart Items (FK: products)
    const d5 = await prisma.cart_items.deleteMany({});
    console.log(`   ✅ Itens carrinho: ${d5.count}`);

    // 6. Combo Products (FK: combos)
    const d6 = await prisma.combo_products.deleteMany({});
    console.log(`   ✅ Produtos de combos: ${d6.count}`);

    // 7. Combos
    const d7 = await prisma.combos.deleteMany({});
    console.log(`   ✅ Combos: ${d7.count}`);

    // 8. Order Bumps (FK: products)
    const d8 = await prisma.order_bumps.deleteMany({});
    console.log(`   ✅ Order Bumps: ${d8.count}`);

    // 9. Products
    const d9 = await prisma.products.deleteMany({});
    console.log(`   ✅ Produtos: ${d9.count}`);

    // Verificar resultado
    const after = {
      users: await prisma.users.count(),
      products: await prisma.products.count(),
      orders: await prisma.orders.count(),
    };

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 RESET CONCLUIDO!');
    console.log('═'.repeat(60));
    console.log('\n📊 Estado DEPOIS:');
    console.log(`   Usuarios: ${after.users} ✅ (mantidos)`);
    console.log(`   Produtos: ${after.products}`);
    console.log(`   Pedidos: ${after.orders}`);

    // Listar usuarios mantidos
    const users = await prisma.users.findMany({
      select: { name: true, email: true, role: true }
    });
    console.log('\n👥 Usuarios mantidos:');
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - ${u.role}`);
    });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetKeepUsers();
