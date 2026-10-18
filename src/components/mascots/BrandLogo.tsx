import React from 'react';
import { PandaMascot } from './PandaMascot';
import { BearMascot } from './BearMascot';

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', compact = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col select-none ${
        onClick ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      {/* Decorative Sparkles & Hearts around logo */}
      <div className="absolute -top-2 -left-2 text-amber-400 text-sm animate-twinkle select-none pointer-events-none">✨</div>
      <div className="absolute top-0 -right-3 text-pink-400 text-xs animate-pulse select-none pointer-events-none">💖</div>

      {/* Characters Peeking over the Logo */}
      <div className="relative w-48 sm:w-56 h-12 pointer-events-none">
        {/* Left: Cute Bear peeking */}
        <div className="absolute -left-1 -top-7 z-10 transform -rotate-12">
          <BearMascot size={compact ? 52 : 62} pose="peek" interactive={false} />
        </div>

        {/* Right: Cute Panda peeking */}
        <div className="absolute right-4 -top-7 z-10 transform rotate-12">
          <PandaMascot size={compact ? 54 : 64} pose="peek" interactive={false} />
        </div>
      </div>

      {/* Bubble 3D Logo Text */}
      <div className="relative -mt-5 z-20">
        <div className="relative px-3.5 py-1 rounded-2xl bg-white/95 border-2 border-white shadow-[0_4px_16px_rgba(56,165,255,0.2)] backdrop-blur-xs flex items-center gap-1">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight font-heading text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-500 drop-shadow-xs">
            Bestie
          </span>
          <span className="text-sm">🐾</span>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight font-heading text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 drop-shadow-xs">
            Bonds
          </span>
        </div>
      </div>
    </div>
  );
};
