const gamificationService = require('../services/gamification.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Gamification Controller
 * Handles HTTP requests for gamification features
 */

class GamificationController {
  /**
   * Get user's gamification profile
   * GET /api/gamification/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await gamificationService.getUserProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil de gamificação',
        error: error.message,
      });
    }
  }

  /**
   * Get user's points history
   * GET /api/gamification/points-history
   */
  async getPointsHistory(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const history = await gamificationService.getPointsHistory(userId, limit, offset);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Error getting points history:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de pontos',
        error: error.message,
      });
    }
  }

  /**
   * Update daily streak
   * POST /api/gamification/streak
   */
  async updateStreak(req, res) {
    try {
      const userId = req.user.id;

      const result = await gamificationService.updateStreak(userId);

      res.json({
        success: true,
        data: result,
        message: result.streakContinued
          ? `Streak de ${result.currentStreak} dias! +${result.pointsEarned} pontos`
          : 'Streak já atualizado hoje',
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar streak',
        error: error.message,
      });
    }
  }

  /**
   * Get leaderboard
   * GET /api/gamification/leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const period = req.query.period || 'ALL_TIME'; // DAILY, WEEKLY, MONTHLY, ALL_TIME
      const category = req.query.category || 'POINTS'; // POINTS, SALES, PURCHASES, REVIEWS
      const limit = parseInt(req.query.limit) || 100;

      const leaderboard = await gamificationService.getLeaderboard(period, category, limit);

      // Find current user's position if authenticated
      let userPosition = null;
      if (req.user) {
        const userIndex = leaderboard.findIndex(entry => entry.userId === req.user.id);
        if (userIndex !== -1) {
          userPosition = leaderboard[userIndex];
        }
      }

      res.json({
        success: true,
        data: {
          leaderboard,
          userPosition,
          period,
          category,
        },
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar ranking',
        error: error.message,
      });
    }
  }

  /**
   * Get all badges
   * GET /api/gamification/badges
   */
  async getAllBadges(req, res) {
    try {
      const badges = await prisma.badge.findMany({
        orderBy: [
          { type: 'asc' },
          { requiredValue: 'asc' },
        ],
      });

      res.json({
        success: true,
        data: badges,
      });
    } catch (error) {
      console.error('Error getting badges:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar badges',
        error: error.message,
      });
    }
  }

  /**
   * Get user's badges
   * GET /api/gamification/my-badges
   */
  async getUserBadges(req, res) {
    try {
      const userId = req.user.id;

      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: userBadges,
      });
    } catch (error) {
      console.error('Error getting user badges:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar suas badges',
        error: error.message,
      });
    }
  }

  /**
   * Get all missions
   * GET /api/gamification/missions
   */
  async getAllMissions(req, res) {
    try {
      const now = new Date();

      const missions = await prisma.mission.findMany({
        where: {
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        orderBy: [
          { type: 'asc' },
          { pointsReward: 'desc' },
        ],
      });

      res.json({
        success: true,
        data: missions,
      });
    } catch (error) {
      console.error('Error getting missions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar missões',
        error: error.message,
      });
    }
  }

  /**
   * Get user's missions
   * GET /api/gamification/my-missions
   */
  async getUserMissions(req, res) {
    try {
      const userId = req.user.id;
      const status = req.query.status; // Filter by status if provided

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const userMissions = await prisma.userMission.findMany({
        where,
        include: {
          mission: true,
        },
        orderBy: [
          { status: 'asc' },
          { updatedAt: 'desc' },
        ],
      });

      res.json({
        success: true,
        data: userMissions,
      });
    } catch (error) {
      console.error('Error getting user missions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar suas missões',
        error: error.message,
      });
    }
  }

  /**
   * Claim mission reward
   * POST /api/gamification/missions/:missionId/claim
   */
  async claimMissionReward(req, res) {
    try {
      const userId = req.user.id;
      const { missionId } = req.params;

      // Get user mission
      const userMission = await prisma.userMission.findUnique({
        where: {
          userId_missionId: { userId, missionId },
        },
        include: {
          mission: true,
        },
      });

      if (!userMission) {
        return res.status(404).json({
          success: false,
          message: 'Missão não encontrada',
        });
      }

      if (userMission.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Missão ainda não foi completada',
        });
      }

      if (userMission.claimedAt) {
        return res.status(400).json({
          success: false,
          message: 'Recompensa já foi reivindicada',
        });
      }

      // Claim reward
      await prisma.$transaction(async (tx) => {
        await tx.userMission.update({
          where: {
            userId_missionId: { userId, missionId },
          },
          data: {
            status: 'CLAIMED',
            claimedAt: new Date(),
          },
        });

        await gamificationService.addPoints(
          userId,
          userMission.mission.pointsReward,
          'MISSION_COMPLETED',
          `Missão concluída: ${userMission.mission.title}`,
          missionId,
          'MISSION'
        );
      });

      res.json({
        success: true,
        message: `Você ganhou ${userMission.mission.pointsReward} pontos!`,
        data: {
          pointsEarned: userMission.mission.pointsReward,
        },
      });
    } catch (error) {
      console.error('Error claiming mission reward:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reivindicar recompensa',
        error: error.message,
      });
    }
  }

  /**
   * Admin: Create badge
   * POST /api/gamification/admin/badges
   */
  async createBadge(req, res) {
    try {
      const { name, description, type, icon, requiredValue, points, rarity } = req.body;

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          type,
          icon,
          requiredValue,
          points: points || 0,
          rarity: rarity || 'COMMON',
        },
      });

      res.status(201).json({
        success: true,
        data: badge,
        message: 'Badge criado com sucesso',
      });
    } catch (error) {
      console.error('Error creating badge:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar badge',
        error: error.message,
      });
    }
  }

  /**
   * Admin: Create mission
   * POST /api/gamification/admin/missions
   */
  async createMission(req, res) {
    try {
      const {
        title,
        description,
        type,
        targetValue,
        pointsReward,
        icon,
        startDate,
        endDate,
        maxCompletions,
      } = req.body;

      const mission = await prisma.mission.create({
        data: {
          title,
          description,
          type,
          targetValue,
          pointsReward,
          icon,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          maxCompletions: maxCompletions || 1,
        },
      });

      res.status(201).json({
        success: true,
        data: mission,
        message: 'Missão criada com sucesso',
      });
    } catch (error) {
      console.error('Error creating mission:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar missão',
        error: error.message,
      });
    }
  }

  /**
   * Admin: Update mission
   * PUT /api/gamification/admin/missions/:missionId
   */
  async updateMission(req, res) {
    try {
      const { missionId } = req.params;
      const updateData = { ...req.body };

      // Convert dates if provided
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const mission = await prisma.mission.update({
        where: { id: missionId },
        data: updateData,
      });

      res.json({
        success: true,
        data: mission,
        message: 'Missão atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating mission:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar missão',
        error: error.message,
      });
    }
  }

  /**
   * Admin: Delete mission
   * DELETE /api/gamification/admin/missions/:missionId
   */
  async deleteMission(req, res) {
    try {
      const { missionId } = req.params;

      await prisma.mission.delete({
        where: { id: missionId },
      });

      res.json({
        success: true,
        message: 'Missão deletada com sucesso',
      });
    } catch (error) {
      console.error('Error deleting mission:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar missão',
        error: error.message,
      });
    }
  }

  /**
   * Admin: Get gamification statistics
   * GET /api/gamification/admin/stats
   */
  async getStats(req, res) {
    try {
      const [
        totalUsers,
        totalPoints,
        totalBadgesEarned,
        totalMissionsCompleted,
        averageLevel,
      ] = await Promise.all([
        prisma.userGamification.count(),
        prisma.pointsHistory.aggregate({
          _sum: { points: true },
        }),
        prisma.userBadge.count(),
        prisma.userMission.count({
          where: { status: { in: ['COMPLETED', 'CLAIMED'] } },
        }),
        prisma.userGamification.aggregate({
          _avg: { currentLevel: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalPoints: totalPoints._sum.points || 0,
          totalBadgesEarned,
          totalMissionsCompleted,
          averageLevel: Math.round(averageLevel._avg.currentLevel || 1),
        },
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message,
      });
    }
  }
}

module.exports = new GamificationController();
