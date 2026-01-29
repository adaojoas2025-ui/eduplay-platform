/**
 * Script para limpar todos os tokens de reset de senha
 * Isso garante que não há tokens duplicados ou antigos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearResetTokens() {
  try {
    console.log('=== Limpando tokens de reset de senha ===\n');

    // Primeiro, vamos ver quantos usuários têm tokens de reset
    const usersWithTokens = await prisma.users.findMany({
      where: {
        resetPasswordToken: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetPasswordToken: true,
        resetPasswordExpires: true
      }
    });

    console.log(`Encontrados ${usersWithTokens.length} usuários com tokens de reset:\n`);

    for (const user of usersWithTokens) {
      console.log(`- ${user.email} (${user.id})`);
      console.log(`  Token: ${user.resetPasswordToken?.substring(0, 20)}...`);
      console.log(`  Expira: ${user.resetPasswordExpires}`);
      console.log('');
    }

    // Verificar se há tokens duplicados
    const tokenCounts = {};
    for (const user of usersWithTokens) {
      const token = user.resetPasswordToken;
      if (token) {
        tokenCounts[token] = (tokenCounts[token] || 0) + 1;
      }
    }

    const duplicates = Object.entries(tokenCounts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️ TOKENS DUPLICADOS ENCONTRADOS:');
      for (const [token, count] of duplicates) {
        console.log(`  Token ${token.substring(0, 20)}... aparece ${count} vezes`);
      }
      console.log('');
    }

    // Limpar todos os tokens
    const result = await prisma.users.updateMany({
      where: {
        resetPasswordToken: { not: null }
      },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    console.log(`✅ ${result.count} tokens de reset foram limpos.\n`);
    console.log('Agora você pode testar a recuperação de senha novamente.');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearResetTokens();
