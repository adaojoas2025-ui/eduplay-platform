/**
 * Script para remover todos os usuários não-admin do banco de dados.
 * Mantém apenas usuários com role = ADMIN.
 *
 * Como usar no Render Shell:
 *   node scripts/delete-non-admin-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Listar admins que serão mantidos
  const admins = await prisma.users.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true },
  });
  console.log('=== MANTENDO (admins) ===');
  admins.forEach(u => console.log(`  ✓ ${u.name} (${u.email})`));

  // Listar usuários a remover
  const nonAdmins = await prisma.users.findMany({
    where: { role: { not: 'ADMIN' } },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`\n=== REMOVENDO (${nonAdmins.length} usuários) ===`);
  nonAdmins.forEach(u => console.log(`  ✗ ${u.name} (${u.email}) [${u.role}]`));

  if (nonAdmins.length === 0) {
    console.log('\nNenhum usuário para remover.');
    return;
  }

  const nonAdminIds = nonAdmins.map(u => u.id);

  // IDs dos produtos dos usuários não-admin
  const nonAdminProducts = await prisma.products.findMany({
    where: { producerId: { in: nonAdminIds } },
    select: { id: true },
  });
  const nonAdminProductIds = nonAdminProducts.map(p => p.id);
  console.log(`\nProdutos a remover junto: ${nonAdminProductIds.length}`);

  console.log('\n--- Iniciando limpeza ---');

  // 1. pix_transfers de produtores não-admin (sem cascade do usuário)
  const r1 = await prisma.pix_transfers.deleteMany({
    where: { producerId: { in: nonAdminIds } },
  });
  console.log(`pix_transfers deletados: ${r1.count}`);

  // 2. commissions de produtores não-admin (sem cascade do usuário)
  const r2 = await prisma.commissions.deleteMany({
    where: { producerId: { in: nonAdminIds } },
  });
  console.log(`commissions deletadas: ${r2.count}`);

  // 3. orders onde o comprador é não-admin (cascada: commissions + pix_transfers do pedido)
  const r3 = await prisma.orders.deleteMany({
    where: { buyerId: { in: nonAdminIds } },
  });
  console.log(`orders (compradores não-admin) deletados: ${r3.count}`);

  // 4. orders de produtos não-admin (para não falhar ao deletar o produto)
  if (nonAdminProductIds.length > 0) {
    const r4 = await prisma.orders.deleteMany({
      where: { productId: { in: nonAdminProductIds } },
    });
    console.log(`orders (produtos não-admin) deletados: ${r4.count}`);
  }

  // 5. Deletar usuários não-admin
  //    Cascade automático: products, combos, cart_items, order_bumps, reviews, user_gamification
  const r5 = await prisma.users.deleteMany({
    where: { id: { in: nonAdminIds } },
  });
  console.log(`\n✅ Usuários removidos: ${r5.count}`);
  console.log('Concluído.');
}

main()
  .catch(e => {
    console.error('\n❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
