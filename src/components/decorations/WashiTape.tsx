import React from 'react';

interface WashiTapeProps {
  color?: 'pink' | 'blue' | 'yellow' | 'gingham' | 'polka';
  className?: string;
  angle?: string;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  color = 'polka',
  className = '',
  angle = '-3deg',
}) => {
  const getBackgroundStyle = () => {
    switch (color) {
      case 'polka':
        return {
          backgroundColor: '#ffb5c5',
          backgroundImage: 'radial-gradient(#ffffff 22%, transparent 28%)',
          backgroundSize: '10px 10px',
        };
      case 'gingham':
        return {
          backgroundColor: '#ffccd5',
          backgroundImage:
            'linear-gradient(90deg, rgba(255, 255, 255, .5) 50%, transparent 50%), linear-gradient(rgba(255, 255, 255, .5) 50%, transparent 50%)',
          backgroundSize: '14px 14px',
        };
      case 'blue':
        return {
          backgroundColor: '#bae6fd',
        };
      case 'yellow':
        return {
          backgroundColor: '#fef08a',
        };
      case 'pink':
      default:
        return {
          backgroundColor: '#f472b6',
        };
    }
  };

  return (
    <div
      className={`h-5 w-20 pointer-events-none select-none shadow-xs border-y border-pink-400/30 ${className}`}
      style={{
        ...getBackgroundStyle(),
        transform: `rotate(${angle})`,
        clipPath: 'polygon(0% 0%, 4% 50%, 0% 100%, 100% 100%, 96% 50%, 100% 0%)',
      }}
    />
  );
};
