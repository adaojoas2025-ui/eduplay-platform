const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishBiblia() {
  try {
    const app = await prisma.app.update({
      where: { id: 'd0a8cb50-207b-4d32-99a7-cad0113b904e' },
      data: { status: 'PUBLISHED' },
    });

    console.log('✅ App "biblia" publicado com sucesso!');
    console.log('   ID:', app.id);
    console.log('   Título:', app.title);
    console.log('   Status:', app.status);
  } catch (error) {
    console.error('❌ Erro ao publicar app:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

publishBiblia();
