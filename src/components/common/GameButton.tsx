import React from 'react';

interface GameButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

export const GameButton: React.FC<GameButtonProps> = ({
  onClick,
  title,
  className = '',
  children,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-12 h-12 md:w-14 md:h-14 rounded-full'
      : 'w-10 h-10 md:w-11 md:h-11 rounded-full';

  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative overflow-hidden ${sizeClasses} bg-gradient-to-b from-sky-400/95 via-blue-500/95 to-blue-700/95 hover:brightness-110 active:scale-90 backdrop-blur-xl border-2 border-white/75 text-white flex items-center justify-center shadow-[0_5px_14px_rgba(16,57,133,0.4),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(30,64,175,0.55)] transition-all duration-150 cursor-pointer ${className}`}
    >
      <span className="absolute inset-x-2 top-1 h-1/2 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{children}</span>
    </button>
  );
};
