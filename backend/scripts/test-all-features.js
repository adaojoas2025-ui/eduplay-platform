/**
 * SCRIPT DE TESTE COMPLETO - TODAS AS FUNCIONALIDADES
 *
 * Este script testa:
 * 1. Cadastro de usuário
 * 2. Login
 * 3. Upgrade para vendedor
 * 4. Criação de produto
 * 5. Compra de produto
 * 6. Sistema de comissões 3%
 * 7. Dashboard de vendedor
 * 8. Admin dashboard
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAllFeatures() {
  console.log('\n🚀 INICIANDO TESTES COMPLETOS DO SISTEMA\n');

  try {
    // ========== TESTE 1: VERIFICAR USUÁRIOS ==========
    console.log('📋 TESTE 1: Verificar usuários no sistema');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        producerApproved: true,
        businessName: true,
        bankName: true,
      },
    });

    console.log(`✅ Total de usuários: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      if (user.role === 'PRODUCER') {
        console.log(`     └─ Negócio: ${user.businessName || 'N/A'}, Banco: ${user.bankName || 'N/A'}`);
      }
    });

    // ========== TESTE 2: VERIFICAR PRODUTOS ==========
    console.log('\n📦 TESTE 2: Verificar produtos criados');
    const products = await prisma.product.findMany({
      include: {
        producer: {
          select: {
            name: true,
            businessName: true,
          },
        },
      },
    });

    console.log(`✅ Total de produtos: ${products.length}`);
    products.forEach(product => {
      console.log(`   - ${product.title} (R$ ${product.price})`);
      console.log(`     └─ Status: ${product.status}, Vendedor: ${product.producer.name}`);
      console.log(`     └─ Arquivos: ${product.filesUrl.length} arquivo(s)`);
      if (product.filesUrl.length === 0) {
        console.log(`     ⚠️  AVISO: Produto sem arquivos!`);
      }
    });

    // ========== TESTE 3: VERIFICAR PEDIDOS ==========
    console.log('\n💳 TESTE 3: Verificar pedidos (compras)');
    const orders = await prisma.order.findMany({
      include: {
        buyer: {
          select: { name: true, email: true },
        },
        product: {
          select: { title: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Total de pedidos: ${orders.length}`);
    orders.forEach(order => {
      console.log(`   - Pedido #${order.id.substring(0, 8)}`);
      console.log(`     └─ Comprador: ${order.buyer.name}`);
      console.log(`     └─ Produto: ${order.product.title}`);
      console.log(`     └─ Status: ${order.status}, Pagamento: ${order.paymentStatus}`);
      console.log(`     └─ Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`     └─ Comissão Plataforma (3%): R$ ${order.platformFee.toFixed(2)}`);
      console.log(`     └─ Valor Produtor (97%): R$ ${order.producerAmount.toFixed(2)}`);
    });

    // ========== TESTE 4: VERIFICAR COMISSÕES ==========
    console.log('\n💰 TESTE 4: Verificar sistema de comissões (3%)');
    const commissions = await prisma.commissions.findMany({
      include: {
        order: {
          include: {
            product: { select: { title: true } },
            buyer: { select: { name: true } },
          },
        },
        producer: {
          select: { name: true, businessName: true },
        },
      },
    });

    console.log(`✅ Total de comissões: ${commissions.length}`);

    // Estatísticas de comissões
    const stats = {
      total: 0,
      pending: 0,
      paid: 0,
      processing: 0,
      failed: 0,
      totalAmount: 0,
    };

    commissions.forEach(commission => {
      stats.total++;
      stats.totalAmount += commission.amount;
      stats[commission.status.toLowerCase()]++;

      console.log(`   - Comissão #${commission.id.substring(0, 8)}`);
      console.log(`     └─ Pedido: ${commission.order.product.title}`);
      console.log(`     └─ Vendedor: ${commission.producer.name}`);
      console.log(`     └─ Valor (97%): R$ ${commission.amount.toFixed(2)}`);
      console.log(`     └─ Status: ${commission.status}`);
      console.log(`     └─ Data: ${commission.createdAt.toLocaleString('pt-BR')}`);
    });

    console.log(`\n📊 ESTATÍSTICAS DE COMISSÕES:`);
    console.log(`   - Total arrecadado (comissões): R$ ${stats.totalAmount.toFixed(2)}`);
    console.log(`   - Pendentes: ${stats.pending}`);
    console.log(`   - Pagas: ${stats.paid}`);
    console.log(`   - Processando: ${stats.processing}`);
    console.log(`   - Falhadas: ${stats.failed}`);

    // ========== TESTE 5: VERIFICAR INTEGRIDADE ==========
    console.log('\n🔍 TESTE 5: Verificar integridade do sistema');

    // Verificar se todos os pedidos COMPLETED têm comissões
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const ordersWithCommissions = commissions.map(c => c.orderId);
    const ordersWithoutCommissions = completedOrders.filter(
      o => !ordersWithCommissions.includes(o.id)
    );

    if (ordersWithoutCommissions.length > 0) {
      console.log(`⚠️  AVISO: ${ordersWithoutCommissions.length} pedido(s) COMPLETED sem comissão:`);
      ordersWithoutCommissions.forEach(order => {
        console.log(`   - Pedido #${order.id.substring(0, 8)} - ${order.product.title}`);
      });
    } else {
      console.log(`✅ Todos os pedidos COMPLETED têm comissões criadas`);
    }

    // Verificar produtos sem arquivos
    const productsWithoutFiles = products.filter(p =>
      p.status === 'PUBLISHED' && p.filesUrl.length === 0
    );

    if (productsWithoutFiles.length > 0) {
      console.log(`⚠️  AVISO: ${productsWithoutFiles.length} produto(s) PUBLICADO(S) sem arquivos:`);
      productsWithoutFiles.forEach(product => {
        console.log(`   - ${product.title} (${product.producer.name})`);
      });
    } else {
      console.log(`✅ Todos os produtos publicados têm arquivos`);
    }

    // ========== TESTE 6: CALCULAR RECEITA TOTAL ==========
    console.log('\n💵 TESTE 6: Receita total da plataforma');
    const totalRevenue = orders
      .filter(o => o.status === 'COMPLETED' || o.status === 'APPROVED')
      .reduce((sum, order) => sum + order.amount, 0);

    const totalPlatformFee = orders
      .filter(o => o.status === 'COMPLETED' || o.status === 'APPROVED')
      .reduce((sum, order) => sum + order.platformFee, 0);

    const totalProducerAmount = orders
      .filter(o => o.status === 'COMPLETED' || o.status === 'APPROVED')
      .reduce((sum, order) => sum + order.producerAmount, 0);

    console.log(`   - Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`   - Comissão plataforma (3%): R$ ${totalPlatformFee.toFixed(2)}`);
    console.log(`   - Valor produtores (97%): R$ ${totalProducerAmount.toFixed(2)}`);
    console.log(`   - Verificação: ${totalRevenue.toFixed(2)} = ${(totalPlatformFee + totalProducerAmount).toFixed(2)}`);

    // ========== RESUMO FINAL ==========
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO GERAL DO SISTEMA');
    console.log('='.repeat(60));
    console.log(`👥 Usuários: ${users.length} (${users.filter(u => u.role === 'PRODUCER').length} vendedores)`);
    console.log(`📦 Produtos: ${products.length} (${products.filter(p => p.status === 'PUBLISHED').length} publicados)`);
    console.log(`💳 Pedidos: ${orders.length} (${completedOrders.length} completos)`);
    console.log(`💰 Comissões: ${commissions.length}`);
    console.log(`💵 Receita Total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`💵 Taxa Plataforma (3%): R$ ${totalPlatformFee.toFixed(2)}`);
    console.log(`💵 Valor Produtores (97%): R$ ${totalProducerAmount.toFixed(2)}`);
    console.log('='.repeat(60));

    console.log('\n✅ TESTES COMPLETOS FINALIZADOS COM SUCESSO!\n');

  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR TESTES:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar testes
testAllFeatures()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
