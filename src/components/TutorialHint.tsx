import React from 'react';

interface TutorialHintProps {
  screenPos: { x: number; y: number } | null;
  visible: boolean;
}

export const TutorialHint: React.FC<TutorialHintProps> = ({ screenPos, visible }) => {
  if (!visible || !screenPos) return null;

  return (
    <div
      className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 select-none"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
      }}
    >
      {/* Glowing pulsing target ring on the pipe */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-2 border-emerald-400/80 animate-ping opacity-75" />
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/90 animate-spin absolute" style={{ animationDuration: '6s' }} />

        {/* Small floating rotation hint badge */}
        <div className="absolute -top-7 -right-5 py-1 px-2.5 rounded-full bg-slate-900/90 border border-emerald-400 shadow-lg text-emerald-300 font-extrabold text-xs flex items-center gap-1 animate-bounce">
          <span>↻</span>
          <span className="text-[10px] tracking-wide">TAP</span>
        </div>

        {/* Bouncing Hand pointer underneath the pipe pointing up */}
        <div className="absolute top-10 flex flex-col items-center animate-bounce" style={{ animationDuration: '1.2s' }}>
          <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            👆
          </span>
        </div>
      </div>
    </div>
  );
};
