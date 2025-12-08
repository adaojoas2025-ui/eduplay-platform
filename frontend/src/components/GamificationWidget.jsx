import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaStar, FaFire, FaMedal } from 'react-icons/fa';
import gamificationService from '../services/gamificationService';

const GamificationWidget = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await gamificationService.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfil de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return null;
  }

  return (
    <Link
      to="/gamification"
      className="block bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-4 text-white hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm uppercase tracking-wide">Gamificação</h3>
        <FaTrophy className="text-yellow-300" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <FaStar className="text-yellow-300 text-sm" />
            <div>
              <p className="text-xs opacity-80">Nível</p>
              <p className="font-bold text-lg">{profile.currentLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <FaFire className="text-orange-300 text-sm" />
            <div>
              <p className="text-xs opacity-80">Streak</p>
              <p className="font-bold text-lg">{profile.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="opacity-80">Progresso</span>
          <span className="font-medium">{profile.levelInfo?.progressPercentage || 0}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-300 to-orange-300 h-2 rounded-full transition-all"
            style={{ width: `${profile.levelInfo?.progressPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="opacity-80">{profile.totalPoints} pontos</span>
        <div className="flex items-center space-x-1">
          <FaMedal className="text-yellow-300" />
          <span className="font-medium">{profile.badges?.length || 0} badges</span>
        </div>
      </div>
    </Link>
  );
};

export default GamificationWidget;
