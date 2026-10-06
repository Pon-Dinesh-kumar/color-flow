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
      <div className="relative flex items-center justify-center">
        <div className="h-[4.5rem] w-[4.5rem] rounded-full border-[3px] border-amber-300/90 shadow-[0_0_0_7px_rgba(255,255,255,0.18),0_0_25px_rgba(251,191,36,0.65)] animate-pulse" />
        <div className="absolute h-16 w-16 rounded-full border-2 border-dashed border-white/90" />

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white/90 bg-gradient-to-b from-amber-300 to-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_4px_10px_rgba(124,45,18,0.35),inset_0_1px_3px_rgba(255,255,255,0.7)] animate-bounce">
          Tap to rotate!
        </div>

        <div
          className="absolute left-[calc(50%+1.35rem)] top-[calc(50%+0.35rem)] flex -translate-x-1/2 flex-col items-center animate-bounce"
          style={{ animationDuration: '1.2s' }}
        >
          <span className="text-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            👆
          </span>
        </div>
      </div>
    </div>
  );
};
