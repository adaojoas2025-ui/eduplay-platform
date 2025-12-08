import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import gamificationService from '../../services/gamificationService';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaChartBar } from 'react-icons/fa';

const GamificationAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [missionForm, setMissionForm] = useState({
    title: '',
    description: '',
    type: 'DAILY',
    targetValue: 1,
    pointsReward: 10,
    icon: '🎯',
    maxCompletions: 1,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, missionsData, badgesData] = await Promise.all([
        gamificationService.getStats(),
        gamificationService.getAllMissions(),
        gamificationService.getAllBadges(),
      ]);

      setStats(statsData.data);
      setMissions(missionsData.data);
      setBadges(badgesData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    try {
      await gamificationService.createMission(missionForm);
      toast.success('Missão criada com sucesso!');
      setShowMissionForm(false);
      setMissionForm({
        title: '',
        description: '',
        type: 'DAILY',
        targetValue: 1,
        pointsReward: 10,
        icon: '🎯',
        maxCompletions: 1,
        isActive: true,
      });
      loadData();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      toast.error('Erro ao criar missão');
    }
  };

  const handleUpdateMission = async (e) => {
    e.preventDefault();
    try {
      await gamificationService.updateMission(editingMission.id, missionForm);
      toast.success('Missão atualizada com sucesso!');
      setEditingMission(null);
      setShowMissionForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar missão:', error);
      toast.error('Erro ao atualizar missão');
    }
  };

  const handleDeleteMission = async (missionId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta missão?')) return;

    try {
      await gamificationService.deleteMission(missionId);
      toast.success('Missão deletada com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao deletar missão:', error);
      toast.error('Erro ao deletar missão');
    }
  };

  const handleEditMission = (mission) => {
    setEditingMission(mission);
    setMissionForm({
      title: mission.title,
      description: mission.description,
      type: mission.type,
      targetValue: mission.targetValue,
      pointsReward: mission.pointsReward,
      icon: mission.icon || '🎯',
      maxCompletions: mission.maxCompletions,
      isActive: mission.isActive,
    });
    setShowMissionForm(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Administração de Gamificação</h1>
              <p className="text-purple-100">Gerencie badges, missões e estatísticas</p>
            </div>
            <FaTrophy className="text-6xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'stats', label: 'Estatísticas', icon: FaChartBar },
              { id: 'missions', label: 'Missões', icon: FaTrophy },
              { id: 'badges', label: 'Badges', icon: FaTrophy },
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
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Usuários Ativos</div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Pontos Totais</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalPoints.toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Badges Conquistados</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.totalBadgesEarned}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Missões Completadas</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalMissionsCompleted}</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <div className="text-sm text-gray-500 mb-2">Nível Médio</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.averageLevel}</div>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Missões</h2>
              <button
                onClick={() => {
                  setEditingMission(null);
                  setShowMissionForm(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Nova Missão</span>
              </button>
            </div>

            {/* Mission Form Modal */}
            {showMissionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-6">
                    {editingMission ? 'Editar Missão' : 'Nova Missão'}
                  </h3>

                  <form onSubmit={editingMission ? handleUpdateMission : handleCreateMission} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <input
                        type="text"
                        value={missionForm.title}
                        onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <textarea
                        value={missionForm.description}
                        onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo</label>
                        <select
                          value={missionForm.type}
                          onChange={(e) => setMissionForm({ ...missionForm, type: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="DAILY">Diária</option>
                          <option value="WEEKLY">Semanal</option>
                          <option value="MONTHLY">Mensal</option>
                          <option value="SPECIAL">Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Ícone</label>
                        <input
                          type="text"
                          value={missionForm.icon}
                          onChange={(e) => setMissionForm({ ...missionForm, icon: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="🎯"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Valor Alvo</label>
                        <input
                          type="number"
                          value={missionForm.targetValue}
                          onChange={(e) => setMissionForm({ ...missionForm, targetValue: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Pontos</label>
                        <input
                          type="number"
                          value={missionForm.pointsReward}
                          onChange={(e) => setMissionForm({ ...missionForm, pointsReward: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Max Completar</label>
                        <input
                          type="number"
                          value={missionForm.maxCompletions}
                          onChange={(e) => setMissionForm({ ...missionForm, maxCompletions: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={missionForm.isActive}
                        onChange={(e) => setMissionForm({ ...missionForm, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium">Ativa</label>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMissionForm(false);
                          setEditingMission(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {editingMission ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Missions List */}
            <div className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl">{mission.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg">{mission.title}</h3>
                          <p className="text-sm text-gray-600">{mission.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMissionTypeColor(mission.type)}`}>
                          {mission.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          Alvo: <span className="font-bold">{mission.targetValue}</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Recompensa: <span className="font-bold text-purple-600">+{mission.pointsReward} pontos</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Max: <span className="font-bold">{mission.maxCompletions}</span>
                        </span>
                        <span className={`text-sm ${mission.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {mission.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMission(mission)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMission(mission.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Badges</h2>
              <div className="text-sm text-gray-500">
                Total: {badges.length} badges
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <div className="flex items-center justify-center space-x-4 text-sm mt-4">
                      <span className="font-medium">+{badge.points} pontos</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {badge.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Requer: {badge.requiredValue} {badge.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationAdmin;
