import React, { useEffect } from 'react';
import { Sparkles, X, CheckCircle2, Rocket, ArrowRight, Github, ExternalLink, Video, Award, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShipModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scopeCutApplied: boolean;
  score: number;
}

export const ShipModeModal: React.FC<ShipModeModalProps> = ({
  isOpen,
  onClose,
  scopeCutApplied,
  score,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00F59B', '#00D2FF', '#FF6B00', '#FFAA00', '#FFFFFF'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div 
        id="halftime-ship-mode-modal"
        className="relative w-full max-w-3xl bg-gradient-to-b from-[#0E1322] via-[#0B0E17] to-[#07090E] border border-[#00F59B]/40 rounded-3xl shadow-[0_0_80px_-10px_rgba(0,245,155,0.25)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Aurora mesh gradient */}
        <div className="absolute top-0 left-1/4 right-1/4 h-36 bg-gradient-to-b from-[#00F59B]/20 via-[#00D2FF]/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hero */}
        <div className="pt-10 pb-6 px-8 text-center relative z-10 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F59B]/15 border border-[#00F59B]/30 text-[#00F59B] font-mono text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SHIP MODE ACTIVE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
            You&apos;re not out of time.
          </h2>
          <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-[#00F59B] via-[#00D2FF] to-[#FFAA00] bg-clip-text text-transparent mt-1">
            You&apos;re out of unnecessary features.
          </p>

          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto mt-3">
            Team DOOM has stripped away the friction. The core AI evaluation engine is stable, tested, and ready to stun DoraHacks 2.0 judges.
          </p>
        </div>

        {/* Submission Telemetry Bento */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#64748B]">ESTIMATED JUDGE SCORE</span>
              <div className="text-2xl font-mono font-black text-[#00F59B] mt-2">
                {scopeCutApplied ? '9.20' : '8.55'} <span className="text-xs text-[#64748B]">/ 10</span>
              </div>
              <span className="text-[10px] text-[#00F59B] font-mono mt-1 font-bold">Top 3% Hackathon Tier</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#64748B]">RECOVERED RUNWAY</span>
              <div className="text-2xl font-mono font-black text-[#00D2FF] mt-2">
                3h 45m
              </div>
              <span className="text-[10px] text-[#00D2FF] font-mono mt-1 font-bold">Zero Demo Sacrifice</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-[#64748B]">SUBMISSION STATUS</span>
              <div className="text-2xl font-mono font-black text-white mt-2">
                READY
              </div>
              <span className="text-[10px] text-[#FFAA00] font-mono mt-1 font-bold">DoraHacks 2.0 Port</span>
            </div>
          </div>

          {/* Submission checklist verified */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
            <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
              <span>HACKATHON ARTIFACTS VERIFICATION</span>
              <span className="text-[#00F59B] text-[10px] font-mono font-bold">ALL CRITICAL PASS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="truncate">Cloud Run Live Preview Deployed</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="truncate">GitHub Public Repo &amp; README.md</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="truncate">3-Minute Live Demo Pitch Script</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="truncate">Backup 60s Video Screen Recording</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-xs italic text-[#94A3B8]">
              &ldquo;The difference between amateur and winning hackathon teams isn&apos;t lines of code written. It&apos;s having the guts to ship exactly what matters.&rdquo;
            </p>
            <div className="text-[10px] font-mono text-[#00F59B] mt-1 font-bold">— HALFTIME Copilot</div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-6 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
            <Shield className="w-4 h-4 text-[#00F59B]" />
            <span>Ready for DoraHacks submission window</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#94A3B8] hover:text-white border border-white/10 transition-all flex-1 sm:flex-none cursor-pointer"
            >
              Back to Command Center
            </button>
            <button
              onClick={() => {
                confetti({ particleCount: 140, spread: 90 });
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D2FF] text-[#07090E] font-mono text-xs font-black hover:brightness-110 shadow-lg glow-emerald transition-all active:scale-95 flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer"
            >
              <span>SUBMIT &amp; SHIP TO DORAHACKS</span>
              <Rocket className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
