import React, { useState, useEffect } from 'react';

export type PandaPose = 'idle' | 'peek' | 'wave' | 'happy' | 'shy' | 'celebrate' | 'curious';

interface PandaMascotProps {
  pose?: PandaPose;
  size?: number;
  className?: string;
  speechText?: string;
  interactive?: boolean;
  showMotionAccents?: boolean;
  onTap?: () => void;
}

export const PandaMascot: React.FC<PandaMascotProps> = ({
  pose = 'idle',
  size = 120,
  className = '',
  speechText,
  interactive = true,
  showMotionAccents = false,
  onTap,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bounced, setBounced] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    setBounced(true);
    setShowHeart(true);
    setTimeout(() => setBounced(false), 700);
    setTimeout(() => setShowHeart(false), 1200);
    if (onTap) onTap();
  };

  const scale = size / 120;

  return (
    <div
      className={`relative inline-block select-none ${interactive ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      onClick={handleClick}
      style={{ width: size, height: size * 0.95 }}
    >
      {/* Speech bubble if provided */}
      {speechText && (
        <div className="absolute -top-12 -left-8 right-auto z-20 pointer-events-none animate-float-gentle">
          <div className="relative bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-2xl shadow-md border border-sky-100 max-w-[170px] text-center leading-tight">
            {speechText}
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-sky-100 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Floating mini heart when tapped */}
      {showHeart && (
        <div className="absolute top-0 right-2 z-30 animate-bounce pointer-events-none">
          <span className="text-xl">💖</span>
        </div>
      )}

      {/* Main SVG Character */}
      <svg
        viewBox="0 0 140 135"
        width={size}
        height={size * 0.96}
        className={`transition-transform duration-300 ${bounced ? 'animate-happy-bounce' : ''} ${
          pose === 'idle' ? 'animate-float-gentle' : ''
        }`}
        style={{
          transformOrigin: 'bottom center',
        }}
      >
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.12" floodColor="#0284c7" />
          </filter>
          <linearGradient id="pandaWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="90%" stopColor="#f3f8fc" />
            <stop offset="100%" stopColor="#e2edf5" />
          </linearGradient>
          <linearGradient id="pandaEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c3038" />
            <stop offset="100%" stopColor="#181a1f" />
          </linearGradient>
          <radialGradient id="pandaBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff859f" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#ff859f" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff859f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Panda Ears */}
        {/* Left Ear */}
        <g transform={pose === 'curious' ? 'rotate(-6 35 25)' : ''}>
          <ellipse
            cx="32"
            cy="30"
            rx="18"
            ry="18"
            fill="url(#pandaEarGrad)"
            stroke="#16181c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="33" cy="30" rx="9" ry="9" fill="#ffb4c2" opacity="0.6" />
        </g>

        {/* Right Ear */}
        <g transform={pose === 'curious' ? 'rotate(8 105 25)' : ''}>
          <ellipse
            cx="108"
            cy="30"
            rx="18"
            ry="18"
            fill="url(#pandaEarGrad)"
            stroke="#16181c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <ellipse cx="107" cy="30" rx="9" ry="9" fill="#ffb4c2" opacity="0.6" />
        </g>

        {/* Panda Body (Hidden slightly if in peek pose) */}
        {pose !== 'peek' && (
          <g id="bodyGroup">
            {/* Body */}
            <path
              d="M 45 80 C 45 70, 95 70, 95 80 C 105 95, 102 120, 85 125 C 70 128, 55 125, 45 120 C 35 110, 35 90, 45 80 Z"
              fill="url(#pandaWhiteGrad)"
              stroke="#1e2229"
              strokeWidth="3.5"
            />
            {/* Little Feet */}
            <ellipse cx="48" cy="122" rx="12" ry="7" fill="#20242b" stroke="#16181c" strokeWidth="2.5" />
            <ellipse cx="92" cy="122" rx="12" ry="7" fill="#20242b" stroke="#16181c" strokeWidth="2.5" />
            {/* Soft Belly detail */}
            <ellipse cx="70" cy="102" rx="16" ry="12" fill="#ebf3fa" opacity="0.8" />
          </g>
        )}

        {/* Head */}
        <g
          id="headGroup"
          className="transition-transform duration-300"
          style={{
            transform:
              pose === 'curious'
                ? 'rotate(-5deg) translateY(-2px)'
                : pose === 'happy'
                ? 'translateY(-2px)'
                : 'none',
            transformOrigin: '70px 65px',
          }}
        >
          {/* Main Head Base */}
          <ellipse
            cx="70"
            cy="65"
            rx="46"
            ry="38"
            fill="url(#pandaWhiteGrad)"
            stroke="#1e2229"
            strokeWidth="3.5"
            filter="url(#softShadow)"
          />

          {/* Cheeks / Blush */}
          <circle cx="38" cy="74" r="11" fill="url(#pandaBlush)" />
          <circle cx="102" cy="74" r="11" fill="url(#pandaBlush)" />

          {/* Cute Eye Patches (Signature Panda Feature) */}
          <ellipse
            cx="48"
            cy="62"
            rx="12"
            ry="14"
            fill="#23272f"
            transform="rotate(10 48 62)"
          />
          <ellipse
            cx="92"
            cy="62"
            rx="12"
            ry="14"
            fill="#23272f"
            transform="rotate(-10 92 62)"
          />

          {/* Eyes & Expressions */}
          {pose === 'happy' || pose === 'celebrate' ? (
            /* Happy Crescent Eyes */
            <g stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M 42 63 Q 48 57 54 63" />
              <path d="M 86 63 Q 92 57 98 63" />
            </g>
          ) : isBlinking ? (
            /* Blinking line */
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
              <line x1="43" y1="62" x2="53" y2="62" />
              <line x1="87" y1="62" x2="97" y2="62" />
            </g>
          ) : (
            /* Normal Shiny Kawaii Eyes */
            <g id="kawaiiEyes">
              {/* Left Eye */}
              <circle cx="49" cy="62" r="5" fill="#ffffff" />
              <circle cx="47" cy="60" r="2.2" fill="#ffffff" />
              <circle cx="51" cy="64" r="1.2" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="91" cy="62" r="5" fill="#ffffff" />
              <circle cx="89" cy="60" r="2.2" fill="#ffffff" />
              <circle cx="93" cy="64" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Tiny Cute Panda Nose */}
          <path
            d="M 67 67 Q 70 65 73 67 Q 70 71 67 67 Z"
            fill="#1e2229"
          />

          {/* Smile / Mouth */}
          {pose === 'happy' || pose === 'celebrate' ? (
            <path
              d="M 64 72 Q 70 80 76 72"
              fill="#ff859f"
              stroke="#1e2229"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 65 71 Q 70 75 75 71"
              fill="none"
              stroke="#1e2229"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Little Head Shine Highlight */}
          <ellipse cx="58" cy="38" rx="8" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-15 58 38)" />
        </g>

        {/* Arms and Hands depending on Pose */}
        {pose === 'peek' ? (
          /* Little Paws leaning on the card edge */
          <g id="peekPaws">
            <ellipse
              cx="45"
              cy="98"
              rx="11"
              ry="8"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
            />
            {/* Claws / pads */}
            <circle cx="41" cy="98" r="1.8" fill="#4b5563" />
            <circle cx="45" cy="97" r="1.8" fill="#4b5563" />
            <circle cx="49" cy="98" r="1.8" fill="#4b5563" />

            <ellipse
              cx="95"
              cy="98"
              rx="11"
              ry="8"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
            />
            <circle cx="91" cy="98" r="1.8" fill="#4b5563" />
            <circle cx="95" cy="97" r="1.8" fill="#4b5563" />
            <circle cx="99" cy="98" r="1.8" fill="#4b5563" />
          </g>
        ) : pose === 'wave' ? (
          /* One arm waving enthusiastically */
          <g id="waveArms">
            <g className="animate-mascot-wave origin-[35px_85px]">
              <path
                d="M 38 82 C 25 75 16 60 22 52 C 28 46 36 55 42 72 Z"
                fill="#22262e"
                stroke="#16181c"
                strokeWidth="2.5"
              />
              <circle cx="20" cy="52" r="3" fill="#ffb4c2" opacity="0.6" />
            </g>
            <path
              d="M 95 82 C 105 88 112 98 108 106 C 103 112 94 105 90 92 Z"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
            />
          </g>
        ) : pose === 'celebrate' ? (
          /* Both arms raised up cheering */
          <g id="celebrateArms">
            <path
              d="M 40 80 C 26 70 18 52 25 45 C 32 40 38 52 44 72 Z"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
            />
            <path
              d="M 100 80 C 114 70 122 52 115 45 C 108 40 102 52 96 72 Z"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
            />
          </g>
        ) : (
          /* Normal Resting Paws */
          <g id="normalArms">
            <ellipse
              cx="38"
              cy="90"
              rx="9"
              ry="11"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
              transform="rotate(15 38 90)"
            />
            <ellipse
              cx="102"
              cy="90"
              rx="9"
              ry="11"
              fill="#22262e"
              stroke="#16181c"
              strokeWidth="2.5"
              transform="rotate(-15 102 90)"
            />
          </g>
        )}

        {/* Expressive Motion Accent Lines near head matching reference video */}
        {showMotionAccents && (
          <g id="motionAccents" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M 124 50 Q 132 58 126 66" />
            <path d="M 130 46 Q 138 56 132 68" />
          </g>
        )}
      </svg>
    </div>
  );
};
