import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  Flame, 
  AlertCircle, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Trash2, 
  Users, 
  X, 
  Edit2,
  Layers,
  LayoutGrid,
  ListOrdered,
  Check
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus } from '../../types';

interface TaskBoardProps {
  tasks: TaskItem[];
  teamMembers?: string[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTeamMember?: (memberName: string) => void;
  activeTaskId?: string;
  onSetActiveTask: (taskId: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  teamMembers = ['Teammate 1', 'Teammate 2', 'Teammate 3', 'Teammate 4'],
  onUpdateTaskStatus,
  onAddTask,
  onDeleteTask,
  onAddTeamMember,
  activeTaskId,
  onSetActiveTask,
}) => {
  const [viewMode, setViewMode] = useState<'objectives' | 'columns'>('objectives');
  const [filterOwner, setFilterOwner] = useState<string>('ALL');
  
  // Adding Sub-task State
  const [addingToObjective, setAddingToObjective] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskOwner, setNewSubtaskOwner] = useState(teamMembers[0] || 'Teammate 1');
  const [newSubtaskMins, setNewSubtaskMins] = useState('30');
  
  // Add Member State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Default clean objective categories
  const defaultObjectives = [
    {
      id: 'Objective 1: Core AI & Logic Setup',
      title: 'Objective 1: Core AI & Logic Setup',
      description: 'Connect AI endpoints, configure prompts, and verify core output schemas.',
      accent: 'border-[#00F0FF]/30 text-[#00F0FF]',
    },
    {
      id: 'Objective 2: User Interface & Main Flow',
      title: 'Objective 2: User Interface & Main Flow',
      description: 'Build high-contrast UI, interactive sliders, and 1-click recovery actions.',
      accent: 'border-[#00FF88]/30 text-[#00FF88]',
    },
    {
      id: 'Objective 3: Demo Safety & Stage Pitch Polish',
      title: 'Objective 3: Demo Safety & Stage Pitch Polish',
      description: 'Rehearse 180s live stage presentation and record 60s backup video demo.',
      accent: 'border-[#FFB800]/30 text-[#FFB800]',
    },
  ];

  const handleCreateSubtask = (objectiveGroup: string) => {
    if (!newSubtaskTitle.trim()) return;

    const mins = parseInt(newSubtaskMins, 10) || 30;
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newSubtaskTitle.trim(),
      owner: newSubtaskOwner,
      role: newSubtaskOwner.includes('Designer') ? 'Designer' : newSubtaskOwner.includes('Product') ? 'Product' : 'Builder',
      priority: 'HIGH',
      status: 'TODO',
      estimatedTime: `${mins}m`,
      estimatedMinutes: mins,
      objectiveGroup: objectiveGroup,
    };

    onAddTask(newTask);
    setNewSubtaskTitle('');
    setAddingToObjective(null);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !onAddTeamMember) return;
    onAddTeamMember(newMemberName.trim());
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterOwner === 'ALL') return true;
    return t.owner.toLowerCase().includes(filterOwner.toLowerCase());
  });

  // Calculate distinct objectives from tasks + defaults
  const objectiveGroups = Array.from(
    new Set([
      ...defaultObjectives.map(o => o.id),
      ...tasks.map(t => t.objectiveGroup || 'Objective 1: Core AI & Logic Setup'),
    ])
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 text-xs font-mono text-[#00FF88] mb-2 font-bold">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>SPRINT EXECUTION BOARD</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
            BATTLE BOARD
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] mt-1 font-medium">
            3 simple project objectives with grouped sub-tasks. Check off items as your crew builds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setViewMode('objectives')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'objectives'
                  ? 'bg-[#00FF88] text-[#07090E] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Grouped Objectives</span>
            </button>
            <button
              onClick={() => setViewMode('columns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'columns'
                  ? 'bg-[#00FF88] text-[#07090E] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Columns</span>
            </button>
          </div>

          {onAddTeamMember && (
            <button
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#94A3B8] hover:text-white transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Crew ({teamMembers.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Member Drawer */}
      {isAddingMember && (
        <form onSubmit={handleCreateMember} className="p-4 rounded-3xl bg-black/60 border border-white/15 flex items-center gap-3 animate-in fade-in">
          <input
            type="text"
            required
            placeholder="e.g. Maya (Backend Engineer)..."
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-[#00FF88]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-[#00FF88] text-[#07090E] text-xs font-mono font-bold hover:brightness-110 cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingMember(false)}
            className="p-2 text-[#64748B] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-[#64748B]">Filter Assignee:</span>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00FF88]"
          >
            <option value="ALL">All Crew ({tasks.length})</option>
            {teamMembers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-[#94A3B8]">
          <span className="text-[#00FF88] font-bold">
            {tasks.filter(t => t.status === 'DONE').length}
          </span> / {tasks.length} sub-tasks completed
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GROUPED OBJECTIVES VIEW (Clean, Human, No Overwhelm)                   */}
      {/* ========================================================================= */}
      {viewMode === 'objectives' ? (
        <div className="space-y-6">
          {objectiveGroups.map((groupName, objIdx) => {
            const groupTasks = filteredTasks.filter(
              t => (t.objectiveGroup || 'Objective 1: Core AI & Logic Setup') === groupName
            );
            const completedInGroup = groupTasks.filter(t => t.status === 'DONE').length;
            const progressPercent = groupTasks.length > 0 
              ? Math.round((completedInGroup / groupTasks.length) * 100) 
              : 0;

            const isAllDone = groupTasks.length > 0 && completedInGroup === groupTasks.length;

            return (
              <div
                key={groupName}
                className="rounded-[32px] bg-[#0A0E18] border border-white/10 p-6 sm:p-7 space-y-5 shadow-xl transition-all"
              >
                {/* Objective Header & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isAllDone ? 'bg-[#00FF88]' : 'bg-[#00F0FF] animate-pulse'}`} />
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {groupName}
                      </h3>
                      {isAllDone && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/30 text-[10px] font-mono text-[#00FF88] font-bold">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      {defaultObjectives[objIdx]?.description || 'High-leverage milestone execution step.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden shrink-0">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00FF88] to-[#00F0FF] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      {completedInGroup}/{groupTasks.length} ({progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Sub-tasks Checklist */}
                <div className="space-y-2.5">
                  {groupTasks.map((t) => {
                    const isDone = t.status === 'DONE';
                    const isInProgress = t.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                          isDone 
                            ? 'bg-white/[0.01] border-white/5 opacity-70' 
                            : isInProgress
                            ? 'bg-gradient-to-r from-[#00FF88]/10 via-[#00F0FF]/5 to-transparent border-[#00FF88]/40 shadow-sm'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox */}
                          <button
                            onClick={() => onUpdateTaskStatus(t.id, isDone ? 'TODO' : 'DONE')}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              isDone 
                                ? 'bg-[#00FF88] border-[#00FF88] text-[#07090E]' 
                                : 'border-white/30 hover:border-[#00FF88]'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm font-medium truncate ${
                              isDone ? 'line-through text-[#64748B]' : 'text-white'
                            }`}>
                              {t.title.replace(/^\[.*?\]\s*/, '')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {/* Owner badge */}
                          <span className="text-[11px] font-mono text-[#94A3B8] bg-white/[0.04] px-2.5 py-1 rounded-xl hidden sm:inline-block">
                            👤 {t.owner}
                          </span>

                          {/* Time */}
                          <span className="text-[11px] font-mono text-[#64748B]">
                            {t.estimatedTime || `${t.estimatedMinutes}m`}
                          </span>

                          {/* Focus timer button */}
                          <button
                            onClick={() => {
                              onSetActiveTask(t.id);
                              onUpdateTaskStatus(t.id, 'IN_PROGRESS');
                            }}
                            className={`p-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                              activeTaskId === t.id && isInProgress
                                ? 'bg-[#00FF88] text-[#07090E] border-[#00FF88]'
                                : 'bg-white/[0.04] text-[#94A3B8] hover:text-white border-white/10'
                            }`}
                            title="Focus on this sub-task"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>

                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              className="p-1.5 text-[#64748B] hover:text-[#FF4D4D] transition-colors"
                              title="Delete sub-task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {groupTasks.length === 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-xs font-mono text-[#64748B]">
                      No sub-tasks in this objective yet.
                    </div>
                  )}
                </div>

                {/* Inline Add Subtask Button / Form */}
                {addingToObjective === groupName ? (
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex flex-wrap items-center gap-2 animate-in fade-in">
                    <input
                      type="text"
                      required
                      placeholder="Sub-task name (e.g. Test Gemini response parser)..."
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none focus:border-[#00FF88]"
                    />
                    <select
                      value={newSubtaskOwner}
                      onChange={e => setNewSubtaskOwner(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-black/80 border border-white/20 text-xs text-white focus:outline-none"
                    >
                      {teamMembers.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleCreateSubtask(groupName)}
                      className="px-4 py-2 rounded-xl bg-[#00FF88] text-[#07090E] text-xs font-mono font-bold hover:brightness-110 cursor-pointer"
                    >
                      Add Sub-task
                    </button>
                    <button
                      onClick={() => setAddingToObjective(null)}
                      className="p-2 text-[#64748B] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingToObjective(groupName);
                      setNewSubtaskTitle('');
                    }}
                    className="text-xs font-mono text-[#00FF88] hover:underline flex items-center gap-1.5 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sub-task to {groupName.split(':')[0]}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. KANBAN COLUMNS VIEW (For users who want classic board columns)         */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((status) => {
            const colTasks = filteredTasks.filter(t => t.status === status);
            const statusTitle = status === 'TODO' ? 'TO DO' : status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'DONE';
            const statusColor = status === 'TODO' ? 'text-[#00D2FF]' : status === 'IN_PROGRESS' ? 'text-[#00FF88]' : 'text-[#94A3B8]';

            return (
              <div key={status} className="rounded-[32px] bg-[#0A0E18] border border-white/10 p-5 space-y-4 shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'DONE' ? 'bg-[#00FF88]' : status === 'IN_PROGRESS' ? 'bg-[#00FF88] animate-pulse' : 'bg-[#00D2FF]'}`} />
                    <span className={`text-xs font-mono font-bold ${statusColor}`}>{statusTitle}</span>
                  </div>
                  <span className="text-xs font-mono text-[#64748B]">{colTasks.length}</span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs"
                    >
                      <div className="text-[10px] font-mono text-[#00F0FF]">{t.objectiveGroup || 'Objective 1'}</div>
                      <p className="text-white font-medium">{t.title.replace(/^\[.*?\]\s*/, '')}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-2 border-t border-white/5">
                        <span>{t.owner}</span>
                        <div className="flex items-center gap-1">
                          {status !== 'TODO' && (
                            <button onClick={() => onUpdateTaskStatus(t.id, 'TODO')} className="hover:text-white">← Todo</button>
                          )}
                          {status !== 'DONE' && (
                            <button onClick={() => onUpdateTaskStatus(t.id, 'DONE')} className="hover:text-[#00FF88] text-[#00FF88]">✓ Done</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs font-mono text-[#64748B]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
