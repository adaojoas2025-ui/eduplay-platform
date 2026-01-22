const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('\n📦 Iniciando backup do banco de dados EDUPLAY...\n');

    // Criar pasta de backups
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(backupDir, `eduplay_backup_${timestamp}.json`);

    console.log('📂 Coletando dados...\n');

    // Coletar todos os dados
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users: await prisma.user.findMany(),
        products: await prisma.product.findMany(),
        apps: await prisma.app.findMany(),
        orders: await prisma.order.findMany(),
        commissions: await prisma.commissions.findMany(),
        appDownloads: await prisma.appDownload.findMany(),
        appReviews: await prisma.appReview.findMany(),
        combos: await prisma.combo.findMany({
          include: {
            products: true
          }
        })
      }
    };

    // Estatísticas
    console.log('📊 Dados coletados:');
    console.log(`   👥 Usuários: ${backup.data.users.length}`);
    console.log(`   📦 Produtos: ${backup.data.products.length}`);
    console.log(`   🎮 Apps: ${backup.data.apps.length}`);
    console.log(`   🛒 Pedidos: ${backup.data.orders.length}`);
    console.log(`   💰 Comissões: ${backup.data.commissions.length}`);
    console.log(`   📥 Downloads: ${backup.data.appDownloads.length}`);
    console.log(`   ⭐ Avaliações: ${backup.data.appReviews.length}`);
    console.log(`   🎁 Combos: ${backup.data.combos.length}\n`);

    // Salvar arquivo
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Backup criado com sucesso!\n');
    console.log('📄 Informações do arquivo:');
    console.log(`   📁 Local: ${backupFile}`);
    console.log(`   💾 Tamanho: ${fileSizeInMB} MB`);
    console.log(`   🕐 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Erro ao criar backup:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
