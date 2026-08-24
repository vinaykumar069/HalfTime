import React from 'react';

interface UiverseTitleProps {
  text: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  color?: string;
  className?: string;
  autoPulse?: boolean;
  asButton?: boolean;
  onClick?: () => void;
}

export const UiverseTitle: React.FC<UiverseTitleProps> = ({
  text,
  size = 'lg',
  color = '#00FF88',
  className = '',
  autoPulse = false,
  asButton = false,
  onClick,
}) => {
  const sizeMap: Record<string, string> = {
    xs: 'text-xs font-mono font-bold tracking-wider',
    sm: 'text-sm font-mono font-black tracking-wider',
    md: 'text-base sm:text-lg font-black tracking-wider font-mono',
    lg: 'text-2xl sm:text-3xl font-black font-display tracking-tight',
    xl: 'text-3xl sm:text-5xl font-black font-display tracking-tight',
    '2xl': 'text-4xl sm:text-6xl font-black font-display tracking-tight',
    hero: 'text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight',
  };

  const Component = asButton ? 'button' : 'div';

  return (
    <div className={`uiverse-title-wrapper ${className}`}>
      <Component
        onClick={onClick}
        className={`uiverse-title ${sizeMap[size] || sizeMap.lg} ${autoPulse ? 'auto-pulse' : ''}`}
        style={{ '--animation-color': color } as React.CSSProperties}
        data-text={text}
      >
        <span className="actual-text">&nbsp;{text}&nbsp;</span>
        <span aria-hidden="true" className="hover-text">&nbsp;{text}&nbsp;</span>
      </Component>
    </div>
  );
};
