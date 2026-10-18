import React, { useState, useEffect } from 'react';

export type BearPose = 'idle' | 'peek' | 'wave' | 'happy' | 'love';

interface BearMascotProps {
  pose?: BearPose;
  size?: number;
  className?: string;
  speechText?: string;
  interactive?: boolean;
  onTap?: () => void;
}

export const BearMascot: React.FC<BearMascotProps> = ({
  pose = 'idle',
  size = 115,
  className = '',
  speechText,
  interactive = true,
  onTap,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bounced, setBounced] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    setBounced(true);
    setTimeout(() => setBounced(false), 700);
    if (onTap) onTap();
  };

  return (
    <div
      className={`relative inline-block select-none ${interactive ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      onClick={handleClick}
      style={{ width: size, height: size * 0.95 }}
    >
      {speechText && (
        <div className="absolute -top-12 -right-6 z-20 pointer-events-none animate-float-gentle">
          <div className="relative bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-2xl shadow-md border border-amber-100 max-w-[170px] text-center leading-tight">
            {speechText}
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-r border-b border-amber-100 transform rotate-45" />
          </div>
        </div>
      )}

      <svg
        viewBox="0 0 140 135"
        width={size}
        height={size * 0.96}
        className={`transition-transform duration-300 ${bounced ? 'animate-happy-bounce' : ''} ${
          pose === 'idle' ? 'animate-float-gentle' : ''
        }`}
        style={{ transformOrigin: 'bottom center' }}
      >
        <defs>
          <filter id="bearShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.1" floodColor="#92400e" />
          </filter>
          <linearGradient id="bearBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2ad7f" />
            <stop offset="70%" stopColor="#c89060" />
            <stop offset="100%" stopColor="#b67a49" />
          </linearGradient>
          <radialGradient id="bearBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff708f" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff708f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bear Ears */}
        <g id="bearEars">
          {/* Left Ear */}
          <ellipse
            cx="34"
            cy="32"
            rx="16"
            ry="16"
            fill="url(#bearBodyGrad)"
            stroke="#633917"
            strokeWidth="3.2"
          />
          <ellipse cx="34" cy="32" rx="8" ry="8" fill="#fbd5b5" />

          {/* Right Ear */}
          <ellipse
            cx="106"
            cy="32"
            rx="16"
            ry="16"
            fill="url(#bearBodyGrad)"
            stroke="#633917"
            strokeWidth="3.2"
          />
          <ellipse cx="106" cy="32" rx="8" ry="8" fill="#fbd5b5" />
        </g>

        {/* Body if not peaking */}
        {pose !== 'peek' && (
          <g id="bearBody">
            <path
              d="M 45 78 C 45 68, 95 68, 95 78 C 104 94, 102 120, 85 125 C 70 128, 55 125, 45 120 C 35 110, 36 90, 45 78 Z"
              fill="url(#bearBodyGrad)"
              stroke="#633917"
              strokeWidth="3.2"
            />
            {/* Belly patch */}
            <ellipse cx="70" cy="100" rx="17" ry="14" fill="#fce5cf" />
            {/* Feet */}
            <ellipse cx="48" cy="122" rx="12" ry="7" fill="#8e4f20" stroke="#633917" strokeWidth="2.5" />
            <ellipse cx="92" cy="122" rx="12" ry="7" fill="#8e4f20" stroke="#633917" strokeWidth="2.5" />
          </g>
        )}

        {/* Head */}
        <g id="bearHead">
          <ellipse
            cx="70"
            cy="65"
            rx="45"
            ry="38"
            fill="url(#bearBodyGrad)"
            stroke="#633917"
            strokeWidth="3.2"
            filter="url(#bearShadow)"
          />

          {/* Soft Cheeks */}
          <circle cx="38" cy="74" r="10" fill="url(#bearBlush)" />
          <circle cx="102" cy="74" r="10" fill="url(#bearBlush)" />

          {/* Muzzle */}
          <ellipse cx="70" cy="70" rx="19" ry="14" fill="#fbe7d5" stroke="#633917" strokeWidth="2.2" />

          {/* Eyes */}
          {pose === 'happy' || pose === 'love' ? (
            <g stroke="#3f220c" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 46 62 Q 52 56 58 62" />
              <path d="M 82 62 Q 88 56 94 62" />
            </g>
          ) : isBlinking ? (
            <g stroke="#3f220c" strokeWidth="3" strokeLinecap="round">
              <line x1="47" y1="62" x2="57" y2="62" />
              <line x1="83" y1="62" x2="93" y2="62" />
            </g>
          ) : (
            <g id="bearEyes">
              <circle cx="52" cy="61" r="5" fill="#3f220c" />
              <circle cx="50" cy="59" r="2" fill="#ffffff" />
              <circle cx="54" cy="63" r="1" fill="#ffffff" />

              <circle cx="88" cy="61" r="5" fill="#3f220c" />
              <circle cx="86" cy="59" r="2" fill="#ffffff" />
              <circle cx="90" cy="63" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Cute Bear Nose */}
          <ellipse cx="70" cy="67" rx="5.5" ry="4" fill="#4a260f" />

          {/* Mouth */}
          <path
            d="M 66 73 Q 70 76 74 73"
            fill="none"
            stroke="#4a260f"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Head shine */}
          <ellipse cx="58" cy="38" rx="8" ry="3" fill="#ffffff" opacity="0.35" transform="rotate(-15 58 38)" />
        </g>

        {/* Arms */}
        {pose === 'peek' ? (
          <g id="bearPeekPaws">
            <ellipse cx="45" cy="98" rx="10" ry="7" fill="#8e4f20" stroke="#633917" strokeWidth="2.5" />
            <ellipse cx="95" cy="98" rx="10" ry="7" fill="#8e4f20" stroke="#633917" strokeWidth="2.5" />
          </g>
        ) : pose === 'wave' ? (
          <g id="bearWaveArm">
            <g className="animate-mascot-wave origin-[105px_85px]">
              <path
                d="M 98 82 C 112 75 122 60 116 52 C 110 46 102 55 96 72 Z"
                fill="#8e4f20"
                stroke="#633917"
                strokeWidth="2.5"
              />
            </g>
            <ellipse cx="38" cy="90" rx="9" ry="11" fill="#8e4f20" stroke="#633917" strokeWidth="2.5" />
          </g>
        ) : (
          <g id="bearNormalArms">
            <ellipse
              cx="38"
              cy="90"
              rx="9"
              ry="11"
              fill="#8e4f20"
              stroke="#633917"
              strokeWidth="2.5"
              transform="rotate(15 38 90)"
            />
            <ellipse
              cx="102"
              cy="90"
              rx="9"
              ry="11"
              fill="#8e4f20"
              stroke="#633917"
              strokeWidth="2.5"
              transform="rotate(-15 102 90)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
