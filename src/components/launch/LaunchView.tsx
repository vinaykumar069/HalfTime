import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Sparkles, 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Video, 
  FileText, 
  ExternalLink, 
  Check, 
  Award,
  Clock,
  Zap,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LaunchChecklistItem, PitchCoachResult, DemoFlowResult } from '../../types';
import { improvePitch } from '../../services/aiService';
import { UiverseGeminiButton } from '../common/UiverseGeminiButton';

interface LaunchViewProps {
  checklist: LaunchChecklistItem[];
  onToggleChecklistItem: (id: string) => void;
  onAddChecklistItem: (item: LaunchChecklistItem) => void;
  onDeleteChecklistItem: (id: string) => void;
  pitchData: PitchCoachResult | null;
  demoFlowData: DemoFlowResult | null;
  onUpdatePitchData: (pitch: PitchCoachResult) => void;
  onUpdateDemoFlowData: (flow: DemoFlowResult) => void;
  projectName?: string;
  hackathonName?: string;
}

export const LaunchView: React.FC<LaunchViewProps> = ({
  checklist,
  onToggleChecklistItem,
  pitchData,
  demoFlowData,
  projectName = 'Hackathon Copilot',
  hackathonName = 'DoraHacks 2.0',
}) => {
  // 180-Second Teleprompter Stopwatch State
  const [pitchSeconds, setPitchSeconds] = useState(0);
  const [isPitchPlaying, setIsPitchPlaying] = useState(false);
  const [activePitchSection, setActivePitchSection] = useState<'hook' | 'demo' | 'tech' | 'ask'>('hook');

  useEffect(() => {
    let interval: any = null;
    if (isPitchPlaying) {
      interval = setInterval(() => {
        setPitchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPitchPlaying]);

  const resetPitchTimer = () => {
    setIsPitchPlaying(false);
    setPitchSeconds(0);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = checklist.filter(i => i.status === 'COMPLETE').length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const handleGeneratePitch = async () => {
    setIsGeneratingPitch(true);
    try {
      await improvePitch({
        projectName: 'HALFTIME',
        problem: 'Hackathon teams build too many unnecessary features in the final hours, leading to broken demos.',
        solution: 'An autonomous hackathon war room with 1-click Scope Guillotine and 180s live teleprompter.',
        demoMoment: 'Instant 1-click capacity recalculation and real-time judge defense preview.',
      });
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF88', '#00F0FF', '#FFFFFF'],
        });
      } catch (e) {}
    } catch (err) {
      console.error('Failed to generate pitch with Gemini', err);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const pitchSections = [
    {
      id: 'hook' as const,
      timing: '0:00 - 0:30',
      title: 'The Hook & Pain Point',
      speech: '“89% of hackathon teams fail not because their idea is bad, but because they run out of time and ship broken prototypes. We built HALFTIME: the autonomous war room that prevents hackathon death.”',
      tip: 'Do not introduce team names yet. Hook the judges with the visceral pain first.'
    },
    {
      id: 'demo' as const,
      timing: '0:30 - 2:00',
      title: 'The Live Interactive Demo',
      speech: '“Watch this: we have 11 hours left and our backlog is 3 hours over capacity. In 1 click, our AI Scope Cutter recovers 3h 45m of breathing room without touching the core demo loop.”',
      tip: 'Never show slides during this block. Run the actual live product in front of them.'
    },
    {
      id: 'tech' as const,
      timing: '2:00 - 2:30',
      title: 'The Secret Sauce / Architecture',
      speech: '“Under the hood, HALFTIME combines multi-tenant PostgreSQL Row Level Security with sub-second Gemini 2.5 Flash inference for dynamic time-pressure optimization.”',
      tip: 'Highlight technical depth and system architecture to impress engineering judges.'
    },
    {
      id: 'ask' as const,
      timing: '2:30 - 3:00',
      title: 'The Vision & Close',
      speech: '“We are turning amateur hackathon hackers into winning builders. The live demo is deployed on Cloud Run, and we are ready for your questions.”',
      tip: 'End with high confidence and leave 30s buffer for Q&A.'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 text-xs font-mono text-[#00FF88] mb-2 font-bold">
            <Mic className="w-3.5 h-3.5" />
            <span>STAGE PRESENTATION &amp; SUBMISSION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            PITCH &amp; SHIP LAB
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            Master your exact 180-second stage presentation and clear all pre-flight submission gates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <UiverseGeminiButton
            onClick={handleGeneratePitch}
            disabled={isGeneratingPitch}
            loading={isGeneratingPitch}
            loadingText="COACHING PITCH..."
            icon={<Sparkles className="w-3.5 h-3.5 text-[#00FF88]" />}
          >
            COACH PITCH SCRIPT
          </UiverseGeminiButton>

          <div className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <Rocket className="w-4 h-4 text-[#00F0FF]" />
            <div>
              <span className="text-[10px] font-mono text-[#94A3B8] block font-bold">READINESS</span>
              <span className="text-base font-mono font-black text-white">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. THE 180-SECOND STAGE TELEPROMPTER */}
      <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Teleprompter Top Header & Stopwatch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-[#00F0FF] uppercase block">
              180-Second Live Pitch Script
            </span>
            <span className="text-xs text-[#94A3B8]">Calibrated for 3-minute hackathon judge demos</span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-lg flex items-center gap-2 ${
              pitchSeconds > 180 ? 'bg-[#FF4D4D]/20 text-[#FF4D4D] border-[#FF4D4D]/50' : 'bg-black/60 text-[#00FF88] border-white/10'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(pitchSeconds)} <span className="text-xs text-[#94A3B8]">/ 3:00</span></span>
            </div>

            <button
              onClick={() => setIsPitchPlaying(!isPitchPlaying)}
              className={`p-3 rounded-2xl font-mono font-black text-xs cursor-pointer transition-all ${
                isPitchPlaying ? 'bg-[#FF4D4D] text-white shadow-lg' : 'bg-[#00FF88] text-[#07090E] glow-emerald'
              }`}
            >
              {isPitchPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={resetPitchTimer}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pitch Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pitchSections.map((section) => {
            const isActive = activePitchSection === section.id;
            return (
              <div
                key={section.id}
                onClick={() => setActivePitchSection(section.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer select-none space-y-2.5 ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#00FF88]/10 via-[#00F0FF]/5 to-transparent border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#00F0FF] font-bold bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full">
                    {section.timing}
                  </span>
                  <h4 className="text-xs font-bold text-white">{section.title}</h4>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                  {section.speech}
                </p>

                <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#94A3B8]">
                  💡 <strong>Coach Tip:</strong> {section.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SUBMISSION PRE-FLIGHT CHECKLIST (Zero-Disqualification Gate) */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-[#0A0E18] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
            <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
            <span>Submission Pre-Flight Gates</span>
          </div>
          <span className="text-xs font-mono text-[#00FF88] font-bold">
            {completedCount} OF {checklist.length} CLEARED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checklist.map((item) => {
            const isComplete = item.status === 'COMPLETE';
            return (
              <div
                key={item.id}
                onClick={() => onToggleChecklistItem(item.id)}
                className={`p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between select-none ${
                  isComplete 
                    ? 'bg-[#00FF88]/10 border-[#00FF88]/40 text-white' 
                    : 'bg-white/[0.02] border-white/10 text-[#94A3B8] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    isComplete ? 'bg-[#00FF88] border-[#00FF88] text-[#07090E]' : 'border-white/20'
                  }`}>
                    {isComplete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`truncate font-medium ${isComplete ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase shrink-0">
                  {item.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
