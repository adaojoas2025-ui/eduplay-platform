const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed gamification data
 * Creates initial badges and missions
 */

const badges = [
  // First Purchase Badges
  {
    name: 'Primeira Compra',
    description: 'Realizou sua primeira compra na plataforma',
    type: 'FIRST_PURCHASE',
    icon: '🛒',
    requiredValue: 1,
    points: 100,
    rarity: 'COMMON',
  },
  {
    name: 'Comprador Frequente',
    description: 'Realizou 5 compras',
    type: 'FIRST_PURCHASE',
    icon: '🛍️',
    requiredValue: 5,
    points: 250,
    rarity: 'RARE',
  },
  {
    name: 'Entusiasta',
    description: 'Realizou 10 compras',
    type: 'FIRST_PURCHASE',
    icon: '💎',
    requiredValue: 10,
    points: 500,
    rarity: 'EPIC',
  },
  {
    name: 'Colecionador Master',
    description: 'Realizou 25 compras',
    type: 'FIRST_PURCHASE',
    icon: '👑',
    requiredValue: 25,
    points: 1000,
    rarity: 'LEGENDARY',
  },

  // First Sale Badges
  {
    name: 'Primeira Venda',
    description: 'Realizou sua primeira venda como produtor',
    type: 'FIRST_SALE',
    icon: '💰',
    requiredValue: 1,
    points: 150,
    rarity: 'COMMON',
  },
  {
    name: 'Vendedor Bronze',
    description: 'Realizou 10 vendas',
    type: 'FIRST_SALE',
    icon: '🥉',
    requiredValue: 10,
    points: 500,
    rarity: 'RARE',
  },
  {
    name: 'Vendedor Prata',
    description: 'Realizou 50 vendas',
    type: 'FIRST_SALE',
    icon: '🥈',
    requiredValue: 50,
    points: 1500,
    rarity: 'EPIC',
  },
  {
    name: 'Vendedor Ouro',
    description: 'Realizou 100 vendas',
    type: 'FIRST_SALE',
    icon: '🥇',
    requiredValue: 100,
    points: 3000,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Vendedor Elite',
    description: 'Realizou 500 vendas',
    type: 'FIRST_SALE',
    icon: '⭐',
    requiredValue: 500,
    points: 10000,
    rarity: 'LEGENDARY',
  },

  // Course Completion Badges
  {
    name: 'Primeiro Curso',
    description: 'Completou seu primeiro curso',
    type: 'COURSES_COMPLETED',
    icon: '📚',
    requiredValue: 1,
    points: 100,
    rarity: 'COMMON',
  },
  {
    name: 'Estudante Dedicado',
    description: 'Completou 5 cursos',
    type: 'COURSES_COMPLETED',
    icon: '📖',
    requiredValue: 5,
    points: 300,
    rarity: 'RARE',
  },
  {
    name: 'Mestre do Conhecimento',
    description: 'Completou 10 cursos',
    type: 'COURSES_COMPLETED',
    icon: '🎓',
    requiredValue: 10,
    points: 750,
    rarity: 'EPIC',
  },
  {
    name: 'Sábio',
    description: 'Completou 25 cursos',
    type: 'COURSES_COMPLETED',
    icon: '🧙',
    requiredValue: 25,
    points: 2000,
    rarity: 'LEGENDARY',
  },

  // Review Badges
  {
    name: 'Primeira Avaliação',
    description: 'Fez sua primeira avaliação',
    type: 'REVIEWS_MADE',
    icon: '⭐',
    requiredValue: 1,
    points: 25,
    rarity: 'COMMON',
  },
  {
    name: 'Crítico',
    description: 'Fez 10 avaliações',
    type: 'REVIEWS_MADE',
    icon: '✍️',
    requiredValue: 10,
    points: 150,
    rarity: 'RARE',
  },
  {
    name: 'Avaliador Expert',
    description: 'Fez 50 avaliações',
    type: 'REVIEWS_MADE',
    icon: '🏆',
    requiredValue: 50,
    points: 500,
    rarity: 'EPIC',
  },

  // Streak Badges
  {
    name: 'Streak 7 Dias',
    description: 'Manteve um streak de 7 dias consecutivos',
    type: 'STREAK_ACHIEVEMENT',
    icon: '🔥',
    requiredValue: 7,
    points: 200,
    rarity: 'RARE',
  },
  {
    name: 'Streak 30 Dias',
    description: 'Manteve um streak de 30 dias consecutivos',
    type: 'STREAK_ACHIEVEMENT',
    icon: '💪',
    requiredValue: 30,
    points: 1000,
    rarity: 'EPIC',
  },
  {
    name: 'Streak 100 Dias',
    description: 'Manteve um streak de 100 dias consecutivos',
    type: 'STREAK_ACHIEVEMENT',
    icon: '🌟',
    requiredValue: 100,
    points: 5000,
    rarity: 'LEGENDARY',
  },

  // Engagement Badges
  {
    name: 'Bem-vindo',
    description: 'Criou uma conta na plataforma',
    type: 'ENGAGEMENT',
    icon: '👋',
    requiredValue: 0,
    points: 50,
    rarity: 'COMMON',
  },
];

const missions = [
  // Daily Missions
  {
    title: 'Login Diário',
    description: 'Faça login na plataforma',
    type: 'DAILY',
    targetValue: 1,
    pointsReward: 10,
    icon: '🌅',
    maxCompletions: 365, // Can be completed daily for a year
  },
  {
    title: 'Explorador Diário',
    description: 'Visualize 5 produtos diferentes',
    type: 'DAILY',
    targetValue: 5,
    pointsReward: 20,
    icon: '🔍',
    maxCompletions: 365,
  },

  // Weekly Missions
  {
    title: 'Comprador da Semana',
    description: 'Realize 2 compras esta semana',
    type: 'WEEKLY',
    targetValue: 2,
    pointsReward: 150,
    icon: '🛍️',
    maxCompletions: 52,
  },
  {
    title: 'Avaliador Semanal',
    description: 'Faça 3 avaliações esta semana',
    type: 'WEEKLY',
    targetValue: 3,
    pointsReward: 100,
    icon: '⭐',
    maxCompletions: 52,
  },
  {
    title: 'Produtor Ativo',
    description: 'Realize 5 vendas esta semana',
    type: 'WEEKLY',
    targetValue: 5,
    pointsReward: 200,
    icon: '💼',
    maxCompletions: 52,
  },

  // Monthly Missions
  {
    title: 'Estudante do Mês',
    description: 'Complete 3 cursos este mês',
    type: 'MONTHLY',
    targetValue: 3,
    pointsReward: 500,
    icon: '📚',
    maxCompletions: 12,
  },
  {
    title: 'Top Vendedor',
    description: 'Realize 20 vendas este mês',
    type: 'MONTHLY',
    targetValue: 20,
    pointsReward: 1000,
    icon: '🏆',
    maxCompletions: 12,
  },
  {
    title: 'Engajamento Total',
    description: 'Mantenha um streak de 30 dias',
    type: 'MONTHLY',
    targetValue: 30,
    pointsReward: 750,
    icon: '🔥',
    maxCompletions: 12,
  },

  // Special Missions
  {
    title: 'Boas-vindas',
    description: 'Complete seu perfil pela primeira vez',
    type: 'SPECIAL',
    targetValue: 1,
    pointsReward: 100,
    icon: '🎉',
    maxCompletions: 1,
  },
];

async function seedGamification() {
  console.log('🎮 Starting gamification seed...');

  try {
    // Clear existing data
    console.log('Clearing existing gamification data...');
    await prisma.userMission.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.pointsHistory.deleteMany();
    await prisma.leaderboard.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.userGamification.deleteMany();

    // Create badges
    console.log('Creating badges...');
    for (const badge of badges) {
      await prisma.badge.create({
        data: badge,
      });
    }
    console.log(`✅ Created ${badges.length} badges`);

    // Create missions
    console.log('Creating missions...');
    for (const mission of missions) {
      await prisma.mission.create({
        data: mission,
      });
    }
    console.log(`✅ Created ${missions.length} missions`);

    console.log('🎮 Gamification seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding gamification:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedGamification()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedGamification;
