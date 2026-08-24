import React from 'react';
import { UiverseTitle } from './common/UiverseTitle';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showLabel = true,
  animated = false 
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg' || size === 'xl';

  return (
    <div className="flex items-center space-x-3 select-none group cursor-pointer">
      {/* Iconic Mission Control Halftime Glyph */}
      <div className={`relative ${isSm ? 'w-7 h-7' : isLg ? 'w-11 h-11' : 'w-9 h-9'} flex items-center justify-center shrink-0`}>
        {/* Ambient Neon Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00] via-[#00D2FF] to-[#00FF88] rounded-xl opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Core Shield Emblem */}
        <div className="relative z-10 w-full h-full rounded-xl bg-[#080B12] border border-white/20 flex items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00D2FF_1px,transparent_1px)] [background-size:6px_6px]" />
          
          {/* Halftime Dual-Chevron Power Core */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className={`${isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 transition-transform duration-300 group-hover:scale-110`}
          >
            {/* Left Chevron: Halftime Orange */}
            <path 
              d="M4 6L11 12L4 18" 
              stroke="url(#orange-grad)" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Right Chevron: Turbo Emerald */}
            <path 
              d="M13 6L20 12L13 18" 
              stroke="url(#emerald-grad)" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <defs>
              <linearGradient id="orange-grad" x1="4" y1="6" x2="11" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF8A00" />
                <stop offset="1" stopColor="#FF3366" />
              </linearGradient>
              <linearGradient id="emerald-grad" x1="13" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FF88" />
                <stop offset="1" stopColor="#00D2FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {/* Uiverse Hover Fill Title */}
            <UiverseTitle
              text="HALFTIME"
              size={isSm ? 'xs' : isLg ? 'md' : 'sm'}
              color="#00FF88"
              autoPulse={animated}
            />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse ml-0.5" />
          </div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#94A3B8] font-mono font-bold mt-0.5">
            HACKATHON OS <span className="text-[#00F0FF]">v3.0</span>
          </p>
        </div>
      )}
    </div>
  );
};
