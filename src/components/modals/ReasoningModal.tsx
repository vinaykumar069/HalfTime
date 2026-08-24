import React from 'react';
import { X, Brain, CheckCircle, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react';
import { ProjectHealth } from '../../types';

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: ProjectHealth;
  scopeCutApplied: boolean;
}

export const ReasoningModal: React.FC<ReasoningModalProps> = ({
  isOpen,
  onClose,
  health,
  scopeCutApplied,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        id="halftime-reasoning-modal"
        className="w-full max-w-2xl glass-panel-elevated rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">HALFTIME AI Reasoning Engine</h3>
              <p className="text-[11px] font-mono text-[#00D2FF]">Deterministic Capacity &amp; Judge Risk Model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs text-[#94A3B8] leading-relaxed">
          {/* Situation Analysis */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-white font-mono font-semibold">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FFAA00]" />
                1. Situation Telemetry
              </span>
              <span className="text-[#00D2FF] text-[11px]">T-11:00h Remaining</span>
            </div>
            <p>
              Your backlog contains <strong className="text-white">14.0 hours</strong> of estimated engineering effort across 4 team members. With <strong className="text-white">11.0 hours</strong> left before submission freeze and an estimated 1.5h required for live smoke testing, pitch rehearsal, and video rendering, your true engineering runway is <strong className="text-[#FF2A5F]">9.5 hours</strong>.
            </p>
          </div>

          {/* Core Problem Detected */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FF2A5F]/10 border border-[#FF2A5F]/30 space-y-2">
            <div className="flex items-center gap-2 text-[#FF2A5F] font-mono font-bold">
              <AlertTriangle className="w-4 h-4" />
              2. What is Wrong (The 3-Hour Capacity Gap)
            </div>
            <p className="text-slate-200">
              {scopeCutApplied ? (
                <span>
                  <strong className="text-[#00F59B]">RESOLVED:</strong> Scope cuts were executed. 3h 45m of secondary features were eliminated, bringing total remaining work to 10h 15m.
                </span>
              ) : (
                <span>
                  Team DOOM is <strong className="text-[#FF2A5F]">3.0 hours over capacity</strong>. In 89% of hackathon post-mortems, teams that refuse to cut scope in the second half ship half-finished features, broken authentication flows, or unstyled dashboards that fail during judge evaluation.
                </span>
              )}
            </p>
          </div>

          {/* Mathematical recommendation breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-mono font-bold">
              <Zap className="w-4 h-4 text-[#00F59B]" />
              3. Recommended Surgical Intervention
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-[#64748B]">FEATURE CUT #1</div>
                <div className="font-bold text-white text-xs mt-1">Analytics Dashboard</div>
                <div className="text-[#00F59B] font-mono font-bold text-xs mt-0.5">−2h 00m</div>
                <div className="text-[10px] text-[#64748B] mt-1">0% impact on 3-min demo</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-[#64748B]">FEATURE CUT #2</div>
                <div className="font-bold text-white text-xs mt-1">Team Profiles &amp; Bios</div>
                <div className="text-[#00F59B] font-mono font-bold text-xs mt-0.5">−1h 00m</div>
                <div className="text-[10px] text-[#64748B] mt-1">Replace with verbal intro</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-[#64748B]">FEATURE CUT #3</div>
                <div className="font-bold text-white text-xs mt-1">Dark Mode Toggle</div>
                <div className="text-[#00F59B] font-mono font-bold text-xs mt-0.5">−45m</div>
                <div className="text-[10px] text-[#64748B] mt-1">Default theme is already dark</div>
              </div>
            </div>
          </div>

          {/* Outcome projection */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="text-[#00F59B] font-mono font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              4. Expected Outcome
            </div>
            <p>
              By trimming 3h 45m of secondary fluff, 100% of Alex &amp; Elena&apos;s bandwidth shifts to stabilizing the <strong>Core AI evaluation flow</strong> and rehearsing the <strong>3-minute demo script</strong>. Judge feasibility score increases from 9.1 to 9.8.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00F59B] text-[#07090E] font-mono text-xs font-black hover:brightness-110 transition-all glow-emerald cursor-pointer"
          >
            Got it, close reasoning
          </button>
        </div>
      </div>
    </div>
  );
};
