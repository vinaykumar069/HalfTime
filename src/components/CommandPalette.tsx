import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Lightbulb, 
  Layers, 
  CheckSquare, 
  Cpu, 
  Scale, 
  Rocket, 
  Scissors, 
  Sparkles, 
  Play, 
  X 
} from 'lucide-react';
import { NavigationTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onTriggerScopeCut: () => void;
  onTriggerShipMode: () => void;
  onStartNextTask: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerScopeCut,
  onTriggerShipMode,
  onStartNextTask,
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'dash',
      title: 'Go to Overview Dashboard',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-[#00F59B]" />,
      action: () => { onSelectTab('overview'); onClose(); }
    },
    {
      id: 'cut',
      title: 'Execute Scope Cut (−3h 45m)',
      category: 'Quick Action',
      icon: <Scissors className="w-4 h-4 text-[#FF6B00]" />,
      action: () => { onTriggerScopeCut(); onClose(); }
    },
    {
      id: 'task',
      title: 'Start Next Action: Core AI Evaluation Flow',
      category: 'Task',
      icon: <Play className="w-4 h-4 text-[#00F59B]" />,
      action: () => { onStartNextTask(); onClose(); }
    },
    {
      id: 'judge',
      title: 'Run AI Judge Simulator (Audit Rubric)',
      category: 'Evaluation',
      icon: <Scale className="w-4 h-4 text-[#FFAA00]" />,
      action: () => { onSelectTab('judge-mode'); onClose(); }
    },
    {
      id: 'ship',
      title: 'Enter Ship Mode (Launch Countdown)',
      category: 'Milestone',
      icon: <Sparkles className="w-4 h-4 text-[#00F59B]" />,
      action: () => { onTriggerShipMode(); onClose(); }
    },
    {
      id: 'idea',
      title: 'Open Idea Lab & Generate New Concepts',
      category: 'Navigation',
      icon: <Lightbulb className="w-4 h-4 text-[#00D2FF]" />,
      action: () => { onSelectTab('idea-lab'); onClose(); }
    },
    {
      id: 'mvp',
      title: 'View MVP Planner Matrix',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-[#00D2FF]" />,
      action: () => { onSelectTab('mvp-planner'); onClose(); }
    },
    {
      id: 'tasks',
      title: 'Manage Task Board & Sprint',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-[#00F59B]" />,
      action: () => { onSelectTab('tasks'); onClose(); }
    },
    {
      id: 'resources',
      title: 'Check AI Token & Resource Pressure',
      category: 'Monitoring',
      icon: <Cpu className="w-4 h-4 text-[#8B5CF6]" />,
      action: () => { onSelectTab('resources'); onClose(); }
    },
    {
      id: 'launch',
      title: 'View Launch Readiness Checklist (78%)',
      category: 'Milestone',
      icon: <Rocket className="w-4 h-4 text-[#FF2A5F]" />,
      action: () => { onSelectTab('launch'); onClose(); }
    },
  ];

  const filtered = actions.filter((a) => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="halftime-command-palette"
        className="w-full max-w-xl glass-panel-elevated rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-[#00D2FF]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action (e.g. 'Cut', 'Judge', 'Ship')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-[#64748B] focus:outline-none font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B] font-mono">
              No matching HALFTIME commands found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 group-hover:border-white/20 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/5">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-[#64748B] font-mono">
          <div className="flex items-center gap-2">
            <span>Navigation: <kbd className="text-[#94A3B8]">↑↓</kbd></span>
            <span>Select: <kbd className="text-[#94A3B8]">↵</kbd></span>
          </div>
          <span>HALFTIME OS</span>
        </div>
      </div>
    </div>
  );
};
