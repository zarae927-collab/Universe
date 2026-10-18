import React from 'react';

interface DaisyStickerProps {
  size?: number;
  className?: string;
}

export const DaisySticker: React.FC<DaisyStickerProps> = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative inline-block select-none pointer-events-none filter drop-shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 50 50" width={size} height={size}>
        {/* 5 Petals */}
        <g fill="#93c5fd" stroke="#3b82f6" strokeWidth="2">
          <ellipse cx="25" cy="12" rx="7" ry="9" />
          <ellipse cx="37" cy="20" rx="7" ry="9" transform="rotate(72 37 20)" />
          <ellipse cx="33" cy="35" rx="7" ry="9" transform="rotate(144 33 35)" />
          <ellipse cx="17" cy="35" rx="7" ry="9" transform="rotate(216 17 35)" />
          <ellipse cx="13" cy="20" rx="7" ry="9" transform="rotate(288 13 20)" />
        </g>
        {/* Yellow Flower Center */}
        <circle cx="25" cy="25" r="7.5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        <circle cx="23" cy="23" r="2" fill="#fef08a" />
      </svg>
    </div>
  );
};
