import React from 'react';

interface HangingBannerProps {
  text?: string;
  className?: string;
}

export const HangingBanner: React.FC<HangingBannerProps> = ({ text, className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Hanging Strings and Wooden Pegs */}
      <div className="flex items-center justify-between w-40 px-6 -mb-1 z-10">
        {/* Left peg & string */}
        <div className="flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
          <div className="w-0.5 h-4 bg-amber-700/60" />
        </div>
        {/* Center hanging heart loop */}
        <div className="flex flex-col items-center -mt-1">
          <div className="w-3 h-3 rounded-full bg-pink-400/80 border border-white" />
          <div className="w-0.5 h-3 bg-pink-300" />
        </div>
        {/* Right peg & string */}
        <div className="flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-xs" />
          <div className="w-0.5 h-4 bg-amber-700/60" />
        </div>
      </div>

      {/* Main Gingham Hanging Sign */}
      <div className="relative px-6 py-2.5 rounded-2xl bg-gingham-pink border-2 border-white shadow-[0_4px_12px_rgba(244,114,182,0.25)] flex items-center justify-center">
        {/* Cute Pink Heart in the middle */}
        <div className="w-7 h-7 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-pink-500 text-sm">
          💖
        </div>

        {text && (
          <span className="ml-2 font-heading font-bold text-slate-800 text-sm">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};
