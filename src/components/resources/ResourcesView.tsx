import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Server, 
  Database, 
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { AIResourceItem, UserResourceItem } from '../../types';
import { recommendTool, ToolRecommendationResult } from '../../services/aiService';

interface ResourcesViewProps {
  resources: AIResourceItem[];
  onAddResource?: (item: AIResourceItem) => void;
  onUpdateResourceUsage?: (id: string, newUsage: number) => void;
  onDeleteResource?: (id: string) => void;
  teamSkills?: string[];
  currentStack?: string;
  availableHours?: number;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onAddResource,
  onUpdateResourceUsage,
  onDeleteResource,
  teamSkills = ['React', 'TypeScript', 'Node.js', 'Tailwind'],
  currentStack = 'Vite, React, Express, Supabase, Gemini 2.5 Flash',
  availableHours = 12,
}) => {
  // Add Resource Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [toolName, setToolName] = useState('');
  const [provider, setProvider] = useState('');
  const [resourceType, setResourceType] = useState('API Requests');
  const [budgetLimit, setBudgetLimit] = useState('1000');
  const [currentUsage, setCurrentUsage] = useState('0');
  const [unit, setUnit] = useState('requests');
  const [resetDate, setResetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Tool Recommender State
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const [taskQuery, setTaskQuery] = useState('');
  const [timeAvailable, setTimeAvailable] = useState(availableHours.toString());
  const [budgetConstraint, setBudgetConstraint] = useState('Free tier / standard hackathon credits');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<ToolRecommendationResult | null>(null);
  const [recommenderError, setRecommenderError] = useState<string | null>(null);

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !onAddResource) return;

    const limit = parseFloat(budgetLimit) || 100;
    const usage = parseFloat(currentUsage) || 0;
    const remaining = Math.max(0, limit - usage);
    const percent = Math.min(100, Math.max(0, Math.round((remaining / limit) * 100)));

    const newRes: AIResourceItem = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      tool: toolName.trim(),
      provider: provider.trim() || 'Third-Party Provider',
      resourceType,
      budgetLimit: limit,
      currentUsage: usage,
      unit,
      remainingPercent: percent,
      creditsLabel: `${(limit - usage).toFixed(0)} / ${limit} ${unit} remaining`,
      recommendedUse: notes.trim() || 'Tracked user resource quota for hackathon build.',
      burnRate: percent < 30 ? 'High' : percent < 70 ? 'Medium' : 'Low',
      statusNote: `User-entered quota. Reset date: ${resetDate || 'None specified'}.`,
      resetDate,
      notes,
      isUserEntered: true,
    };

    onAddResource(newRes);
    setToolName('');
    setProvider('');
    setBudgetLimit('1000');
    setCurrentUsage('0');
    setNotes('');
    setIsAdding(false);
  };

  const handleRecommendTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskQuery.trim()) return;

    setRecommenderError(null);
    setIsRecommending(true);

    try {
      const res = await recommendTool({
        task: taskQuery,
        timeAvailableHours: parseFloat(timeAvailable) || 6,
        teamSkills: teamSkills.join(', '),
        existingStack: currentStack,
        budgetConstraint,
      });
      setRecommendationResult(res);
    } catch (err: any) {
      setRecommenderError(err?.message || 'Failed to get tool recommendation with Gemini.');
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8B5CF6] mb-2.5 shadow-sm">
            <Cpu className="w-3.5 h-3.5" />
            <span>COMPUTE &amp; TOKEN TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
            AI RESOURCE MANAGER
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            Track user-entered API quotas, token budgets, and prevent exhaustion during live judge demos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsRecommenderOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#00D2FF]/40 text-xs font-mono text-[#00D2FF] transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RECOMMEND A TOOL</span>
          </button>

          {onAddResource && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F59B] to-[#00D2FF] text-[#07090E] font-mono text-xs font-black hover:brightness-110 shadow-lg glow-emerald active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD RESOURCE</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Resource Form */}
      {isAdding && (
        <form onSubmit={handleCreateResource} className="p-6 rounded-2xl glass-panel-elevated border border-[#00F59B]/40 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-mono font-bold text-[#00F59B] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              ADD NEW USER-ENTERED RESOURCE
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#64748B] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Tool / Service Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Gemini 2.5 Flash, Supabase"
                value={toolName}
                onChange={e => setToolName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Provider / Vendor</label>
              <input
                type="text"
                placeholder="e.g. Google Cloud, Supabase"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Total Budget / Limit *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 500"
                value={budgetLimit}
                onChange={e => setBudgetLimit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Current Usage</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={currentUsage}
                onChange={e => setCurrentUsage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Unit</label>
              <input
                type="text"
                placeholder="e.g. requests, tokens, USD"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Quota Reset Date</label>
              <input
                type="date"
                value={resetDate}
                onChange={e => setResetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase mb-1">Notes / Recommended Usage</label>
              <input
                type="text"
                placeholder="e.g. Reserve for demo synthesis and pitch rehearsal"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-xs font-mono text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00F59B] text-[#07090E] text-xs font-black font-mono hover:brightness-110 shadow-md glow-emerald cursor-pointer"
            >
              Save Resource
            </button>
          </div>
        </form>
      )}

      {/* Advisory Banner */}
      <div className="p-6 sm:p-7 rounded-[28px] glass-card space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D2FF] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>RESOURCE ALLOCATION ADVISORY</span>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8] bg-white/[0.04] px-3 py-1 rounded-full border border-white/10">
            USER ENTERED TELEMETRY
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          Track all LLM, database, and vector endpoints you plan to use in your demo. Keeping reserve quota prevents runtime 429 rate limit failures in front of judges.
        </p>
      </div>

      {/* Detailed Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {resources.map((res) => {
          const isWarning = res.remainingPercent < 50;

          return (
            <div
              key={res.id}
              className={`p-6 rounded-[24px] glass-card flex flex-col justify-between shadow-lg ${
                isWarning ? 'border-[#FFAA00]/40' : 'border-white/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {res.tool}
                      </h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#94A3B8] border border-white/10">
                        USER ENTERED
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {res.provider}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border shadow-sm ${
                      isWarning 
                        ? 'bg-[#FFAA00]/15 text-[#FFAA00] border-[#FFAA00]/40' 
                        : 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40'
                    }`}>
                      {res.remainingPercent}%
                    </span>

                    {onDeleteResource && (
                      <button
                        onClick={() => onDeleteResource(res.id)}
                        className="text-[#64748B] hover:text-[#FF2A5F] p-1 rounded-lg hover:bg-white/5 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all duration-700 ${
                        isWarning ? 'bg-[#FFAA00] shadow-[0_0_8px_#FFAA00]' : 'bg-[#00F59B] shadow-[0_0_8px_#00F59B]'
                      }`}
                      style={{ width: `${res.remainingPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-2">
                    <span>{res.creditsLabel}</span>
                    <span>Burn: {res.burnRate}</span>
                  </div>
                </div>

                {/* Recommended Use */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <span className="text-[10px] font-mono text-[#00D2FF] font-bold block">
                    RECOMMENDED ALLOCATION:
                  </span>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    {res.recommendedUse}
                  </p>
                </div>

                <div className="text-[11px] text-[#64748B] italic">
                  &ldquo;{res.statusNote}&rdquo;
                </div>
              </div>

              {/* Usage update control */}
              {onUpdateResourceUsage && res.budgetLimit && (
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#64748B]">Used: {res.currentUsage || 0}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateResourceUsage(res.id, (res.currentUsage || 0) + 10)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[#00D2FF] border border-white/10 cursor-pointer"
                    >
                      +10 Used
                    </button>
                    <button
                      onClick={() => onUpdateResourceUsage(res.id, (res.currentUsage || 0) + 50)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[#00D2FF] border border-white/10 cursor-pointer"
                    >
                      +50 Used
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tool Recommender Modal */}
      {isRecommenderOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRecommenderOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">RECOMMEND A STACK TOOL</h2>
                <p className="text-xs text-[#64748B]">AI analysis calibrated against your hackathon deadline and stack</p>
              </div>
            </div>

            {recommenderError && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FF2A5F]/15 border border-[#FF2A5F]/30 text-xs text-[#FF2A5F] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{recommenderError}</span>
              </div>
            )}

            <form onSubmit={handleRecommendTool} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1">
                  Task to Implement *
                </label>
                <input
                  type="text"
                  required
                  value={taskQuery}
                  onChange={e => setTaskQuery(e.target.value)}
                  placeholder="e.g. Fast text-to-speech audio for real-time demo bot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1">
                    Time Available (Hours)
                  </label>
                  <input
                    type="number"
                    value={timeAvailable}
                    onChange={e => setTimeAvailable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1">
                    Budget / Constraints
                  </label>
                  <input
                    type="text"
                    value={budgetConstraint}
                    onChange={e => setBudgetConstraint(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00F59B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRecommending}
                className="w-full py-3 px-4 rounded-xl bg-[#00F59B] hover:bg-[#20ffac] text-[#07090E] font-black font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 glow-emerald"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isRecommending ? 'animate-spin' : ''}`} />
                <span>{isRecommending ? 'ANALYZING OPTIONS...' : 'RECOMMEND BEST TOOL WITH GEMINI'}</span>
              </button>
            </form>

            {recommendationResult && (
              <div className="p-5 rounded-2xl bg-black/40 border border-[#00F59B]/30 space-y-3.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#00D2FF] font-bold">RECOMMENDED TOOL:</span>
                  <span className="px-3 py-0.5 rounded-full bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/40 font-black font-mono">
                    {recommendationResult.recommendedTool}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#64748B] font-bold block mb-1">WHY:</span>
                  <p className="text-white">{recommendationResult.why}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-[#64748B] font-bold block">SETUP TIME &amp; COST:</span>
                    <p className="text-[#94A3B8] mt-0.5">{recommendationResult.setupCost}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#00F59B] font-bold block">ESTIMATED TIME SAVED:</span>
                    <p className="text-white mt-0.5">{recommendationResult.estimatedTimeSaved}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-[10px] font-mono text-[#FFAA00] font-bold block">ALTERNATIVE:</span>
                  <p className="text-[#94A3B8] mt-0.5">{recommendationResult.alternative}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
