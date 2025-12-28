const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedApps() {
  try {
    console.log('🎮 Criando apps de exemplo...');

    const sampleApps = [
      {
        title: 'Bullet Army Run',
        developer: 'Supersonic Studios LTD',
        description: 'Derrote seus inimigos criando um exército maior de balas!\n\nBullet Army Run é um jogo casual viciante onde você controla um personagem que coleta balas para criar um exército poderoso. Quanto mais balas você coletar, maior será seu poder de fogo!\n\nCaracterísticas:\n• Jogabilidade simples e viciante\n• Gráficos coloridos e divertidos\n• Níveis desafiadores\n• Controles fáceis de usar\n• Diversão garantida para todas as idades',
        shortDescription: 'Derrote seus inimigos criando um exército maior de balas!',
        iconUrl: 'https://play-lh.googleusercontent.com/mVXn7KZqKvwBjqLwPqXYqGvD0RSXQ-BPqvLCkP8M0-z6cZYQ-1-q5PnqP_YfRqX-rQ=s256',
        coverImages: [
          'https://play-lh.googleusercontent.com/screenshots/bullet-army-1.png',
          'https://play-lh.googleusercontent.com/screenshots/bullet-army-2.png',
          'https://play-lh.googleusercontent.com/screenshots/bullet-army-3.png'
        ],
        category: 'Jogos',
        ageRating: '10+',
        fileSize: '121 MB',
        version: '1.0.5',
        rating: 4.2,
        totalRatings: 123000,
        downloads: 5000000,
        freeWithAdsUrl: 'https://example.com/downloads/bullet-army-free.apk',
        freeWithAdsActive: true,
        paidNoAdsUrl: 'https://example.com/downloads/bullet-army-paid.apk',
        paidNoAdsPrice: 4.99,
        paidNoAdsActive: true,
        adsenseEnabled: true,
        adsenseSlot: '1234567890',
        whatsNew: '• Novos níveis adicionados\n• Melhorias de performance\n• Correções de bugs',
        permissions: ['Armazenamento', 'Internet'],
        tags: ['casual', 'ação', 'arcade', 'divertido'],
        requiresInternet: true,
        inAppPurchases: false,
        status: 'PUBLISHED',
        featured: true,
      },
      {
        title: 'Math Challenge',
        developer: 'EduGames Studio',
        description: 'Aprimore suas habilidades matemáticas de forma divertida!\n\nMath Challenge é um jogo educativo que torna o aprendizado de matemática emocionante e envolvente. Resolva problemas, ganhe pontos e suba no ranking!\n\nCaracterísticas:\n• Diversos níveis de dificuldade\n• Operações: soma, subtração, multiplicação e divisão\n• Sistema de ranking\n• Estatísticas de progresso\n• Interface amigável',
        shortDescription: 'Aprimore suas habilidades matemáticas de forma divertida!',
        iconUrl: 'https://example.com/icons/math-challenge.png',
        coverImages: [
          'https://example.com/screenshots/math-1.png',
          'https://example.com/screenshots/math-2.png'
        ],
        category: 'Educação',
        ageRating: 'Livre',
        fileSize: '45 MB',
        version: '2.1.0',
        rating: 4.7,
        totalRatings: 8500,
        downloads: 250000,
        freeWithAdsUrl: 'https://example.com/downloads/math-challenge-free.apk',
        freeWithAdsActive: true,
        paidNoAdsUrl: 'https://example.com/downloads/math-challenge-paid.apk',
        paidNoAdsPrice: 2.99,
        paidNoAdsActive: true,
        adsenseEnabled: true,
        adsenseSlot: '9876543210',
        whatsNew: '• Novos exercícios adicionados\n• Modo multiplayer',
        permissions: ['Internet'],
        tags: ['educativo', 'matemática', 'quiz'],
        requiresInternet: false,
        inAppPurchases: false,
        status: 'PUBLISHED',
        featured: true,
      },
      {
        title: 'Puzzle Master',
        developer: 'Brain Games Inc',
        description: 'O melhor jogo de quebra-cabeças para exercitar seu cérebro!\n\nDesafie sua mente com centenas de puzzles incríveis. Cada nível é único e oferece um desafio diferente.\n\nCaracterísticas:\n• Mais de 500 níveis\n• Dicas disponíveis\n• Gráficos lindos\n• Música relaxante\n• Jogue offline',
        shortDescription: 'O melhor jogo de quebra-cabeças para exercitar seu cérebro!',
        iconUrl: 'https://example.com/icons/puzzle-master.png',
        coverImages: [
          'https://example.com/screenshots/puzzle-1.png'
        ],
        category: 'Jogos',
        ageRating: 'Livre',
        fileSize: '89 MB',
        version: '3.2.1',
        rating: 4.5,
        totalRatings: 45000,
        downloads: 1200000,
        freeWithAdsUrl: 'https://example.com/downloads/puzzle-master-free.apk',
        freeWithAdsActive: true,
        paidNoAdsUrl: null,
        paidNoAdsPrice: 0,
        paidNoAdsActive: false,
        adsenseEnabled: true,
        adsenseSlot: '5555555555',
        whatsNew: '• 50 novos níveis\n• Interface redesenhada',
        permissions: ['Armazenamento'],
        tags: ['puzzle', 'casual', 'relaxante'],
        requiresInternet: false,
        inAppPurchases: true,
        status: 'PUBLISHED',
        featured: false,
      },
      {
        title: 'Fitness Tracker Pro',
        developer: 'HealthTech Solutions',
        description: 'Acompanhe seus treinos e metas de fitness!\n\nO app perfeito para quem quer manter uma vida saudável e atingir suas metas fitness.\n\nCaracterísticas:\n• Rastreamento de exercícios\n• Contador de calorias\n• Planos de treino personalizados\n• Integração com smartwatches\n• Relatórios detalhados',
        shortDescription: 'Acompanhe seus treinos e metas de fitness!',
        iconUrl: 'https://example.com/icons/fitness-tracker.png',
        coverImages: [],
        category: 'Saúde e fitness',
        ageRating: 'Livre',
        fileSize: '67 MB',
        version: '1.5.0',
        rating: 4.3,
        totalRatings: 12000,
        downloads: 500000,
        freeWithAdsUrl: 'https://example.com/downloads/fitness-free.apk',
        freeWithAdsActive: true,
        paidNoAdsUrl: 'https://example.com/downloads/fitness-pro.apk',
        paidNoAdsPrice: 9.99,
        paidNoAdsActive: true,
        adsenseEnabled: false,
        adsenseSlot: null,
        whatsNew: '• Novos exercícios\n• Integração com Apple Health',
        permissions: ['Localização', 'Sensor de movimento', 'Internet'],
        tags: ['fitness', 'saúde', 'treino'],
        requiresInternet: true,
        inAppPurchases: true,
        status: 'PUBLISHED',
        featured: false,
      },
      {
        title: 'Music Player HD',
        developer: 'Audio Apps Co',
        description: 'O melhor player de música com qualidade HD!\n\nOuça suas músicas favoritas com qualidade superior e uma interface moderna.',
        shortDescription: 'O melhor player de música com qualidade HD!',
        iconUrl: 'https://example.com/icons/music-player.png',
        coverImages: [],
        category: 'Música',
        ageRating: 'Livre',
        fileSize: '23 MB',
        version: '4.0.0',
        rating: 4.8,
        totalRatings: 95000,
        downloads: 3000000,
        freeWithAdsUrl: 'https://example.com/downloads/music-player-free.apk',
        freeWithAdsActive: true,
        paidNoAdsUrl: 'https://example.com/downloads/music-player-pro.apk',
        paidNoAdsPrice: 3.99,
        paidNoAdsActive: true,
        adsenseEnabled: true,
        adsenseSlot: '7777777777',
        whatsNew: '• Equalizador melhorado\n• Suporte para mais formatos',
        permissions: ['Armazenamento', 'Áudio'],
        tags: ['música', 'player', 'áudio'],
        requiresInternet: false,
        inAppPurchases: false,
        status: 'PUBLISHED',
        featured: true,
      }
    ];

    for (const appData of sampleApps) {
      const slug = appData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const app = await prisma.app.create({
        data: {
          ...appData,
          slug,
        }
      });

      console.log(`✅ App criado: ${app.title} (${app.slug})`);
    }

    console.log('\n🎉 Apps de exemplo criados com sucesso!');
    console.log(`\n📱 Acesse: http://localhost:5173/apps`);

  } catch (error) {
    console.error('❌ Erro ao criar apps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedApps();
