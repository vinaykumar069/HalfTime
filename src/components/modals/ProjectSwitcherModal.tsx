import React from 'react';
import { 
  FolderGit2, 
  Plus, 
  Check, 
  X, 
  Sparkles, 
  Calendar, 
  Users, 
  Clock 
} from 'lucide-react';
import { Project } from '../../types';
import { formatMinutes } from '../../services/projectEngine';

interface ProjectSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenCreateNew: () => void;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenCreateNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">YOUR HACKATHONS</h2>
              <p className="text-xs text-[#64748B]">Select or switch active project sandbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project List */}
        <div className="py-4 space-y-2.5 max-h-[360px] overflow-y-auto">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const msLeft = new Date(proj.deadline).getTime() - Date.now();
            const minsLeft = Math.max(0, Math.floor(msLeft / 60000));
            const timeLeftFormatted = minsLeft > 0 ? formatMinutes(minsLeft) : 'Ended';

            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#00F59B]/10 border-[#00F59B] shadow-lg glow-emerald'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {proj.name}
                    </span>
                    {proj.isDemo && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/40 font-bold">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                    <span className="truncate">{proj.hackathonName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[#00D2FF]">
                      <Clock className="w-3 h-3" />
                      <span>{timeLeftFormatted}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  {isActive ? (
                    <div className="w-6 h-6 rounded-full bg-[#00F59B] text-[#07090E] flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-[#00F59B] transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00F59B] hover:bg-[#20ffac] text-[#07090E] font-black font-mono text-xs flex items-center justify-center gap-2 shadow-lg glow-emerald transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE NEW HACKATHON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
