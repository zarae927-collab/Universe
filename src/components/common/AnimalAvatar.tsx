import React from 'react';

export type AnimalType = 'bunny' | 'deer' | 'cheetah' | 'husky' | 'fox' | 'panda';

interface AnimalAvatarProps {
  type: AnimalType | string;
  size?: number;
  className?: string;
}

export const AnimalAvatar: React.FC<AnimalAvatarProps> = ({
  type = 'bunny',
  size = 54,
  className = '',
}) => {
  // SVG avatars matching the exact cute sticker animal art in the reference recording (Hajira's bunny, Eman's deer, cheetah, husky)
  switch (type) {
    case 'bunny':
      return (
        <div
          className={`relative rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-xs ${className}`}
          style={{ width: size, height: size, background: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)' }}
        >
          <svg viewBox="0 0 100 100" width={size * 0.9} height={size * 0.9}>
            {/* Long Floppy Bunny Ears */}
            <ellipse cx="32" cy="22" rx="9" ry="20" fill="#fce7f3" stroke="#db2777" strokeWidth="3" transform="rotate(-15 32 22)" />
            <ellipse cx="32" cy="22" rx="5" ry="14" fill="#f472b6" opacity="0.6" transform="rotate(-15 32 22)" />
            <ellipse cx="68" cy="22" rx="9" ry="20" fill="#fce7f3" stroke="#db2777" strokeWidth="3" transform="rotate(15 68 22)" />
            <ellipse cx="68" cy="22" rx="5" ry="14" fill="#f472b6" opacity="0.6" transform="rotate(15 68 22)" />
            {/* Head */}
            <circle cx="50" cy="62" r="32" fill="#fff5f9" stroke="#db2777" strokeWidth="3" />
            {/* Cheeks */}
            <circle cx="28" cy="66" r="7" fill="#f472b6" opacity="0.65" />
            <circle cx="72" cy="66" r="7" fill="#f472b6" opacity="0.65" />
            {/* Eyes */}
            <ellipse cx="38" cy="58" rx="4.5" ry="6" fill="#831843" />
            <circle cx="36" cy="56" r="2" fill="#ffffff" />
            <ellipse cx="62" cy="58" rx="4.5" ry="6" fill="#831843" />
            <circle cx="60" cy="56" r="2" fill="#ffffff" />
            {/* Nose & Mouth */}
            <polygon points="50,65 47,69 53,69" fill="#db2777" />
            <path d="M 47,70 Q 50,73 53,70" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'deer':
      return (
        <div
          className={`relative rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-xs ${className}`}
          style={{ width: size, height: size, background: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)' }}
        >
          <svg viewBox="0 0 100 100" width={size * 0.9} height={size * 0.9}>
            {/* Antlers */}
            <path d="M 30,30 L 25,12 M 25,20 L 18,16" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 70,30 L 75,12 M 75,20 L 82,16" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            {/* Ears */}
            <ellipse cx="24" cy="38" rx="7" ry="14" fill="#ffedd5" stroke="#9a3412" strokeWidth="2.5" transform="rotate(-35 24 38)" />
            <ellipse cx="76" cy="38" rx="7" ry="14" fill="#ffedd5" stroke="#9a3412" strokeWidth="2.5" transform="rotate(35 76 38)" />
            {/* Head */}
            <ellipse cx="50" cy="62" rx="30" ry="28" fill="#fff7ed" stroke="#9a3412" strokeWidth="3" />
            {/* Flower on ear */}
            <circle cx="28" cy="28" r="4.5" fill="#f43f5e" />
            <circle cx="28" cy="28" r="1.8" fill="#fef08a" />
            {/* Eyes */}
            <circle cx="38" cy="58" r="5" fill="#431407" />
            <circle cx="36" cy="56" r="2" fill="#ffffff" />
            <circle cx="62" cy="58" r="5" fill="#431407" />
            <circle cx="60" cy="56" r="2" fill="#ffffff" />
            {/* Blush */}
            <circle cx="28" cy="67" r="6" fill="#fb923c" opacity="0.6" />
            <circle cx="72" cy="67" r="6" fill="#fb923c" opacity="0.6" />
            {/* Muzzle */}
            <ellipse cx="50" cy="70" rx="13" ry="10" fill="#fed7aa" />
            <ellipse cx="50" cy="67" rx="4" ry="2.5" fill="#78350f" />
            <path d="M 47,73 Q 50,76 53,73" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'cheetah':
      return (
        <div
          className={`relative rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-xs ${className}`}
          style={{ width: size, height: size, background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)' }}
        >
          <svg viewBox="0 0 100 100" width={size * 0.9} height={size * 0.9}>
            {/* Rounded Ears */}
            <circle cx="26" cy="30" r="12" fill="#fde047" stroke="#854d0e" strokeWidth="3" />
            <circle cx="26" cy="30" r="6" fill="#ca8a04" />
            <circle cx="74" cy="30" r="12" fill="#fde047" stroke="#854d0e" strokeWidth="3" />
            <circle cx="74" cy="30" r="6" fill="#ca8a04" />
            {/* Head */}
            <circle cx="50" cy="60" r="32" fill="#fef9c3" stroke="#854d0e" strokeWidth="3" />
            {/* Cheetah Spots */}
            <circle cx="30" cy="46" r="2.5" fill="#854d0e" />
            <circle cx="70" cy="46" r="2.5" fill="#854d0e" />
            <circle cx="50" cy="38" r="2.5" fill="#854d0e" />
            <circle cx="44" cy="44" r="2" fill="#854d0e" />
            <circle cx="56" cy="44" r="2" fill="#854d0e" />
            {/* Eyes */}
            <circle cx="38" cy="58" r="5" fill="#713f12" />
            <circle cx="36" cy="56" r="2" fill="#ffffff" />
            <circle cx="62" cy="58" r="5" fill="#713f12" />
            <circle cx="60" cy="56" r="2" fill="#ffffff" />
            {/* Tear stripes */}
            <path d="M 38,63 L 34,73" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 62,63 L 66,73" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Nose & Smile */}
            <ellipse cx="50" cy="68" rx="4" ry="2.8" fill="#854d0e" />
            <path d="M 46,73 Q 50,77 54,73" fill="none" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'husky':
    default:
      return (
        <div
          className={`relative rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-xs ${className}`}
          style={{ width: size, height: size, background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' }}
        >
          <svg viewBox="0 0 100 100" width={size * 0.9} height={size * 0.9}>
            {/* Pointy Ears */}
            <polygon points="20,44 32,16 44,40" fill="#64748b" stroke="#334155" strokeWidth="3" />
            <polygon points="26,38 33,22 40,36" fill="#fecdd3" />
            <polygon points="80,44 68,16 56,40" fill="#64748b" stroke="#334155" strokeWidth="3" />
            <polygon points="74,38 67,22 60,36" fill="#fecdd3" />
            {/* Head */}
            <circle cx="50" cy="62" r="32" fill="#ffffff" stroke="#334155" strokeWidth="3" />
            {/* Gray Mask */}
            <path d="M 22,54 C 22,40 38,36 50,46 C 62,36 78,40 78,54 C 74,62 70,68 64,68 C 58,62 50,60 50,60 C 50,60 42,62 36,68 C 30,68 26,62 22,54 Z" fill="#64748b" opacity="0.85" />
            {/* Cheerful blue/cyan eyes */}
            <ellipse cx="38" cy="58" rx="4.5" ry="5.5" fill="#0284c7" />
            <circle cx="36" cy="56" r="2" fill="#ffffff" />
            <ellipse cx="62" cy="58" rx="4.5" ry="5.5" fill="#0284c7" />
            <circle cx="60" cy="56" r="2" fill="#ffffff" />
            {/* Blush */}
            <circle cx="28" cy="68" r="6" fill="#f43f5e" opacity="0.5" />
            <circle cx="72" cy="68" r="6" fill="#f43f5e" opacity="0.5" />
            {/* Nose & Smile */}
            <ellipse cx="50" cy="69" rx="4.5" ry="3.5" fill="#0f172a" />
            <path d="M 46,74 Q 50,78 54,74" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
};
