/**
 * Script para corrigir o role do usuário joasjosefarias@gmail.com para PRODUCER
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Buscando usuário joasjosefarias@gmail.com...\n');

  // Buscar usuário pelo email
  const user = await prisma.user.findFirst({
    where: {
      email: 'joasjosefarias@gmail.com'
    }
  });

  if (!user) {
    console.log('Usuário não encontrado!');
    return;
  }

  console.log('Usuário encontrado:');
  console.log(`  ID: ${user.id}`);
  console.log(`  Nome: ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role atual: ${user.role}`);

  if (user.role === 'PRODUCER') {
    console.log('\nUsuário já é PRODUCER. Nenhuma alteração necessária.');
    return;
  }

  // Atualizar para PRODUCER
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'PRODUCER' }
  });

  console.log(`\nRole atualizado com sucesso!`);
  console.log(`  Novo role: ${updated.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
