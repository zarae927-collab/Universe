import React from 'react';
import { WashiTape } from '../decorations/WashiTape';
import { PandaMascot } from '../mascots/PandaMascot';

interface LoadingCardProps {
  message?: string;
  showMascot?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  message = 'loading...',
  showMascot = false,
}) => {
  return (
    <div className="w-full max-w-[340px] mx-auto relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
      {/* Optional floating panda */}
      {showMascot && (
        <div className="mb-2">
          <PandaMascot size={90} pose="happy" interactive={false} />
        </div>
      )}

      {/* Main Notepad Card */}
      <div className="relative w-full bg-white/95 backdrop-blur-xs rounded-3xl p-8 shadow-[0_12px_32px_rgba(56,165,255,0.18)] border-2 border-white flex flex-col items-center">
        {/* Pink Washi Tape on top left */}
        <div className="absolute -top-2.5 -left-2 z-10">
          <WashiTape color="pink" angle="-6deg" className="w-18" />
        </div>

        {/* Decorative corner stickers */}
        <div className="absolute bottom-3 left-4 text-sky-400 text-lg">⭐</div>
        <div className="absolute bottom-3 right-4 text-pink-400 text-lg">💖</div>

        {/* Loading text */}
        <h3 className="font-heading font-bold text-2xl text-slate-700 tracking-wide mt-2">
          {message}
        </h3>

        {/* 3 Animated Bouncing Dots matching video */}
        <div className="flex items-center gap-2 mt-4 mb-2">
          <div className="w-3 h-3 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
