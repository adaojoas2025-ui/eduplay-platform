import React from 'react';
import './Loading.css';

const Loading = ({ fullScreen = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className={`loading-spinner mx-auto ${sizeClasses.large}`}></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loading;
