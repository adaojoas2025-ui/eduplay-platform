import { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaStar, FaTimes } from 'react-icons/fa';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (achievement.type) {
      case 'level_up':
        return <FaStar className="text-5xl text-yellow-400" />;
      case 'badge':
        return <FaMedal className="text-5xl text-purple-400" />;
      case 'streak':
        return <span className="text-5xl">🔥</span>;
      default:
        return <FaTrophy className="text-5xl text-yellow-400" />;
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      COMMON: 'from-gray-400 to-gray-600',
      RARE: 'from-blue-400 to-blue-600',
      EPIC: 'from-purple-400 to-purple-600',
      LEGENDARY: 'from-yellow-400 to-orange-600',
    };
    return colors[rarity] || colors.COMMON;
  };

  if (!isVisible && !isLeaving) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
        isLeaving
          ? 'translate-x-full opacity-0'
          : isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-gradient-to-br ${
          achievement.rarity ? getRarityColor(achievement.rarity) : 'from-purple-500 to-indigo-600'
        } text-white rounded-lg shadow-2xl p-6 max-w-md relative overflow-hidden`}
      >
        {/* Background sparkle effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse"></div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0 animate-bounce">
              {achievement.icon ? (
                <span className="text-5xl">{achievement.icon}</span>
              ) : (
                getIcon()
              )}
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 flex items-center space-x-2">
                <span>🎉 {achievement.title || 'Nova Conquista!'}</span>
              </h3>
              <p className="text-white/90 text-sm mb-2">
                {achievement.description || 'Você desbloqueou uma nova conquista!'}
              </p>

              {achievement.points && (
                <div className="flex items-center space-x-2 text-sm">
                  <FaStar className="text-yellow-300" />
                  <span className="font-bold">+{achievement.points} pontos</span>
                </div>
              )}

              {achievement.level && (
                <div className="mt-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                    Nível {achievement.level}
                  </span>
                </div>
              )}

              {achievement.rarity && (
                <div className="mt-2">
                  <span className="text-xs font-bold uppercase tracking-wide bg-white/20 px-2 py-1 rounded">
                    {achievement.rarity}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-white/40 animate-progress-bar"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-bar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-progress-bar {
          animation: progress-bar 5s linear;
        }
      `}</style>
    </div>
  );
};

// Achievement Queue Manager Component
export const AchievementQueueManager = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Listen for achievement events
    const handleAchievement = (event) => {
      const achievement = event.detail;
      setAchievements((prev) => [...prev, { ...achievement, id: Date.now() }]);
    };

    window.addEventListener('achievement-unlocked', handleAchievement);

    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievement);
    };
  }, []);

  const handleClose = (id) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {achievements.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{ top: `${80 + index * 140}px` }}
          className="absolute"
        >
          <AchievementNotification
            achievement={achievement}
            onClose={() => handleClose(achievement.id)}
          />
        </div>
      ))}
    </>
  );
};

// Helper function to trigger achievements
export const triggerAchievement = (achievement) => {
  const event = new CustomEvent('achievement-unlocked', {
    detail: achievement,
  });
  window.dispatchEvent(event);
};

export default AchievementNotification;
