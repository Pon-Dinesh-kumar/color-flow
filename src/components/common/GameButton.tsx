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
      ? 'w-14 h-14 md:w-16 md:h-16 rounded-full'
      : 'w-12 h-12 md:w-14 md:h-14 rounded-full';

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizeClasses} bg-slate-900/80 hover:bg-slate-800/90 active:scale-90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-all duration-150 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};
