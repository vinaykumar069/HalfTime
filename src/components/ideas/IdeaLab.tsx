import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  HelpCircle,
  Clock,
  ArrowRight,
  Flame,
  ShieldAlert,
  Target,
  Zap,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { IdeaItem, SolutionAuditResult, SolutionAdvancement, ProjectObjective } from '../../types';
import { auditAndAdvanceSolution } from '../../services/aiService';
import { UiverseGeminiButton } from '../common/UiverseGeminiButton';

interface IdeaLabProps {
  ideas: IdeaItem[];
  onSelectActiveIdea: (idea: IdeaItem) => void;
  onAddGeneratedIdeas: (newIdeas: IdeaItem[]) => void;
  onDeleteIdea: (id: string) => void;
  currentProjectName?: string;
}

export const IdeaLab: React.FC<IdeaLabProps> = ({
  ideas,
  onSelectActiveIdea,
  onAddGeneratedIdeas,
  onDeleteIdea,
  currentProjectName = 'Hackathon Copilot',
}) => {
  // User Input Form State
  const [problemStatement, setProblemStatement] = useState(
    'Hackathon teams build too many unnecessary features in the final hours, leading to broken demos and missed submission deadlines.'
  );
  const [proposedSolution, setProposedSolution] = useState(
    'An autonomous hackathon war room that audits remaining runway, enforces 1-click scope triage, and gives builders a 180-second live stage teleprompter.'
  );
  const [targetUser, setTargetUser] = useState('Hackathon builders and fast-paced developer teams');
  const [projectTitle, setProjectTitle] = useState(currentProjectName);
  
  // Loading & Result States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<SolutionAuditResult | null>(null);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement.trim() || !proposedSolution.trim()) return;

    setIsAuditing(true);
    setAuditError(null);

    try {
      const result = await auditAndAdvanceSolution({
        problemStatement: problemStatement.trim(),
        proposedSolution: proposedSolution.trim(),
        targetUser: targetUser.trim(),
        projectTitle: projectTitle.trim(),
        availableTimeHours: 12,
        teamSkills: 'React, TypeScript, Node.js, Gemini API',
      });
      setAuditResult(result);
    } catch (err: any) {
      setAuditError(err?.message || 'Failed to analyze solution with Gemini. Please try again.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAdoptSolution = () => {
    if (!auditResult) return;

    const adoptedIdea: IdeaItem = {
      id: `idea-${Date.now()}`,
      title: auditResult.projectTitle || projectTitle,
      problem: auditResult.problemStatement || problemStatement,
      targetUser: auditResult.targetUser || targetUser,
      solution: auditResult.proposedSolution || proposedSolution,
      innovationScore: auditResult.innovationScore || 9.0,
      problemFitScore: auditResult.problemFitScore || 9.2,
      feasibilityScore: auditResult.feasibilityScore || 8.8,
      demoPotentialScore: auditResult.demoPotentialScore || 9.5,
      overallScore: auditResult.overallScore || 9.1,
      verdict: auditResult.brutallyHonestVerdict === 'KILL / PIVOT' ? 'KILL' : auditResult.brutallyHonestVerdict === 'ADVANCE & REFINE' ? 'MODIFY' : 'BUILD',
      verdictReason: auditResult.brutallyHonestFeedback,
      whyThisCouldWin: auditResult.whyThisCouldWin,
      whyThisCouldFail: auditResult.whyThisCouldFail,
      advancements: auditResult.advancements,
      tags: ['Audited', 'Gemini Advanced', 'User Problem'],
    };

    onAddGeneratedIdeas([adoptedIdea]);
    onSelectActiveIdea(adoptedIdea);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF] mb-2 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>SOLUTION AUDIT &amp; ADVANCEMENTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            IDEA FORGE
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            Enter your exact problem statement and solution. Gemini will roast flaws, add strategic advancements, and map out your project objectives.
          </p>
        </div>
      </div>

      {/* 1. USER INPUT FORM (Your Problem Statement & Solution) */}
      <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00FF88]" />
            <span className="text-xs font-mono font-bold text-white uppercase">
              Submit Your Concept For AI Judge Audit
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8]">ZERO UNSOLICITED IDEAS</span>
        </div>

        {auditError && (
          <div className="p-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-3 text-xs text-[#FF4D4D]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{auditError}</span>
          </div>
        )}

        <form onSubmit={handleAuditSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 font-bold">
                Project Name
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder="e.g. HALFTIME, CampusShield"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 font-bold">
                Target Persona / Users
              </label>
              <input
                type="text"
                required
                value={targetUser}
                onChange={e => setTargetUser(e.target.value)}
                placeholder="e.g. Hackathon builders, solo founders"
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 font-bold flex items-center justify-between">
              <span>1. What exact problem are you solving? *</span>
              <span className="text-[10px] text-[#00FF88] lowercase">be specific</span>
            </label>
            <textarea
              required
              rows={3}
              value={problemStatement}
              onChange={e => setProblemStatement(e.target.value)}
              placeholder="What is the visceral pain point? Why do existing solutions fail?"
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] transition-colors resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5 font-bold flex items-center justify-between">
              <span>2. What is your proposed solution / product approach? *</span>
              <span className="text-[10px] text-[#00F0FF] lowercase">how it works</span>
            </label>
            <textarea
              required
              rows={3}
              value={proposedSolution}
              onChange={e => setProposedSolution(e.target.value)}
              placeholder="Describe what you plan to build and your unique technical angle."
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none focus:border-[#00FF88] transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <UiverseGeminiButton
              type="submit"
              disabled={isAuditing}
              loading={isAuditing}
              loadingText="AUDITING SOLUTION &amp; ADVANCING WITH GEMINI..."
              icon={<Flame className="w-4 h-4 text-[#00FF88] fill-current" />}
              className="w-full"
            >
              AUDIT SOLUTION &amp; SUPERCHARGE WITH GEMINI →
            </UiverseGeminiButton>
          </div>
        </form>
      </div>

      {/* 2. AUDIT RESULTS: BRUTAL VERDICT, ADVANCEMENTS & OBJECTIVES */}
      {auditResult && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Verdict & Score Card */}
          <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold text-white">{auditResult.projectTitle}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
                    auditResult.brutallyHonestVerdict === 'BUILD AS IS'
                      ? 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40'
                      : auditResult.brutallyHonestVerdict === 'ADVANCE & REFINE'
                      ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40'
                      : 'bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/40'
                  }`}>
                    {auditResult.brutallyHonestVerdict}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">{auditResult.targetUser}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-[#94A3B8] block font-bold">OVERALL SCORE</span>
                  <span className="text-xl font-mono font-black text-[#00FF88]">
                    {auditResult.overallScore.toFixed(1)} <span className="text-xs text-[#94A3B8]">/ 10</span>
                  </span>
                </div>

                <button
                  onClick={handleAdoptSolution}
                  className="px-5 py-3 rounded-2xl bg-[#00FF88] text-[#07090E] font-mono text-xs font-black hover:brightness-110 transition-all cursor-pointer shadow-lg glow-emerald"
                >
                  Adopt &amp; Save
                </button>
              </div>
            </div>

            {/* Brutally Honest Roast */}
            <div className="p-5 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF4D4D] uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Brutally Honest Judge Critique</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {auditResult.brutallyHonestFeedback}
              </p>
            </div>

            {/* Pros & Hazards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-[10px] font-mono text-[#00FF88] font-bold uppercase block">
                  WHY THIS COULD WIN:
                </span>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {auditResult.whyThisCouldWin}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="text-[10px] font-mono text-[#FFB800] font-bold uppercase block">
                  HAZARD THAT COULD RUIN DEMO:
                </span>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {auditResult.whyThisCouldFail}
                </p>
              </div>
            </div>

            {/* Metric Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-[#64748B] block">INNOVATION</span>
                <span className="text-base font-mono font-bold text-white mt-1 block">
                  {auditResult.innovationScore} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-[#64748B] block">PROBLEM FIT</span>
                <span className="text-base font-mono font-bold text-white mt-1 block">
                  {auditResult.problemFitScore} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-[#64748B] block">FEASIBILITY</span>
                <span className="text-base font-mono font-bold text-white mt-1 block">
                  {auditResult.feasibilityScore} / 10
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <span className="text-[10px] font-mono text-[#64748B] block">DEMO PUNCH</span>
                <span className="text-base font-mono font-bold text-[#00FF88] mt-1 block">
                  {auditResult.demoPotentialScore} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Advancements (AI Superchargers) */}
          <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                <span>Strategic Advancements (AI Superchargers)</span>
              </div>
              <span className="text-[10px] font-mono text-[#00F0FF]">Multiplies Winning Odds</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {auditResult.advancements.map((adv, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#00F0FF] font-bold">ADVANCEMENT #{idx + 1}</span>
                    <span className="text-[10px] font-mono text-[#00FF88]">+{adv.estimatedExtraTimeMinutes}m</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{adv.title}</h4>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">{adv.howItImprovesSolution}</p>
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-[#FFB800]">
                    🏆 {adv.impactOnJudging}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential Project Objectives (Milestone Steps) */}
          <div className="rounded-[36px] bg-[#0A0E18] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Layers className="w-4 h-4 text-[#00FF88]" />
                <span>Project Objectives (Sequential Milestone Steps)</span>
              </div>
              <span className="text-[10px] font-mono text-[#00FF88]">No Generic Phases</span>
            </div>

            <div className="space-y-3">
              {auditResult.objectives.map((obj, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#00FF88]">
                        Objective {obj.objectiveNumber || idx + 1}:
                      </span>
                      <h4 className="text-xs font-bold text-white">{obj.title}</h4>
                    </div>
                    <p className="text-xs text-[#94A3B8]">{obj.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full">
                      {obj.estimatedTime || '1h 30m'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
