import React from 'react';

export const SkyBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Sky Base Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #bde2ff 0%, #d8eeff 30%, #ebf6ff 65%, #f7fbff 100%)',
        }}
      />

      {/* Dashed Cute Flight Trails with Hearts */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        {/* Upper trail */}
        <path
          d="M -50,140 Q 120,60 220,130 T 480,90"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
        {/* Lower trail */}
        <path
          d="M 50,480 Q 200,560 320,490 T 520,530"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Floating Sparkles & Pastel Stars */}
      <div className="absolute top-16 left-6 text-amber-300 text-xl animate-twinkle select-none">✨</div>
      <div className="absolute top-28 right-8 text-pink-300 text-lg animate-twinkle select-none" style={{ animationDelay: '1.2s' }}>💖</div>
      <div className="absolute top-48 left-12 text-sky-400 text-sm animate-twinkle select-none" style={{ animationDelay: '0.6s' }}>⭐</div>
      <div className="absolute top-64 right-10 text-amber-300 text-sm animate-twinkle select-none" style={{ animationDelay: '1.8s' }}>✨</div>
      <div className="absolute top-[420px] left-8 text-pink-400 text-base animate-twinkle select-none" style={{ animationDelay: '2.1s' }}>🌸</div>
      <div className="absolute top-[520px] right-6 text-sky-400 text-xs animate-twinkle select-none" style={{ animationDelay: '1.5s' }}>⭐</div>
      <div className="absolute top-[680px] left-10 text-amber-400 text-base animate-twinkle select-none" style={{ animationDelay: '0.9s' }}>✨</div>

      {/* Drifting Clouds */}
      {/* Cloud 1 - Top Left */}
      <div 
        className="absolute -top-6 -left-12 opacity-85 animate-cloud-slow"
        style={{ width: '220px', height: '110px' }}
      >
        <svg viewBox="0 0 200 100" fill="#ffffff" filter="drop-shadow(0 8px 12px rgba(186, 230, 253, 0.45))">
          <path d="M 30,70 A 25,25 0 0,1 60,45 A 35,35 0 0,1 120,40 A 30,30 0 0,1 165,60 A 25,25 0 0,1 180,80 A 15,15 0 0,1 165,95 L 35,95 A 20,20 0 0,1 30,70 Z" />
        </svg>
      </div>

      {/* Cloud 2 - Top Right */}
      <div 
        className="absolute top-12 -right-16 opacity-75 animate-cloud-medium"
        style={{ width: '260px', height: '120px' }}
      >
        <svg viewBox="0 0 200 100" fill="#ffffff" filter="drop-shadow(0 8px 12px rgba(186, 230, 253, 0.45))">
          <path d="M 25,75 A 25,25 0 0,1 65,45 A 40,40 0 0,1 135,40 A 30,30 0 0,1 175,65 A 20,20 0 0,1 185,85 L 25,85 Z" />
        </svg>
      </div>

      {/* Cloud 3 - Mid-page soft float */}
      <div 
        className="absolute top-[380px] -left-20 opacity-60 animate-cloud-slow"
        style={{ width: '240px', height: '110px', animationDuration: '24s' }}
      >
        <svg viewBox="0 0 200 100" fill="#ffffff" filter="drop-shadow(0 6px 10px rgba(186, 230, 253, 0.35))">
          <path d="M 35,70 A 28,28 0 0,1 70,40 A 38,38 0 0,1 130,45 A 28,28 0 0,1 170,70 L 35,70 Z" />
        </svg>
      </div>

      {/* Cloud 4 - Bottom Fluffy Cloud Banks */}
      <div 
        className="absolute -bottom-10 left-0 right-0 opacity-90 pointer-events-none"
        style={{ height: '160px' }}
      >
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full fill-white" filter="drop-shadow(0 -6px 12px rgba(186, 230, 253, 0.4))">
          <path d="M 0,120 Q 80,60 180,100 Q 280,40 390,80 Q 500,30 620,70 Q 750,40 860,90 Q 940,60 1000,100 L 1000,200 L 0,200 Z" />
        </svg>
      </div>
    </div>
  );
};
