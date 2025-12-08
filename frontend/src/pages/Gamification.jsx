import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import gamificationService from '../services/gamificationService';
import { FaTrophy, FaMedal, FaFire, FaStar, FaChartLine, FaCrown, FaGift } from 'react-icons/fa';

const Gamification = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [missions, setMissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('ALL_TIME');
  const [leaderboardCategory, setLeaderboardCategory] = useState('POINTS');

  useEffect(() => {
    loadGamificationData();
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [leaderboardPeriod, leaderboardCategory, activeTab]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const [profileData, badgesData, missionsData] = await Promise.all([
        gamificationService.getProfile(),
        gamificationService.getUserBadges(),
        gamificationService.getUserMissions(),
      ]);

      setProfile(profileData.data);
      setBadges(badgesData.data);
      setMissions(missionsData.data);
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
      toast.error('Erro ao carregar dados de gamificação');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard(leaderboardPeriod, leaderboardCategory);
      setLeaderboard(data.data.leaderboard);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      toast.error('Erro ao carregar ranking');
    }
  };

  const handleUpdateStreak = async () => {
    try {
      const result = await gamificationService.updateStreak();
      if (result.data.streakContinued) {
        toast.success(result.message);
        loadGamificationData();
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
      toast.error('Erro ao atualizar streak');
    }
  };

  const handleClaimMission = async (missionId) => {
    try {
      const result = await gamificationService.claimMissionReward(missionId);
      toast.success(result.message);
      loadGamificationData();
    } catch (error) {
      console.error('Erro ao reivindicar recompensa:', error);
      toast.error(error.response?.data?.message || 'Erro ao reivindicar recompensa');
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      COMMON: 'bg-gray-100 text-gray-800 border-gray-300',
      RARE: 'bg-blue-100 text-blue-800 border-blue-300',
      EPIC: 'bg-purple-100 text-purple-800 border-purple-300',
      LEGENDARY: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return colors[rarity] || colors.COMMON;
  };

  const getMissionTypeColor = (type) => {
    const colors = {
      DAILY: 'bg-green-100 text-green-800',
      WEEKLY: 'bg-blue-100 text-blue-800',
      MONTHLY: 'bg-purple-100 text-purple-800',
      SPECIAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || colors.DAILY;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gamificação</h1>
              <p className="text-purple-100">Acompanhe seu progresso e conquistas</p>
            </div>
            <FaTrophy className="text-6xl opacity-20" />
          </div>

          {/* Stats Overview */}
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Nível</p>
                    <p className="text-3xl font-bold">{profile.currentLevel}</p>
                  </div>
                  <FaCrown className="text-4xl opacity-50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Pontos Totais</p>
                    <p className="text-3xl font-bold">{profile.totalPoints}</p>
                  </div>
                  <FaStar className="text-4xl opacity-50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Streak Atual</p>
                    <p className="text-3xl font-bold">{profile.currentStreak} dias</p>
                  </div>
                  <FaFire className="text-4xl opacity-50" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Badges</p>
                    <p className="text-3xl font-bold">{badges.length}</p>
                  </div>
                  <FaMedal className="text-4xl opacity-50" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: FaChartLine },
              { id: 'badges', label: 'Badges', icon: FaMedal },
              { id: 'missions', label: 'Missões', icon: FaGift },
              { id: 'leaderboard', label: 'Ranking', icon: FaTrophy },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="text-lg" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && profile && (
          <div className="space-y-6">
            {/* Level Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Progresso de Nível</h2>
                <span className="text-sm text-gray-500">
                  Nível {profile.currentLevel}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{profile.levelInfo.totalPoints} pontos</span>
                  <span>{profile.levelInfo.pointsToNextLevel} pontos para o próximo nível</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${profile.levelInfo.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm font-medium text-purple-600">
                  {profile.levelInfo.progressPercentage}% completo
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Streak Diário</h2>
                  <p className="text-sm text-gray-500">Mantenha sua sequência ativa</p>
                </div>
                <button
                  onClick={handleUpdateStreak}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors flex items-center space-x-2"
                >
                  <FaFire />
                  <span>Atualizar Streak</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium">Streak Atual</p>
                  <p className="text-3xl font-bold text-orange-700">{profile.currentStreak} dias</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-medium">Maior Streak</p>
                  <p className="text-3xl font-bold text-red-700">{profile.longestStreak} dias</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estatísticas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{profile.totalPurchases}</p>
                  <p className="text-sm text-blue-800 mt-1">Compras</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{profile.totalSales}</p>
                  <p className="text-sm text-green-800 mt-1">Vendas</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{profile.coursesCompleted}</p>
                  <p className="text-sm text-purple-800 mt-1">Cursos Concluídos</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{profile.reviewsMade}</p>
                  <p className="text-sm text-yellow-800 mt-1">Avaliações</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Badges</h2>
            {badges.length === 0 ? (
              <div className="text-center py-12">
                <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não conquistou nenhum badge.</p>
                <p className="text-sm text-gray-400 mt-2">Complete missões e atividades para desbloquear badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className={`border-2 rounded-lg p-6 transition-transform hover:scale-105 ${getRarityColor(
                      userBadge.badge.rarity
                    )}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-3">{userBadge.badge.icon}</div>
                      <h3 className="font-bold text-lg mb-1">{userBadge.badge.name}</h3>
                      <p className="text-sm mb-2">{userBadge.badge.description}</p>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <span className="font-medium">+{userBadge.badge.points} pontos</span>
                        <span className="px-2 py-1 rounded text-xs font-medium">{userBadge.badge.rarity}</span>
                      </div>
                      <p className="text-xs mt-2 opacity-75">
                        Conquistado em {new Date(userBadge.earnedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Missões</h2>
            {missions.length === 0 ? (
              <div className="text-center py-12">
                <FaGift className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma missão ativa no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {missions.map((userMission) => (
                  <div
                    key={userMission.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl">{userMission.mission.icon}</span>
                          <div>
                            <h3 className="font-bold text-lg">{userMission.mission.title}</h3>
                            <p className="text-sm text-gray-600">{userMission.mission.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMissionTypeColor(userMission.mission.type)}`}>
                            {userMission.mission.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            Recompensa: <span className="font-bold text-purple-600">+{userMission.mission.pointsReward} pontos</span>
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>{userMission.progress}/{userMission.mission.targetValue}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${(userMission.progress / userMission.mission.targetValue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {userMission.status === 'COMPLETED' && !userMission.claimedAt && (
                        <button
                          onClick={() => handleClaimMission(userMission.missionId)}
                          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          Reivindicar
                        </button>
                      )}
                      {userMission.status === 'CLAIMED' && (
                        <span className="ml-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          Concluída ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ranking</h2>
              <div className="flex space-x-4">
                <select
                  value={leaderboardPeriod}
                  onChange={(e) => setLeaderboardPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="DAILY">Diário</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensal</option>
                  <option value="ALL_TIME">Todos os Tempos</option>
                </select>
                <select
                  value={leaderboardCategory}
                  onChange={(e) => setLeaderboardCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="POINTS">Pontos</option>
                  <option value="SALES">Vendas</option>
                  <option value="PURCHASES">Compras</option>
                  <option value="REVIEWS">Avaliações</option>
                </select>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado de ranking disponível.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      index < 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-800' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index < 3 ? <FaTrophy /> : entry.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{entry.userName}</p>
                        <p className="text-sm text-gray-500">#{entry.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{entry.value}</p>
                      <p className="text-xs text-gray-500">{leaderboardCategory.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;
