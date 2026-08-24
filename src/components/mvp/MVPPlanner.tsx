import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Scissors, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Calendar,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { MVPFeature, FeaturePriority, TaskItem } from '../../types';
import { generateMVP, generateRoadmap, RoadmapResult } from '../../services/aiService';
import { UiverseGeminiButton } from '../common/UiverseGeminiButton';

interface MVPPlannerProps {
  features: MVPFeature[];
  onChangeFeaturePriority: (id: string, newPriority: FeaturePriority) => void;
  onAddFeature: (feature: MVPFeature) => void;
  onDeleteFeature?: (id: string) => void;
  onSetAllFeatures?: (features: MVPFeature[]) => void;
  onAddTasksFromRoadmap?: (tasks: TaskItem[]) => void;
  activeIdeaTitle?: string;
  availableHours?: number;
  teamSkills?: string[];
  teamMembers?: string[];
}

export const MVPPlanner: React.FC<MVPPlannerProps> = ({
  features,
  onChangeFeaturePriority,
  onAddFeature,
  onDeleteFeature,
  onSetAllFeatures,
  onAddTasksFromRoadmap,
  activeIdeaTitle = 'HALFTIME (Hackathon Copilot)',
  availableHours = 12,
  teamSkills = [],
  teamMembers = ['Builder', 'Designer', 'Product', 'Growth'],
}) => {
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureHours, setNewFeatureHours] = useState('1.5');
  const [newFeatureCategory, setNewFeatureCategory] = useState<'Core AI' | 'UI / Polish' | 'Infrastructure' | 'Add-on'>('Core AI');
  const [isAdding, setIsAdding] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Roadmap State
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);
  const [roadmapSuccessMsg, setRoadmapSuccessMsg] = useState<string | null>(null);

  const mvpSteps = [
    `Analyzing hackathon constraints & ${availableHours}h runway...`,
    'Isolating core 30-second judge demo loops...',
    'Demoting high-risk scope traps (Auth, Stripe, deep settings)...',
    'Calibrating MUST vs SHOULD feature balance...',
  ];

  const handleSynthesizeMVP = async () => {
    setErrorMessage(null);
    setIsSynthesizing(true);
    setSynthesisStep(0);

    const timer = setInterval(() => {
      setSynthesisStep((prev) => (prev < mvpSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const plan = await generateMVP(activeIdeaTitle, availableHours, {
        teamSkills: teamSkills.join(', '),
      });
      if (plan?.features && plan.features.length > 0 && onSetAllFeatures) {
        onSetAllFeatures(plan.features);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'HALFTIME AI is temporarily unavailable. Please try again.');
    } finally {
      clearInterval(timer);
      setIsSynthesizing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setErrorMessage(null);
    setRoadmapSuccessMsg(null);
    setIsGeneratingRoadmap(true);

    try {
      const res = await generateRoadmap({
        projectTitle: activeIdeaTitle,
        mvpFeatures: features,
        teamMembers,
        availableHours,
      });
      setRoadmapResult(res);
      setIsRoadmapOpen(true);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to generate roadmap with Gemini.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleImportRoadmapToTasks = () => {
    if (!roadmapResult || !onAddTasksFromRoadmap) return;

    const newTasks: TaskItem[] = [];
    const steps = roadmapResult.objectives || roadmapResult.phases || [];

    steps.forEach((step: any, sIdx: number) => {
      const objTitle = step.title || step.phaseName || `Objective ${step.objectiveNumber || sIdx + 1}`;
      (step.tasks || []).forEach((t: any, i: number) => {
        newTasks.push({
          id: `task-roadmap-${Date.now()}-${sIdx}-${i}`,
          title: t.title,
          owner: t.owner,
          role: t.owner.includes('Builder') ? 'Builder' : t.owner.includes('Designer') ? 'Designer' : 'Product',
          priority: t.priority,
          status: 'TODO',
          estimatedTime: `${t.estimatedMinutes}m`,
          estimatedMinutes: t.estimatedMinutes,
          objectiveGroup: objTitle,
        });
      });
    });

    onAddTasksFromRoadmap(newTasks);
    setRoadmapSuccessMsg(`Imported ${newTasks.length} sub-tasks grouped under their Objectives!`);
  };

  const groups: Array<{
    priority: FeaturePriority;
    title: string;
    description: string;
    badgeColor: string;
    borderAccent: string;
  }> = [
    {
      priority: 'MUST_BUILD',
      title: 'MUST BUILD',
      description: 'Without this, there is no demo. 100% essential core loop.',
      badgeColor: 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40',
      borderAccent: 'border-[#00F59B]/30 hover:border-[#00F59B]/60',
    },
    {
      priority: 'SHOULD_BUILD',
      title: 'SHOULD BUILD',
      description: 'Strengthens the pitch. Build if runway permits.',
      badgeColor: 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/40',
      borderAccent: 'border-[#00D2FF]/30 hover:border-[#00D2FF]/60',
    },
    {
      priority: 'NICE_TO_HAVE',
      title: 'NICE TO HAVE',
      description: 'Extra polish. Do not risk submission deadline for this.',
      badgeColor: 'bg-[#FFAA00]/15 text-[#FFAA00] border-[#FFAA00]/40',
      borderAccent: 'border-[#FFAA00]/30 hover:border-[#FFAA00]/60',
    },
    {
      priority: 'CUT',
      title: 'CUT FROM MVP',
      description: 'Safely discarded to protect the core demo experience.',
      badgeColor: 'bg-[#FF2A5F]/15 text-[#FF2A5F] border-[#FF2A5F]/40',
      borderAccent: 'border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60',
    },
  ];

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;

    const newFeat: MVPFeature = {
      id: `custom-feat-${Date.now()}`,
      name: newFeatureName.trim(),
      description: 'Team custom feature added during midpoint planning.',
      estimatedHours: parseFloat(newFeatureHours) || 1.0,
      priority: 'SHOULD_BUILD',
      demoCritical: false,
      category: newFeatureCategory,
    };

    onAddFeature(newFeat);
    setNewFeatureName('');
    setIsAdding(false);
  };

  const totalMustHours = features
    .filter(f => f.priority === 'MUST_BUILD')
    .reduce((acc, f) => acc + f.estimatedHours, 0);

  const totalShouldHours = features
    .filter(f => f.priority === 'SHOULD_BUILD')
    .reduce((acc, f) => acc + f.estimatedHours, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#00D2FF] mb-2.5 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>SCOPE &amp; MVP TRIAGE MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
            SCOPE TRIAGE
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            Differentiate essential core loops from scope traps. Move items between tiers to recalculate runway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <UiverseGeminiButton
            id="btn-generate-roadmap-gemini"
            onClick={handleGenerateRoadmap}
            disabled={isGeneratingRoadmap}
            loading={isGeneratingRoadmap}
            loadingText="GENERATING ROADMAP..."
            icon={<Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />}
          >
            GENERATE OBJECTIVES
          </UiverseGeminiButton>

          <UiverseGeminiButton
            id="btn-recalculate-mvp-gemini"
            onClick={handleSynthesizeMVP}
            disabled={isSynthesizing}
            loading={isSynthesizing}
            loadingText="HALFTIME IS THINKING..."
            icon={<Sparkles className="w-3.5 h-3.5 text-[#00FF88]" />}
          >
            SYNTHESIZE MVP
          </UiverseGeminiButton>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FF2A5F]/10 border border-[#FF2A5F]/30 flex items-center justify-between gap-3 text-xs text-[#FF2A5F] animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleSynthesizeMVP}
            className="px-3 py-1 rounded-lg bg-[#FF2A5F]/20 hover:bg-[#FF2A5F]/30 font-mono text-[11px] font-bold text-[#FF2A5F] transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {isSynthesizing && (
        <div className="p-5 rounded-2xl glass-card border border-[#00D2FF]/40 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#00D2FF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              HALFTIME IS THINKING...
            </span>
            <span className="text-[#64748B]">Step {synthesisStep + 1} of 4</span>
          </div>
          <p className="text-xs text-white font-mono">{mvpSteps[synthesisStep]}</p>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D2FF] to-[#00F59B] transition-all duration-500"
              style={{ width: `${((synthesisStep + 1) / mvpSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Runway Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 sm:p-6 rounded-2xl glass-card">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] font-mono text-[#64748B] uppercase font-bold block">MUST BUILD RUNWAY</span>
          <div className="text-2xl font-mono font-black text-[#00F59B] mt-1">
            {totalMustHours.toFixed(1)}h <span className="text-xs text-[#64748B] font-normal">/ {availableHours}h total</span>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] font-mono text-[#64748B] uppercase font-bold block">SHOULD BUILD LOAD</span>
          <div className="text-2xl font-mono font-black text-[#00D2FF] mt-1">
            {totalShouldHours.toFixed(1)}h
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] font-mono text-[#64748B] uppercase font-bold block">CAPACITY BUFFER</span>
          <div className={`text-2xl font-mono font-black mt-1 ${
            totalMustHours <= availableHours ? 'text-[#00F59B]' : 'text-[#FF2A5F]'
          }`}>
            {(availableHours - totalMustHours).toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Add Custom Feature Button / Form */}
      <div>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#94A3B8] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#00F59B]" />
            <span>ADD CUSTOM FEATURE</span>
          </button>
        ) : (
          <form onSubmit={handleCreateFeature} className="p-4 rounded-2xl glass-panel-elevated border border-[#00F59B]/40 flex flex-wrap items-center gap-3 animate-in fade-in">
            <input
              type="text"
              required
              placeholder="Feature name..."
              value={newFeatureName}
              onChange={e => setNewFeatureName(e.target.value)}
              className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
            />
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Hours (e.g. 1.5)"
              value={newFeatureHours}
              onChange={e => setNewFeatureHours(e.target.value)}
              className="w-24 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
            />
            <select
              value={newFeatureCategory}
              onChange={e => setNewFeatureCategory(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="Core AI">Core AI</option>
              <option value="UI / Polish">UI / Polish</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Add-on">Add-on</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00F59B] text-[#07090E] text-xs font-mono font-black hover:brightness-110 shadow-md glow-emerald cursor-pointer"
            >
              Add Feature
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono text-[#64748B] hover:text-white"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Feature Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {groups.map((group) => {
          const groupFeatures = features.filter((f) => f.priority === group.priority);

          return (
            <div
              key={group.priority}
              className={`p-5 sm:p-6 rounded-[24px] glass-card border ${group.borderAccent} flex flex-col justify-between min-h-[380px] shadow-lg`}
            >
              <div>
                {/* Column Header */}
                <div className="pb-3.5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold border shadow-sm ${group.badgeColor}`}>
                      {group.title}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      {groupFeatures.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-2 leading-snug">
                    {group.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="py-3 space-y-2.5">
                  {groupFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/15 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-white leading-tight">
                          {feat.name}
                        </span>
                        {onDeleteFeature && (
                          <button
                            onClick={() => onDeleteFeature(feat.id)}
                            className="text-[#64748B] hover:text-[#FF2A5F] opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-[#94A3B8] leading-snug">
                        {feat.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1.5 border-t border-white/5">
                        <span>{feat.category}</span>
                        <span className="text-[#00D2FF] font-bold">{feat.estimatedHours}h</span>
                      </div>

                      {/* Move Tier Controls */}
                      <div className="pt-1.5 flex flex-wrap gap-1">
                        {groups.map((targetGroup) => {
                          if (targetGroup.priority === feat.priority) return null;
                          return (
                            <button
                              key={targetGroup.priority}
                              onClick={() => onChangeFeaturePriority(feat.id, targetGroup.priority)}
                              className="px-2 py-0.5 rounded-lg text-[9px] font-mono bg-white/[0.04] hover:bg-white/10 text-[#94A3B8] hover:text-white transition-all"
                              title={`Move to ${targetGroup.title}`}
                            >
                              → {targetGroup.priority === 'MUST_BUILD' ? 'MUST' : targetGroup.priority === 'SHOULD_BUILD' ? 'SHOULD' : targetGroup.priority === 'NICE_TO_HAVE' ? 'NICE' : 'CUT'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {groupFeatures.length === 0 && (
                    <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-[#64748B]">
                      No items in this tier
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Build Roadmap Modal */}
      {isRoadmapOpen && roadmapResult && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRoadmapOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">PROJECT OBJECTIVES &amp; MILESTONE STEPS</h2>
                <p className="text-xs text-[#64748B]">Sequential execution steps assigned to your battle crew</p>
              </div>
            </div>

            {roadmapSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#00F59B]/15 border border-[#00F59B]/30 text-xs font-mono text-[#00F59B] animate-in fade-in">
                {roadmapSuccessMsg}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {(roadmapResult.objectives || roadmapResult.phases).map((step: any, pIdx: number) => {
                const title = step.title || step.phaseName || `Objective ${pIdx + 1}`;
                const time = step.estimatedTime || '2h';
                const tasks = step.tasks || [];

                return (
                  <div key={pIdx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#00FF88]">
                          Objective {step.objectiveNumber || pIdx + 1}:
                        </span>
                        <span className="text-xs font-bold text-white">
                          {title.replace(/^Objective \d+:?\s*/i, '')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full">
                        {time}
                      </span>
                    </div>

                    {step.description && (
                      <p className="text-[11px] text-[#94A3B8]">{step.description}</p>
                    )}

                    <div className="space-y-2">
                      {tasks.map((t: any, tIdx: number) => (
                        <div key={tIdx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] text-xs">
                          <div>
                            <div className="text-white font-semibold">{t.title}</div>
                            <div className="text-[10px] font-mono text-[#64748B]">
                              Assignee: <span className="text-[#94A3B8]">{t.owner}</span> • Deps: {t.dependencies}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              t.priority === 'CRITICAL' ? 'bg-[#FF2A5F]/20 text-[#FF2A5F]' : 'bg-[#FFAA00]/20 text-[#FFAA00]'
                            }`}>
                              {t.priority}
                            </span>
                            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">{t.estimatedMinutes}m</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setIsRoadmapOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs font-mono text-[#94A3B8] hover:text-white"
              >
                Close
              </button>
              {onAddTasksFromRoadmap && (
                <button
                  onClick={handleImportRoadmapToTasks}
                  className="px-5 py-2.5 rounded-xl bg-[#00F59B] text-[#07090E] text-xs font-black font-mono hover:brightness-110 shadow-lg glow-emerald flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>IMPORT ALL TO TASK BOARD</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
