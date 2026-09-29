import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3-node connected circular orbit logo representing: PAY, SPLIT, SETTLE */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Orbital connecting ring */}
          <circle
            cx="24"
            cy="24"
            r="17"
            stroke="url(#orbit_gradient)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="animate-[spin_24s_linear_infinite]"
          />
          {/* Node 1: PAY (Indigo) */}
          <circle cx="24" cy="8" r="6" fill="#4338CA" />
          <circle cx="24" cy="8" r="2.5" fill="#FFFFFF" />

          {/* Node 2: SPLIT (Violet) */}
          <circle cx="38" cy="32" r="5.5" fill="#7C3AED" />
          <circle cx="38" cy="32" r="2" fill="#FFFFFF" />

          {/* Node 3: SETTLE (Emerald) */}
          <circle cx="10" cy="32" r="5.5" fill="#059669" />
          <circle cx="10" cy="32" r="2" fill="#FFFFFF" />

          {/* Core connection lines */}
          <line x1="24" y1="8" x2="38" y2="32" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="38" y1="32" x2="10" y2="32" stroke="#059669" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="10" y1="32" x2="24" y2="8" stroke="#4338CA" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Gradients */}
          <defs>
            <linearGradient id="orbit_gradient" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4338CA" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Split<span className="text-indigo-600 dark:text-indigo-400">Sphere</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
            Every expense. One clear balance.
          </span>
        )}
      </div>
    </div>
  );
};
