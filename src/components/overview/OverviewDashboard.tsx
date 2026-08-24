import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Play, 
  Pause,
  Sparkles, 
  ArrowRight, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Rocket, 
  Scale, 
  ShieldAlert, 
  Check, 
  X, 
  Flame, 
  Clock, 
  Target, 
  Award, 
  Zap,
  Mic,
  MessageSquare,
  Edit2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectHealth, ScopeCutItem, ActivityTimelineItem, NavigationTab } from '../../types';

interface OverviewDashboardProps {
  health: ProjectHealth;
  scopeItems: ScopeCutItem[];
  activityLogs: ActivityTimelineItem[];
  scopeCutApplied: boolean;
  onExecuteScopeCut: () => void;
  onResetScopeCut?: () => void;
  onToggleScopeSelect: (id: string) => void;
  onRecalculatePlan: () => void;
  onOpenReasoning: () => void;
  onStartNextTask: () => void;
  isTaskActive: boolean;
  taskActiveSeconds: number;
  projectName?: string;
  hackathonName?: string;
  teamName?: string;
  teamMembers?: string[];
  onAddTeamMember?: (name: string) => void;
  onRenameTeamMember?: (oldName: string, newName: string) => void;
  onDeleteTeamMember?: (name: string) => void;
  countdownDisplay?: string;
  countdownStatus?: 'NORMAL' | 'AT RISK' | 'CRITICAL';
  isTimerPaused?: boolean;
  onToggleTimer?: () => void;
  onExtendTimer?: (extraMinutes: number) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onOpenShipMode?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  health,
  scopeItems,
  activityLogs,
  scopeCutApplied,
  onExecuteScopeCut,
  onResetScopeCut,
  onToggleScopeSelect,
  onRecalculatePlan,
  onOpenReasoning,
  onStartNextTask,
  isTaskActive,
  taskActiveSeconds,
  projectName = 'Hackathon Copilot',
  hackathonName = 'DoraHacks 2.0',
  teamName = 'Squad',
  teamMembers = ['Teammate 1', 'Teammate 2', 'Teammate 3', 'Teammate 4'],
  onAddTeamMember,
  onRenameTeamMember,
  onDeleteTeamMember,
  countdownDisplay = '11h 00m 00s',
  countdownStatus = 'AT RISK',
  isTimerPaused = false,
  onToggleTimer,
  onExtendTimer,
  onNavigateTab,
  onOpenShipMode,
}) => {
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);
  const [editingMemberName, setEditingMemberName] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'cut' | 'keep'>('all');

  const handleSaveMemberEdit = (oldName: string) => {
    if (editingMemberIdx === null) return;
    const newName = editingMemberName.trim() || `Teammate ${editingMemberIdx + 1}`;
    if (onRenameTeamMember && oldName !== newName) {
      onRenameTeamMember(oldName, newName);
    }
    setEditingMemberIdx(null);
  };

  // Selected recoverable minutes for items currently checked and not cut
  const selectedItems = scopeItems.filter((item) => item.selectedForCut && !item.isCut);
  const selectedMinutes = selectedItems.reduce((acc, curr) => acc + curr.timeMinutes, 0);

  const formatMins = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const selectedFormatted = selectedMinutes > 0 ? formatMins(selectedMinutes) : '0m';

  const handleCutClick = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00FF88', '#00F0FF', '#FF4D4D', '#FFB800', '#FFFFFF'],
      });
    } catch (e) {}
    onExecuteScopeCut();
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !onAddTeamMember) return;
    onAddTeamMember(newMemberName.trim());
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const formatActiveTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. THE WAR ROOM HERO (Massive Live Countdown & Blunt AI Coach)            */}
      {/* ========================================================================= */}
      <div className="relative rounded-[36px] bg-gradient-to-b from-[#0D121F] via-[#080B12] to-[#04060A] p-6 sm:p-12 overflow-hidden border border-white/10 shadow-[0_0_80px_-20px_rgba(0,255,136,0.15)] text-center">
        {/* Dynamic Glowing Aurora */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          scopeCutApplied ? 'bg-[#00FF88]/15' : 'bg-[#FF4D4D]/15'
        }`} />

        {/* Minimalist Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#00F0FF] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="font-bold">{hackathonName}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white shadow-sm">
            <span>🚀</span>
            <span className="font-bold">{projectName}</span>
          </div>

          {/* Collapsible Battle Crew Badge */}
          <button
            onClick={() => setIsTeamExpanded(!isTeamExpanded)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-mono text-white transition-all cursor-pointer shadow-sm group"
          >
            <Users className="w-3.5 h-3.5 text-[#00FF88]" />
            <span className="font-bold">{teamName} ({teamMembers.length} on deck)</span>
            {isTeamExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white" />
            )}
          </button>
        </div>

        {/* Collapsible Battle Crew Roster */}
        {isTeamExpanded && (
          <div className="mb-8 p-5 rounded-3xl bg-black/60 border border-white/10 max-w-xl mx-auto space-y-4 animate-in zoom-in-95 duration-200 relative z-10 text-left backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-[#94A3B8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
                Team War Room Roster
              </span>
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="text-xs font-mono text-[#00FF88] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {teamMembers.map((member, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00FF88] to-[#00F0FF] text-[#07090E] font-black text-xs flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </div>
                    {editingMemberIdx === idx ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingMemberName}
                        onChange={e => setEditingMemberName(e.target.value)}
                        onBlur={() => handleSaveMemberEdit(member)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveMemberEdit(member);
                          if (e.key === 'Escape') setEditingMemberIdx(null);
                        }}
                        className="flex-1 px-2 py-1 rounded-lg bg-black border border-[#00FF88] text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <span 
                        onClick={() => {
                          setEditingMemberIdx(idx);
                          setEditingMemberName(member);
                        }}
                        className="font-medium truncate cursor-pointer hover:text-[#00FF88] transition-colors"
                        title="Click to rename teammate"
                      >
                        {member}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {editingMemberIdx === idx ? (
                      <button
                        onClick={() => handleSaveMemberEdit(member)}
                        className="p-1 text-[#00FF88] hover:brightness-125"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingMemberIdx(idx);
                          setEditingMemberName(member);
                        }}
                        className="p-1 text-[#94A3B8] hover:text-white"
                        title="Rename teammate"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}

                    {onDeleteTeamMember && teamMembers.length > 1 && (
                      <button
                        onClick={() => onDeleteTeamMember(member)}
                        className="p-1 text-[#64748B] hover:text-[#FF4D4D]"
                        title="Remove teammate"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAddingMember && (
              <form onSubmit={handleAddMemberSubmit} className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={`e.g. Teammate ${teamMembers.length + 1}...`}
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00FF88] text-[#07090E] text-xs font-black font-mono hover:brightness-110 cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="p-1.5 text-[#64748B] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

          {/* Centerpiece: THE GIANT COUNTDOWN */}
        <div className="relative z-10 py-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className="text-xs font-mono font-black tracking-[0.35em] uppercase text-[#94A3B8]">
              SUBMISSION COUNTDOWN
            </p>
            {isTimerPaused && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFAA00]/20 border border-[#FFAA00]/40 text-[10px] font-mono text-[#FFAA00] font-bold animate-pulse">
                PAUSED
              </span>
            )}
          </div>

          <div className="inline-block relative">
            <h1 className={`text-6xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.25)] ${isTimerPaused ? 'opacity-80' : ''}`}>
              {countdownDisplay}
            </h1>
          </div>

          {/* Interactive Timer Controls: Pause/Resume & Extend Runway */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            {/* Pause / Resume Toggle */}
            {onToggleTimer && (
              <button
                onClick={onToggleTimer}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold border transition-all cursor-pointer shadow-md ${
                  isTimerPaused
                    ? 'bg-[#00FF88] text-[#07090E] border-[#00FF88] hover:brightness-110'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white border-white/10'
                }`}
                title={isTimerPaused ? 'Resume countdown' : 'Pause hackathon timer'}
              >
                {isTimerPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-[#07090E]" />
                    <span>RESUME TIMER</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#FFAA00]" />
                    <span>PAUSE TIMER</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Runway Extension Chips */}
            {onExtendTimer && (
              <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-mono text-[#94A3B8] px-2 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00F0FF]" />
                  <span>Extend:</span>
                </span>
                {[
                  { label: '+30m', mins: 30 },
                  { label: '+1h', mins: 60 },
                  { label: '+2h', mins: 120 },
                  { label: '+4h', mins: 240 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => onExtendTimer(chip.mins)}
                    className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white/[0.05] hover:bg-[#00F0FF]/20 hover:text-[#00F0FF] text-white border border-white/10 hover:border-[#00F0FF]/30 transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blunt AI Coach Status Badge */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <div className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-mono font-black border shadow-xl transition-all ${
              scopeCutApplied
                ? 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40 shadow-[0_0_25px_rgba(0,255,136,0.3)]'
                : 'bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/40 shadow-[0_0_25px_rgba(255,77,77,0.3)]'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                scopeCutApplied ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FF4D4D] animate-pulse'
              }`} />
              <span>{scopeCutApplied ? 'WAR ROOM STATUS: RUNWAY SECURED (+45m Buffer)' : 'WAR ROOM STATUS: 3 HOURS DEFICIT — CUT SCOPE'}</span>
            </div>

            {onOpenShipMode && (
              <button
                onClick={onOpenShipMode}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#00FF88] to-[#00F0FF] text-[#07090E] font-mono text-xs font-black hover:brightness-110 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>SHIP PREVIEW →</span>
              </button>
            )}
          </div>

          {/* Blunt AI Coach Commentary */}
          <div className="max-w-xl mx-auto mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {scopeCutApplied ? (
                <span>
                  🔥 <strong className="text-[#00FF88]">Tactical win:</strong> You dumped 3h 45m of dead weight. Your team is now locked into building the <strong>Core AI Demo</strong> and practicing the <strong>3-minute pitch</strong>.
                </span>
              ) : (
                <span>
                  ⚠️ <strong className="text-[#FF4D4D]">Reality check:</strong> Your team is trying to build 14 hours of work in 11 hours. If you don't cut the extra features below right now, you will submit a broken, half-baked demo.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 3 CORE BATTLE WEAPONS (Clean, Tactile, No Jargon)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        
        {/* WEAPON 1: THE EMERGENCY SCOPE CUTTER */}
        <div className="rounded-[30px] bg-[#0A0E18] border border-white/10 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden hover:border-[#FF4D4D]/50 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 flex items-center justify-center text-[#FF4D4D]">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scope Guillotine</h3>
                  <span className="text-[10px] font-mono text-[#FF4D4D] font-bold">1-Click Time Recovery</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-[#FF4D4D] bg-[#FF4D4D]/10 px-2.5 py-1 rounded-full border border-[#FF4D4D]/20">
                {scopeCutApplied ? '3h 45m Cut' : `+${selectedFormatted}`}
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              {scopeCutApplied 
                ? 'Dead-weight features were sliced. You gained 3h 45m of free runway.' 
                : 'Check features to kill so your core demo works flawlessly:'}
            </p>

            <div className="space-y-2 mb-4">
              {scopeItems.slice(0, 3).map((item) => {
                const isCut = item.isCut || scopeCutApplied;
                const isChecked = item.selectedForCut && !isCut;

                return (
                  <div
                    key={item.id}
                    onClick={() => !scopeCutApplied && onToggleScopeSelect(item.id)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all select-none ${
                      isCut 
                        ? 'border-transparent bg-white/[0.02] opacity-40 line-through cursor-default' 
                        : isChecked
                        ? 'border-[#FF4D4D]/50 bg-[#FF4D4D]/10 text-white cursor-pointer'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 text-[#94A3B8] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isCut ? 'bg-black/50 border-white/20' : isChecked ? 'bg-[#FF4D4D] border-[#FF4D4D]' : 'border-white/20'
                      }`}>
                        {isCut ? <Check className="w-3 h-3 text-[#00FF88]" /> : isChecked ? <div className="w-1.5 h-0.5 bg-white" /> : null}
                      </div>
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#FF4D4D] font-bold shrink-0 ml-2">
                      {item.timeFormatted}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            {scopeCutApplied && onResetScopeCut && (
              <button
                onClick={onResetScopeCut}
                className="text-[10px] font-mono text-[#94A3B8] hover:text-white px-2 py-1"
              >
                Reset
              </button>
            )}

            <button
              onClick={handleCutClick}
              disabled={scopeCutApplied || selectedItems.length === 0}
              className={`w-full py-3 rounded-xl font-mono text-xs font-black transition-all cursor-pointer shadow-lg ${
                scopeCutApplied
                  ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 cursor-default'
                  : selectedItems.length === 0
                  ? 'bg-white/5 text-[#64748B] border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF4D4D] to-[#FF8A00] text-[#07090E] hover:brightness-110 shadow-[0_0_20px_rgba(255,77,77,0.3)]'
              }`}
            >
              {scopeCutApplied ? '✓ 3h 45m RECOVERED' : `SLICE SELECTED (${selectedFormatted})`}
            </button>
          </div>
        </div>

        {/* WEAPON 2: SPRINT FOCUS COCKPIT */}
        <div className="rounded-[30px] bg-[#0A0E18] border border-white/10 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden hover:border-[#00FF88]/50 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/30 flex items-center justify-center text-[#00FF88]">
                  <Play className="w-4 h-4 fill-[#00FF88]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sprint Focus</h3>
                  <span className="text-[10px] font-mono text-[#00FF88] font-bold">What To Build Right Now</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00FF88]/20 text-[#00FF88]">
                {isTaskActive ? 'IN PROGRESS' : 'QUEUED'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 mb-4">
              <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider font-bold">PRIORITY #1</span>
              <h4 className="text-base font-bold text-white leading-snug">
                Core AI Live Demo Flow
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Connect the Gemini 2.5 Flash API endpoint directly to the UI. Ensure zero 500 error crashes on stage.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-[#64748B]">
                <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>1h 20m allocated • Alex (Lead)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <button
              onClick={onStartNextTask}
              className={`w-full py-3.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                isTaskActive 
                  ? 'bg-[#00FF88] text-[#07090E] shadow-[0_0_20px_rgba(0,255,136,0.35)]' 
                  : 'border border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88] hover:text-[#07090E]'
              }`}
            >
              {isTaskActive ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>STOPWATCH RUNNING ({formatActiveTimer(taskActiveSeconds)})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START FOCUS TIMER →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* WEAPON 3: SHARK TANK JUDGE ARENA */}
        <div className="rounded-[30px] bg-[#0A0E18] border border-white/10 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden hover:border-[#00F0FF]/50 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Shark Tank Simulator</h3>
                  <span className="text-[10px] font-mono text-[#00F0FF] font-bold">Judge Score Prediction</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-[#00FF88] bg-[#00FF88]/10 px-2.5 py-1 rounded-full border border-[#00FF88]/20">
                {scopeCutApplied ? '9.2 / 10' : '8.5 / 10'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-black text-white">
                  {scopeCutApplied ? '9.20' : '8.55'} <span className="text-xs text-[#64748B]">/ 10</span>
                </span>
                <span className="text-[10px] font-mono text-[#00FF88] font-bold uppercase bg-[#00FF88]/10 px-2 py-0.5 rounded">
                  Top 3% Hackathon Tier
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                &ldquo;Judges will love the live demo hook. Be prepared for the VC question: <strong className="text-white">Why won't OpenAI build this next month?</strong>&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex gap-2">
            {onNavigateTab ? (
              <button
                onClick={() => onNavigateTab('judge-mode')}
                className="w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>OPEN JUDGE ARENA →</span>
              </button>
            ) : (
              <button
                onClick={onOpenReasoning}
                className="w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>READ JUDGE CRITIQUE</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WAR ROOM LIVE BATTLE TIMELINE                                         */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-[30px] bg-[#0A0E18] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
            <span>Live War Room Feed</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">Real-Time Sprint Activity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activityLogs.slice(0, 3).map((log) => (
            <div 
              key={log.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                <span className="text-[#00FF88] font-bold">• {log.type.toUpperCase()}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="font-medium text-white line-clamp-1">{log.title}</p>
              <p className="text-[11px] text-[#94A3B8] line-clamp-2">{log.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
