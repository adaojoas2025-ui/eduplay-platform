import { useRef, useState } from 'react';
import { FiMessageCircle, FiPlay, FiRotateCcw, FiVolume2, FiX } from 'react-icons/fi';

const AVATAR_VIDEO = '/avatar/assistente-educaplay.mp4';

export default function PlatformAvatar() {
  const videoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary-500 px-4 py-3 font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-200 sm:bottom-6 sm:right-6"
        aria-label="Abrir mensagem de boas-vindas do EducaPlayJá"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <FiMessageCircle className="text-xl" aria-hidden="true" />
        </span>
        <span className="text-sm">Bem-vindo ao EducaPlayJá</span>
      </button>
    );
  }

  const playWithAudio = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    setHasAudio(true);
    setHasEnded(false);

    try {
      await video.play();
    } catch (error) {
      console.error('Não foi possível iniciar o vídeo do avatar:', error);
    }
  };

  return (
    <aside
      className="fixed bottom-3 right-3 z-50 w-44 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl sm:bottom-5 sm:right-5 sm:w-56 lg:w-64"
      aria-label="Mensagem de boas-vindas do EducaPlayJá"
    >
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute right-2 top-2 z-10 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/75"
        aria-label="Fechar apresentação"
      >
        <FiX aria-hidden="true" />
      </button>

      <video
        ref={videoRef}
        src={AVATAR_VIDEO}
        autoPlay
        muted={!hasAudio}
        playsInline
        preload="metadata"
        onEnded={() => setHasEnded(true)}
        className="aspect-[928/1120] w-full bg-slate-200 object-cover"
      >
        Seu navegador não consegue reproduzir este vídeo.
      </video>

      <div className="space-y-2 p-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Bem-vindo ao EducaPlayJá!</p>
          <p className="text-xs leading-4 text-gray-600">Clique abaixo para ouvir nossa apresentação.</p>
        </div>
        <button
          type="button"
          onClick={playWithAudio}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-600"
        >
          {hasEnded ? <FiRotateCcw aria-hidden="true" /> : hasAudio ? <FiPlay aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}
          {hasEnded ? 'Ouvir novamente' : hasAudio ? 'Reiniciar apresentação' : 'Ouvir apresentação'}
        </button>
      </div>
    </aside>
  );
}
