import React from 'react';

interface BlockStickerProps {
  size?: number;
  className?: string;
  type?: 'block' | 'crown';
}

export const BlockSticker: React.FC<BlockStickerProps> = ({
  size = 54,
  className = '',
  type = 'block',
}) => {
  return (
    <div
      className={`relative inline-block select-none pointer-events-none filter drop-shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 70 70" width={size} height={size}>
        {/* Cute hand holding phone with cuff */}
        <g id="handAndPhone">
          {/* Blue sleeve cuff */}
          <path d="M 52,65 L 68,54 L 62,46 L 46,57 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" strokeLinejoin="round" />
          {/* Hand / thumb */}
          <ellipse cx="50" cy="52" rx="7" ry="5" fill="#fcd34d" stroke="#d97706" strokeWidth="1.8" transform="rotate(-30 50 52)" />
          {/* Phone body */}
          <rect x="22" y="16" width="26" height="42" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" transform="rotate(-12 35 37)" />
          {/* Phone screen */}
          <rect x="25" y="20" width="20" height="34" rx="3" fill="#38bdf8" opacity="0.8" transform="rotate(-12 35 37)" />
        </g>

        {/* 🚫 Prohibition Sign or 💖 Crown Sign */}
        {type === 'block' ? (
          <g id="prohibitionSign">
            {/* Red circle */}
            <circle cx="44" cy="30" r="15" fill="none" stroke="#ef4444" strokeWidth="4.5" />
            {/* Slash line */}
            <line x1="33" y1="19" x2="55" y2="41" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        ) : (
          <g id="crownBadge">
            <circle cx="44" cy="30" r="15" fill="#fef08a" stroke="#eab308" strokeWidth="3" />
            <text x="44" y="36" fontSize="16" textAnchor="middle">👑</text>
          </g>
        )}
      </svg>
    </div>
  );
};
