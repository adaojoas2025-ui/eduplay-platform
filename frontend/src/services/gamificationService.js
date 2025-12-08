import api from './api';

const gamificationService = {
  // Get user's gamification profile
  getProfile: async () => {
    const response = await api.get('/gamification/profile');
    return response.data;
  },

  // Get user's points history
  getPointsHistory: async (limit = 50, offset = 0) => {
    const response = await api.get('/gamification/points-history', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Update daily streak
  updateStreak: async () => {
    const response = await api.post('/gamification/streak');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (period = 'ALL_TIME', category = 'POINTS', limit = 100) => {
    const response = await api.get('/gamification/leaderboard', {
      params: { period, category, limit },
    });
    return response.data;
  },

  // Get all badges
  getAllBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  // Get user's badges
  getUserBadges: async () => {
    const response = await api.get('/gamification/my-badges');
    return response.data;
  },

  // Get all missions
  getAllMissions: async () => {
    const response = await api.get('/gamification/missions');
    return response.data;
  },

  // Get user's missions
  getUserMissions: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/gamification/my-missions', { params });
    return response.data;
  },

  // Claim mission reward
  claimMissionReward: async (missionId) => {
    const response = await api.post(`/gamification/missions/${missionId}/claim`);
    return response.data;
  },

  // Admin: Get statistics
  getStats: async () => {
    const response = await api.get('/gamification/admin/stats');
    return response.data;
  },

  // Admin: Create badge
  createBadge: async (badgeData) => {
    const response = await api.post('/gamification/admin/badges', badgeData);
    return response.data;
  },

  // Admin: Create mission
  createMission: async (missionData) => {
    const response = await api.post('/gamification/admin/missions', missionData);
    return response.data;
  },

  // Admin: Update mission
  updateMission: async (missionId, missionData) => {
    const response = await api.put(`/gamification/admin/missions/${missionId}`, missionData);
    return response.data;
  },

  // Admin: Delete mission
  deleteMission: async (missionId) => {
    const response = await api.delete(`/gamification/admin/missions/${missionId}`);
    return response.data;
  },
};

export default gamificationService;
