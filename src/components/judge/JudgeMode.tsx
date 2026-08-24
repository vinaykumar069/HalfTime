import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Brain, 
  ShieldAlert, 
  Award, 
  Target, 
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Flame,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JudgeEvaluation } from '../../types';
import { judgeProject } from '../../services/aiService';
import { UiverseGeminiButton } from '../common/UiverseGeminiButton';

interface JudgeModeProps {
  evaluation?: JudgeEvaluation;
  onUpdateRubric?: (rubricId: string, delta: number) => void;
  projectName?: string;
  hackathonName?: string;
  scopeCutApplied?: boolean;
}

export const JudgeMode: React.FC<JudgeModeProps> = ({
  evaluation,
  projectName = 'Hackathon Copilot',
  hackathonName = 'DoraHacks 2.0',
  scopeCutApplied = false,
}) => {
  const [activeJudgeTab, setActiveJudgeTab] = useState<'vc' | 'tech' | 'ux'>('vc');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);
  
  // Custom context toggles
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [customProjectName, setCustomProjectName] = useState(projectName);
  const [customProblem, setCustomProblem] = useState('Hackathon teams build too many unnecessary features in the final hours, leading to broken demos.');
  const [customSolution, setCustomSolution] = useState('An autonomous war room that audits remaining runway, enforces 1-click scope triage, and gives builders a 180-second live stage teleprompter.');

  const [completedBonuses, setCompletedBonuses] = useState<string[]>(['bonus-1', 'bonus-2']);

  // Dynamic Live State from Gemini (with smart default baseline)
  const [judgeData, setJudgeData] = useState({
    overallScore: scopeCutApplied ? 9.20 : 8.55,
    statusLabel: scopeCutApplied ? 'WINNING ZONE' : 'FINALIST CONTENDER',
    whyYouMightLose: 'Stage demo crashes or over-promising on unbuilt backend features during judge Q&A.',
    judges: {
      vc: {
        name: 'The Cynical VC Judge',
        title: 'Partner at Horizon Ventures',
        avatar: '🧐',
        mainRoast: '"Nice demo, but why won\'t OpenAI or Cursor ship this natively next month? Where is your actual defensive moat?"',
        defense: 'Our moat is the deep deterministic execution engine, real-time runway recalculation, and hackathon workflow integrations that generic LLM chat windows cannot replicate natively.',
        critiqueScore: scopeCutApplied ? '9.1 / 10' : '8.4 / 10',
        tag: 'BUSINESS & MOAT FOCUS'
      },
      tech: {
        name: 'The Hardcore Tech Judge',
        title: 'Principal Engineer at CloudCore',
        avatar: '💻',
        mainRoast: '"Are you just wrapping an API endpoint or is there actual systems engineering under the hood?"',
        defense: 'We built an autonomous time-pressure optimization algorithm with millisecond capacity recalculation, multi-tenant Supabase PostgreSQL Row Level Security, and sub-second Gemini 2.5 Flash inference.',
        critiqueScore: scopeCutApplied ? '9.4 / 10' : '8.6 / 10',
        tag: 'ARCHITECTURE & CODE QUALITY'
      },
      ux: {
        name: 'The Design & UX Judge',
        title: 'Head of Product Design',
        avatar: '🎨',
        mainRoast: '"Hackathon teams love cluttering their UI. Can a first-time user understand what your product does in 5 seconds?"',
        defense: 'We stripped away every non-essential feature down to a high-contrast Hero Cockpit, 1-click Scope Guillotine, and 180-second stage presentation teleprompter.',
        critiqueScore: scopeCutApplied ? '9.5 / 10' : '8.7 / 10',
        tag: 'USER EXPERIENCE & POLISH'
      },
    },
    fixes: [
      { id: 'bonus-1', title: 'Live Cloud Demo Link', desc: 'Judges can open and test URL instantly without local setup.' },
      { id: 'bonus-2', title: 'Clean GitHub Repo + Architecture Diagram', desc: 'Clear README.md showing prompt flow and tech stack.' },
      { id: 'bonus-3', title: '60s Backup Video Screen Recording', desc: 'Prevents disaster in case stage Wi-Fi fails during pitch.' },
      { id: 'bonus-4', title: 'Verbatim 180s Presentation Rehearsal', desc: 'Clean, punchy delivery within the 3-minute time limit.' },
    ]
  });

  const toggleBonus = (id: string) => {
    setCompletedBonuses(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleRunGeminiJudge = async () => {
    setIsAuditing(true);
    setAuditError(null);
    setAuditSuccess(null);

    try {
      const result: any = await judgeProject({
        projectName: customProjectName || projectName,
        problem: customProblem,
        solution: customSolution,
        scopeCutApplied,
      });

      if (result && result.judges) {
        setJudgeData({
          overallScore: Number(result.overallScore) || (scopeCutApplied ? 9.3 : 8.6),
          statusLabel: result.statusLabel || (scopeCutApplied ? 'WINNING ZONE' : 'FINALIST CONTENDER'),
          whyYouMightLose: result.whyYouMightLose || 'Demo instability during live stage presentation.',
          judges: {
            vc: {
              ...judgeData.judges.vc,
              ...(result.judges.vc || {}),
              avatar: '🧐'
            },
            tech: {
              ...judgeData.judges.tech,
              ...(result.judges.tech || {}),
              avatar: '💻'
            },
            ux: {
              ...judgeData.judges.ux,
              ...(result.judges.ux || {}),
              avatar: '🎨'
            },
          },
          fixes: result.fixes && result.fixes.length > 0 ? result.fixes : judgeData.fixes,
        });

        setAuditSuccess('Gemini AI Judge Panel evaluation complete!');
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00FF88', '#00F0FF', '#FFB800', '#FFFFFF'],
          });
        } catch (e) {}
      }
    } catch (err: any) {
      setAuditError(err?.message || 'Failed to simulate judge evaluation with Gemini. Check your API key.');
    } finally {
      setIsAuditing(false);
    }
  };

  const currentJudge = judgeData.judges[activeJudgeTab];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header & Main Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF] mb-2 font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>AI SHARK TANK SIMULATOR</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            JUDGE ARENA
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            Test your project against harsh judge archetypes and practice Q&amp;A defense before stepping on stage.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <UiverseGeminiButton
            onClick={handleRunGeminiJudge}
            disabled={isAuditing}
            loading={isAuditing}
            loadingText="SIMULATING JUDGE PANEL WITH GEMINI..."
            icon={<Flame className="w-4 h-4 text-[#00FF88] fill-current" />}
          >
            JUDGE MY PROJECT WITH GEMINI
          </UiverseGeminiButton>
        </div>
      </div>

      {/* Audit Feedback Banners */}
      {auditError && (
        <div className="p-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-3 text-xs text-[#FF4D4D] animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{auditError}</span>
        </div>
      )}

      {auditSuccess && (
        <div className="p-4 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center gap-3 text-xs text-[#00FF88] font-mono animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{auditSuccess}</span>
        </div>
      )}

      {/* Context Drawer Toggle */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Evaluating project: <strong className="text-white">{customProjectName}</strong> on <strong className="text-[#00F0FF]">{hackathonName}</strong></span>
          </div>
          <button
            onClick={() => setIsEditingContext(!isEditingContext)}
            className="text-xs font-mono text-[#00FF88] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isEditingContext ? 'Hide Context' : 'Edit Context Input'}</span>
            {isEditingContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isEditingContext && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  value={customProjectName}
                  onChange={e => setCustomProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF88]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Scope Status</label>
                <div className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-[#00FF88]">
                  {scopeCutApplied ? '✓ 3h 45m Scope Cut Applied' : '⚠️ Backlog 3h Over Capacity'}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Problem Statement</label>
              <input
                type="text"
                value={customProblem}
                onChange={e => setCustomProblem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF88]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Proposed Solution</label>
              <input
                type="text"
                value={customSolution}
                onChange={e => setCustomSolution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00FF88]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 1. SCORE HERO & PREDICTED PLACEMENT */}
      <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-[#00F0FF] uppercase block">
              Gemini Judge Simulator Results
            </span>
            <span className="text-xs text-[#94A3B8]">DoraHacks 2.0 Official Rubric Weights</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30">
              {judgeData.statusLabel}
            </span>
            <div className="text-2xl font-mono font-black text-white">
              {judgeData.overallScore.toFixed(2)} <span className="text-xs text-[#94A3B8]">/ 10.0</span>
            </div>
          </div>
        </div>

        {/* The #1 Risk That Could Lose You The Prize */}
        <div className="p-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF4D4D] uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Why You Might Lose (Critical Hazard):</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {judgeData.whyYouMightLose}
          </p>
        </div>

        {/* 3 Judge Archetype Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase">
              Select Judge Archetype For Roast &amp; Defense
            </span>
            <span className="text-[10px] font-mono text-[#00FF88]">REAL-TIME GEMINI CRITIQUE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['vc', 'tech', 'ux'] as const).map((tab) => {
              const judge = judgeData.judges[tab];
              const isSelected = activeJudgeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveJudgeTab(tab)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#00FF88]/15 via-[#00F0FF]/10 to-transparent border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                  }`}
                >
                  <span className="text-2xl">{judge.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate">{judge.name}</span>
                    <span className="text-[10px] font-mono text-[#94A3B8] block truncate">{judge.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Judge's Hot Seat & Defense Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-black/40 border border-white/10 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentJudge.avatar}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{currentJudge.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{currentJudge.title}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 text-xs font-mono font-bold">
                Score: {currentJudge.critiqueScore}
              </span>
            </div>

            {/* The Brutal Question */}
            <div className="p-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 space-y-1.5">
              <span className="text-[10px] font-mono text-[#FF4D4D] font-bold uppercase tracking-wider block">
                THE HARD QUESTION ON STAGE:
              </span>
              <p className="text-sm text-white font-medium italic">
                {currentJudge.mainRoast}
              </p>
            </div>

            {/* Your Winning Counter-Argument */}
            <div className="p-4 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 space-y-1.5">
              <span className="text-[10px] font-mono text-[#00FF88] font-bold uppercase tracking-wider block">
                YOUR 10-SECOND WINNING DEFENSE:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                &ldquo;{currentJudge.defense}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRE-SUBMISSION MULTIPLIERS */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-[#0A0E18] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
            <Award className="w-4 h-4 text-[#FFB800]" />
            <span>Pre-Submission Score Multipliers</span>
          </div>
          <span className="text-xs font-mono text-[#00FF88] font-bold">
            {completedBonuses.length} / {judgeData.fixes.length} PASSED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {judgeData.fixes.map((bonus) => {
            const isDone = completedBonuses.includes(bonus.id);
            return (
              <div
                key={bonus.id}
                onClick={() => toggleBonus(bonus.id)}
                className={`p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isDone 
                    ? 'bg-[#00FF88]/10 border-[#00FF88]/40 text-white' 
                    : 'bg-white/[0.02] border-white/10 text-[#94A3B8] hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                  isDone ? 'bg-[#00FF88] border-[#00FF88] text-[#07090E]' : 'border-white/20'
                }`}>
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{bonus.title}</h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{bonus.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
