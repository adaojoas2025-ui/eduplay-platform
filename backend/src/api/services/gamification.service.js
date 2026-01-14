const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Gamification Service
 * Handles all gamification logic including points, badges, missions, and leaderboards
 */

// Points configuration
const POINTS_CONFIG = {
  FIRST_PURCHASE: 100,
  PURCHASE: 50,
  FIRST_SALE: 150,
  SALE: 75,
  FIRST_PRODUCT: 200,
  PRODUCT_PUBLISHED: 100,
  REVIEW_MADE: 25,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 5, // Per day in streak
  COURSE_COMPLETED: 100,
};

// Level thresholds (cumulative points needed)
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  300,   // Level 3
  600,   // Level 4
  1000,  // Level 5
  1500,  // Level 6
  2100,  // Level 7
  2800,  // Level 8
  3600,  // Level 9
  4500,  // Level 10
  5500,  // Level 11
  6600,  // Level 12
  7800,  // Level 13
  9100,  // Level 14
  10500, // Level 15
];

class GamificationService {
  /**
   * Initialize gamification for a user
   */
  async initializeUser(userId) {
    try {
      const existing = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (existing) {
        return existing;
      }

      return await prisma.userGamification.create({
        data: {
          userId,
          totalPoints: 0,
          currentLevel: 1,
          levelProgress: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    } catch (error) {
      console.error('Error initializing gamification:', error);
      throw error;
    }
  }

  /**
   * Add points to user and check for level up
   */
  async addPoints(userId, points, reason, description = null, referenceId = null, referenceType = null) {
    try {
      // Ensure user gamification exists
      await this.initializeUser(userId);

      // Add points and update gamification
      const [userGamification, pointsHistory] = await prisma.$transaction(async (tx) => {
        // Create points history entry
        const history = await tx.pointsHistory.create({
          data: {
            userId,
            points,
            reason,
            description,
            referenceId,
            referenceType,
          },
        });

        // Update user gamification
        const updated = await tx.userGamification.update({
          where: { userId },
          data: {
            totalPoints: { increment: points },
          },
        });

        return [updated, history];
      });

      // Check for level up
      await this.checkLevelUp(userId);

      // Check for badge unlocks
      await this.checkBadgeUnlocks(userId);

      return { userGamification, pointsHistory };
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  /**
   * Check if user should level up
   */
  async checkLevelUp(userId) {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (!userGamification) return;

      const { totalPoints, currentLevel } = userGamification;
      let newLevel = currentLevel;

      // Find the appropriate level
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalPoints >= LEVEL_THRESHOLDS[i]) {
          newLevel = i + 1;
          break;
        }
      }

      // If leveled up, update and award bonus points
      if (newLevel > currentLevel) {
        const levelDifference = newLevel - currentLevel;
        const bonusPoints = levelDifference * 50; // 50 points per level

        await prisma.$transaction(async (tx) => {
          await tx.userGamification.update({
            where: { userId },
            data: {
              currentLevel: newLevel,
            },
          });

          // Award bonus points for leveling up
          await tx.pointsHistory.create({
            data: {
              userId,
              points: bonusPoints,
              reason: 'LEVEL_UP',
              description: `Alcançou o nível ${newLevel}`,
            },
          });

          await tx.userGamification.update({
            where: { userId },
            data: {
              totalPoints: { increment: bonusPoints },
            },
          });
        });

        return { leveledUp: true, newLevel, bonusPoints };
      }

      return { leveledUp: false, currentLevel };
    } catch (error) {
      console.error('Error checking level up:', error);
      throw error;
    }
  }

  /**
   * Update daily streak
   */
  async updateStreak(userId) {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (!userGamification) {
        await this.initializeUser(userId);
        return this.updateStreak(userId);
      }

      const now = new Date();
      const lastActivity = userGamification.lastActivityDate;

      let newStreak = 1;
      let streakBonus = 0;

      if (lastActivity) {
        const daysSinceLastActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity === 0) {
          // Same day, no change
          return { streakContinued: false, currentStreak: userGamification.currentStreak };
        } else if (daysSinceLastActivity === 1) {
          // Next day, continue streak
          newStreak = userGamification.currentStreak + 1;
          streakBonus = POINTS_CONFIG.DAILY_LOGIN + (newStreak * POINTS_CONFIG.STREAK_BONUS);
        } else {
          // Streak broken
          newStreak = 1;
          streakBonus = POINTS_CONFIG.DAILY_LOGIN;
        }
      } else {
        // First activity
        streakBonus = POINTS_CONFIG.DAILY_LOGIN;
      }

      const longestStreak = Math.max(newStreak, userGamification.longestStreak);

      await prisma.$transaction(async (tx) => {
        await tx.userGamification.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak,
            lastActivityDate: now,
            totalPoints: { increment: streakBonus },
          },
        });

        await tx.pointsHistory.create({
          data: {
            userId,
            points: streakBonus,
            reason: 'DAILY_LOGIN',
            description: `Streak de ${newStreak} dias`,
          },
        });
      });

      // Check for streak badges
      await this.checkStreakBadges(userId, newStreak);

      return { streakContinued: true, currentStreak: newStreak, pointsEarned: streakBonus };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Handle purchase event
   */
  async handlePurchase(userId, orderId, amount) {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      const isFirstPurchase = !userGamification || userGamification.totalPurchases === 0;
      const points = isFirstPurchase ? POINTS_CONFIG.FIRST_PURCHASE : POINTS_CONFIG.PURCHASE;

      await prisma.$transaction(async (tx) => {
        await tx.userGamification.update({
          where: { userId },
          data: {
            totalPurchases: { increment: 1 },
          },
        });

        await this.addPoints(
          userId,
          points,
          isFirstPurchase ? 'FIRST_PURCHASE' : 'PURCHASE',
          `Compra realizada`,
          orderId,
          'ORDER'
        );
      });

      // Check for purchase badges
      await this.checkPurchaseBadges(userId);

      return { points, isFirstPurchase };
    } catch (error) {
      console.error('Error handling purchase:', error);
      throw error;
    }
  }

  /**
   * Handle sale event
   */
  async handleSale(userId, orderId, amount) {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      const isFirstSale = !userGamification || userGamification.totalSales === 0;
      const points = isFirstSale ? POINTS_CONFIG.FIRST_SALE : POINTS_CONFIG.SALE;

      await prisma.$transaction(async (tx) => {
        await tx.userGamification.update({
          where: { userId },
          data: {
            totalSales: { increment: 1 },
          },
        });

        await this.addPoints(
          userId,
          points,
          isFirstSale ? 'FIRST_SALE' : 'SALE',
          `Venda realizada`,
          orderId,
          'ORDER'
        );
      });

      // Check for sale badges
      await this.checkSaleBadges(userId);

      return { points, isFirstSale };
    } catch (error) {
      console.error('Error handling sale:', error);
      throw error;
    }
  }

  /**
   * Handle review event
   */
  async handleReview(userId, reviewId, productId) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.userGamification.update({
          where: { userId },
          data: {
            reviewsMade: { increment: 1 },
          },
        });

        await this.addPoints(
          userId,
          POINTS_CONFIG.REVIEW_MADE,
          'REVIEW',
          `Avaliação publicada`,
          reviewId,
          'REVIEW'
        );
      });

      // Check for review badges
      await this.checkReviewBadges(userId);

      return { points: POINTS_CONFIG.REVIEW_MADE };
    } catch (error) {
      console.error('Error handling review:', error);
      throw error;
    }
  }

  /**
   * Handle course completion
   */
  async handleCourseCompletion(userId, productId) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.userGamification.update({
          where: { userId },
          data: {
            coursesCompleted: { increment: 1 },
          },
        });

        await this.addPoints(
          userId,
          POINTS_CONFIG.COURSE_COMPLETED,
          'COURSE_COMPLETED',
          `Curso concluído`,
          productId,
          'PRODUCT'
        );
      });

      // Check for completion badges
      await this.checkCompletionBadges(userId);

      return { points: POINTS_CONFIG.COURSE_COMPLETED };
    } catch (error) {
      console.error('Error handling course completion:', error);
      throw error;
    }
  }

  /**
   * Check and unlock badges based on criteria
   */
  async checkBadgeUnlocks(userId) {
    try {
      await this.checkPurchaseBadges(userId);
      await this.checkSaleBadges(userId);
      await this.checkReviewBadges(userId);
      await this.checkCompletionBadges(userId);
      await this.checkStreakBadges(userId);
    } catch (error) {
      console.error('Error checking badge unlocks:', error);
      throw error;
    }
  }

  async checkPurchaseBadges(userId) {
    const userGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!userGamification) return;

    const badges = await prisma.badge.findMany({
      where: { type: 'FIRST_PURCHASE' },
    });

    for (const badge of badges) {
      if (userGamification.totalPurchases >= badge.requiredValue) {
        await this.unlockBadge(userId, badge.id);
      }
    }
  }

  async checkSaleBadges(userId) {
    const userGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!userGamification) return;

    const badges = await prisma.badge.findMany({
      where: { type: 'FIRST_SALE' },
    });

    for (const badge of badges) {
      if (userGamification.totalSales >= badge.requiredValue) {
        await this.unlockBadge(userId, badge.id);
      }
    }
  }

  async checkReviewBadges(userId) {
    const userGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!userGamification) return;

    const badges = await prisma.badge.findMany({
      where: { type: 'REVIEWS_MADE' },
    });

    for (const badge of badges) {
      if (userGamification.reviewsMade >= badge.requiredValue) {
        await this.unlockBadge(userId, badge.id);
      }
    }
  }

  async checkCompletionBadges(userId) {
    const userGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!userGamification) return;

    const badges = await prisma.badge.findMany({
      where: { type: 'COURSES_COMPLETED' },
    });

    for (const badge of badges) {
      if (userGamification.coursesCompleted >= badge.requiredValue) {
        await this.unlockBadge(userId, badge.id);
      }
    }
  }

  async checkStreakBadges(userId, streak = null) {
    const userGamification = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!userGamification) return;

    const currentStreak = streak !== null ? streak : userGamification.currentStreak;
    const badges = await prisma.badge.findMany({
      where: { type: 'STREAK_ACHIEVEMENT' },
    });

    for (const badge of badges) {
      if (currentStreak >= badge.requiredValue) {
        await this.unlockBadge(userId, badge.id);
      }
    }
  }

  /**
   * Unlock a badge for a user
   */
  async unlockBadge(userId, badgeId) {
    try {
      // Check if badge is already unlocked
      const existing = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId, badgeId },
        },
      });

      if (existing) {
        return { alreadyUnlocked: true, badge: existing };
      }

      // Get badge info
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Unlock badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
        },
      });

      // Award points for unlocking badge
      if (badge.points > 0) {
        await this.addPoints(
          userId,
          badge.points,
          'BADGE_UNLOCK',
          `Desbloqueou: ${badge.name}`,
          badgeId,
          'BADGE'
        );
      }

      return { alreadyUnlocked: false, badge: userBadge };
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation, badge already unlocked
        return { alreadyUnlocked: true };
      }
      console.error('Error unlocking badge:', error);
      throw error;
    }
  }

  /**
   * Get user's gamification profile
   */
  async getUserProfile(userId) {
    try {
      const gamification = await prisma.userGamification.findUnique({
        where: { userId },
        include: {
          badges: {
            include: {
              badge: true,
            },
            orderBy: {
              earnedAt: 'desc',
            },
          },
          missions: {
            include: {
              mission: true,
            },
            where: {
              status: { in: ['ACTIVE', 'COMPLETED'] },
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      });

      if (!gamification) {
        return await this.initializeUser(userId);
      }

      // Calculate next level info
      const nextLevelThreshold = LEVEL_THRESHOLDS[gamification.currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      const currentLevelThreshold = LEVEL_THRESHOLDS[gamification.currentLevel - 1] || 0;
      const progressToNextLevel = gamification.totalPoints - currentLevelThreshold;
      const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
      const progressPercentage = Math.min(100, (progressToNextLevel / pointsNeededForNextLevel) * 100);

      // Get user statistics
      const [totalPurchases, totalSales, reviewsMade, coursesCompleted] = await Promise.all([
        // Total de compras (pedidos completados como comprador)
        prisma.orders.count({
          where: {
            buyerId: userId,
            status: 'COMPLETED'
          }
        }),
        // Total de vendas (pedidos completados de produtos do usuário)
        prisma.orders.count({
          where: {
            product: {
              producerId: userId
            },
            status: 'COMPLETED'
          }
        }),
        // Total de avaliações feitas
        prisma.reviews.count({
          where: {
            userId: userId
          }
        }),
        // Cursos concluídos (placeholder - pode ser implementado depois)
        Promise.resolve(0)
      ]);

      return {
        ...gamification,
        totalPurchases,
        totalSales,
        reviewsMade,
        coursesCompleted,
        levelInfo: {
          currentLevel: gamification.currentLevel,
          totalPoints: gamification.totalPoints,
          pointsToNextLevel: Math.max(0, nextLevelThreshold - gamification.totalPoints),
          progressPercentage: Math.round(progressPercentage),
          nextLevelThreshold,
          currentLevelThreshold,
        },
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period = 'ALL_TIME', category = 'POINTS', limit = 100) {
    try {
      const now = new Date();
      let periodStart;
      let periodEnd = now;

      switch (period) {
        case 'DAILY':
          periodStart = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'WEEKLY':
          periodStart = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'MONTHLY':
          periodStart = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'ALL_TIME':
        default:
          periodStart = new Date(0); // Beginning of time
          break;
      }

      let orderBy = {};
      let select = {
        userId: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      };

      switch (category) {
        case 'POINTS':
          select.totalPoints = true;
          orderBy = { totalPoints: 'desc' };
          break;
        case 'SALES':
          select.totalSales = true;
          orderBy = { totalSales: 'desc' };
          break;
        case 'PURCHASES':
          select.totalPurchases = true;
          orderBy = { totalPurchases: 'desc' };
          break;
        case 'REVIEWS':
          select.reviewsMade = true;
          orderBy = { reviewsMade: 'desc' };
          break;
        default:
          select.totalPoints = true;
          orderBy = { totalPoints: 'desc' };
      }

      const leaderboard = await prisma.userGamification.findMany({
        where: {
          updatedAt: { gte: periodStart },
        },
        select,
        orderBy,
        take: limit,
      });

      // Add rank
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        userName: entry.user.name,
        userAvatar: entry.user.avatar,
        value: entry.totalPoints || entry.totalSales || entry.totalPurchases || entry.reviewsMade || 0,
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's points history
   */
  async getPointsHistory(userId, limit = 50, offset = 0) {
    try {
      const history = await prisma.pointsHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await prisma.pointsHistory.count({
        where: { userId },
      });

      return { history, total, limit, offset };
    } catch (error) {
      console.error('Error getting points history:', error);
      throw error;
    }
  }
}

module.exports = new GamificationService();
