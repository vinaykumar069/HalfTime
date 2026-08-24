import React from 'react';
import { Terminal, FolderGit2, ChevronDown, User, Shield, Sparkles, Rocket } from 'lucide-react';
import { HealthStatus } from '../types';

interface TopBarProps {
  healthStatus: HealthStatus;
  onOpenCommandPalette: () => void;
  onOpenShipMode: () => void;
  onOpenProjectSwitcher?: () => void;
  onOpenAuth?: () => void;
  shipModeReady: boolean;
  countdownDisplay: string;
  countdownStatus: 'NORMAL' | 'AT RISK' | 'CRITICAL';
  projectName?: string;
  hackathonName?: string;
  isDemo?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  healthStatus,
  onOpenCommandPalette,
  onOpenShipMode,
  onOpenProjectSwitcher,
  onOpenAuth,
  shipModeReady,
  countdownDisplay,
  countdownStatus,
  projectName = 'Hackathon Copilot',
  hackathonName = 'DoraHacks 2.0',
  isDemo = false,
}) => {
  const getStatusColor = () => {
    if (countdownStatus === 'CRITICAL' || healthStatus === 'critical') {
      return 'text-[#FF2A5F] drop-shadow-[0_0_12px_rgba(255,42,95,0.6)]';
    }
    if (countdownStatus === 'AT RISK' || healthStatus === 'at-risk') {
      return 'text-[#FFAA00] drop-shadow-[0_0_12px_rgba(255,170,0,0.5)]';
    }
    return 'text-[#00F59B] drop-shadow-[0_0_12px_rgba(0,245,155,0.5)]';
  };

  const getStatusBadge = () => {
    if (countdownStatus === 'CRITICAL') {
      return 'bg-[#FF2A5F]/15 text-[#FF2A5F] border-[#FF2A5F]/40';
    }
    if (countdownStatus === 'AT RISK') {
      return 'bg-[#FFAA00]/15 text-[#FFAA00] border-[#FFAA00]/40';
    }
    return 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40';
  };

  return (
    <header 
      id="halftime-topbar"
      className="h-20 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 lg:px-10 relative z-10 bg-[#07090E]/80 backdrop-blur-2xl"
    >
      {/* Left: Hackathon Event Indicator & Project Selector */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onOpenProjectSwitcher ? (
          <button
            onClick={onOpenProjectSwitcher}
            className="flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-white transition-all cursor-pointer group shadow-sm"
            title="Switch active project sandbox"
          >
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse shadow-[0_0_8px_#00F59B]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{hackathonName}</span>
            <span className="text-xs text-[#64748B]">/</span>
            <span className="text-xs font-medium text-[#94A3B8] group-hover:text-white max-w-[120px] sm:max-w-[200px] truncate transition-colors">
              {projectName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#00D2FF] transition-colors" />
          </button>
        ) : (
          <span className="text-xs font-mono font-bold bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse shadow-[0_0_8px_#00F59B]" />
            <span>{hackathonName}</span>
          </span>
        )}

        {isDemo ? (
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/40 shadow-sm">
            SANDBOX DEMO
          </span>
        ) : (
          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge()} hidden md:inline-block shadow-sm`}>
            {countdownStatus}
          </span>
        )}
      </div>

      {/* Right Controls: Command Palette Trigger, Supabase Auth Shield, & Runway Capsule */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs text-[#94A3B8] hover:text-white transition-all cursor-pointer shadow-sm"
            title="Account & Supabase Auth Security"
          >
            <Shield className="w-3.5 h-3.5 text-[#00F59B]" />
            <span className="hidden sm:inline font-mono text-[11px] font-bold tracking-wider">ACCOUNT</span>
          </button>
        )}

        <button
          id="btn-topbar-command-palette"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs text-[#94A3B8] hover:text-white transition-all group cursor-pointer shadow-sm"
          title="Quick actions and navigation (⌘K)"
        >
          <Terminal className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#00D2FF] transition-colors" />
          <span className="font-sans">Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-[10px] text-[#64748B] font-mono">⌘K</kbd>
        </button>

        {/* Mission Runway Time Capsule */}
        <div 
          id="halftime-countdown-capsule"
          className="flex items-center bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/15 rounded-2xl px-4 sm:px-6 py-2 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="flex flex-col items-start mr-3 sm:mr-5">
            <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-mono font-bold">
              RUNWAY REMAINING
            </span>
            <span 
              className={`text-base sm:text-xl font-mono font-black tracking-tight ${getStatusColor()} transition-colors`}
            >
              {countdownDisplay}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 mx-1 sm:mx-2" />

          {/* Quick Ship Mode Trigger */}
          <button 
            id="btn-topbar-ship-mode"
            onClick={onOpenShipMode}
            className="flex items-center gap-2 pl-2 sm:pl-3 group/ship cursor-pointer text-left"
            title="Open Ship Mode"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black text-[#00F59B] group-hover/ship:text-white transition-colors tracking-wider flex items-center gap-1">
                <span>SHIP</span>
                <Rocket className="w-3 h-3 text-[#00F59B] group-hover/ship:translate-x-0.5 group-hover/ship:-translate-y-0.5 transition-transform" />
              </span>
              <div className="flex space-x-1 mt-1">
                <div className="w-1.5 h-1.5 bg-[#00F59B] rounded-full shadow-[0_0_6px_#00F59B]" />
                <div className="w-1.5 h-1.5 bg-[#00F59B] rounded-full opacity-50" />
                <div className="w-1.5 h-1.5 bg-[#00F59B] rounded-full opacity-25" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
