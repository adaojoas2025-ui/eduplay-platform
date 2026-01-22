const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

/**
 * Script de Backup com Múltiplas Opções
 *
 * OPÇÕES DE BACKUP:
 *
 * 1. LOCAL (atual) - Salvo em C:\projetos\backups
 *
 * 2. GOOGLE DRIVE - Adicione o pacote googleapis:
 *    npm install googleapis
 *
 * 3. DROPBOX - Adicione o pacote dropbox:
 *    npm install dropbox
 *
 * 4. AWS S3 - Adicione o pacote @aws-sdk/client-s3:
 *    npm install @aws-sdk/client-s3
 *
 * 5. GITHUB - Commit automático para repositório
 *
 * 6. EMAIL - Enviar por email usando nodemailer:
 *    npm install nodemailer
 */

(async () => {
  try {
    console.log('\n📦 Iniciando backup do banco de dados EDUPLAY...\n');

    // Criar pastas de backup
    const backupDirLocal = path.join(__dirname, '../../backups');
    const backupDirExternal = 'D:/Backups/EDUPLAY'; // Exemplo: Drive externo

    if (!fs.existsSync(backupDirLocal)) {
      fs.mkdirSync(backupDirLocal, { recursive: true });
    }

    // Nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `eduplay_backup_${timestamp}.json`;
    const backupFileLocal = path.join(backupDirLocal, fileName);

    console.log('📂 Coletando dados do banco...\n');

    // Coletar todos os dados
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      database: 'EDUPLAY',
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

    // Salvar localmente
    console.log('💾 Salvando backup LOCAL...');
    fs.writeFileSync(backupFileLocal, JSON.stringify(backup, null, 2));
    const statsLocal = fs.statSync(backupFileLocal);
    const fileSizeInMB = (statsLocal.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ Salvo em: ${backupFileLocal}`);
    console.log(`   💾 Tamanho: ${fileSizeInMB} MB\n`);

    // Tentar salvar em drive externo (se existir)
    if (fs.existsSync('D:')) {
      try {
        if (!fs.existsSync(backupDirExternal)) {
          fs.mkdirSync(backupDirExternal, { recursive: true });
        }
        const backupFileExternal = path.join(backupDirExternal, fileName);
        fs.copyFileSync(backupFileLocal, backupFileExternal);
        console.log('💾 Salvando backup em DRIVE EXTERNO...');
        console.log(`   ✅ Salvo em: ${backupFileExternal}\n`);
      } catch (error) {
        console.log('   ⚠️  Drive externo não disponível\n');
      }
    }

    // Manter apenas últimos 10 backups locais
    console.log('🧹 Limpando backups antigos...');
    const files = fs.readdirSync(backupDirLocal)
      .filter(f => f.startsWith('eduplay_backup_') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(backupDirLocal, f),
        time: fs.statSync(path.join(backupDirLocal, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
      const toDelete = files.slice(10);
      toDelete.forEach(f => {
        fs.unlinkSync(f.path);
        console.log(`   🗑️  Removido: ${f.name}`);
      });
      console.log(`   ✅ ${toDelete.length} backup(s) antigo(s) removido(s)\n`);
    } else {
      console.log(`   ℹ️  ${files.length} backup(s) mantido(s)\n`);
    }

    console.log('✅ BACKUP CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Resumo:');
    console.log(`   📄 Arquivo: ${fileName}`);
    console.log(`   💾 Tamanho: ${fileSizeInMB} MB`);
    console.log(`   🕐 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`   📁 Total de backups: ${files.length}`);
    console.log('\n');

    console.log('💡 DICAS PARA BACKUP NA NUVEM:');
    console.log('   1. Configure o Google Drive Desktop e salve em uma pasta sincronizada');
    console.log('   2. Use Dropbox e aponte backupDirExternal para a pasta do Dropbox');
    console.log('   3. Configure um backup automático agendado no Windows (Task Scheduler)');
    console.log('   4. Faça upload manual para seu GitHub/GitLab em um repositório privado\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Erro ao criar backup:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
