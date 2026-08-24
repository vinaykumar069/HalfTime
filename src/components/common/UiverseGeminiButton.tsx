import React from 'react';
import { Sparkles } from 'lucide-react';

interface UiverseGeminiButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  id?: string;
  icon?: React.ReactNode;
  loadingText?: string;
  children: React.ReactNode;
}

export const UiverseGeminiButton: React.FC<UiverseGeminiButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  id,
  icon = <Sparkles className="w-4 h-4 text-[#00FF88]" />,
  loadingText = 'GENERATING WITH GEMINI...',
  children,
}) => {
  return (
    <div className={`gemini-btn-wrap ${className}`}>
      <button
        id={id}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className="gemini-glass-btn"
      >
        <span className="btn-content">
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-[#00F0FF]" />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              {icon}
              <span>{children}</span>
            </>
          )}
        </span>
      </button>
      <div className="gemini-btn-shadow" />
    </div>
  );
};
