import React from 'react';
import { 
  Zap, 
  Lightbulb, 
  Scissors, 
  CheckSquare, 
  Cpu, 
  Scale, 
  Rocket, 
  ChevronRight,
  Mic,
  LayoutDashboard
} from 'lucide-react';
import { NavigationTab } from '../types';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  scopeCutApplied: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  teamName?: string;
  projectName?: string;
  isDemo?: boolean;
  onOpenProjectSwitcher?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  scopeCutApplied,
  isOpenMobile,
  onCloseMobile,
  teamName = 'Team DOOM',
  projectName = 'Hackathon Copilot',
  isDemo = false,
  onOpenProjectSwitcher,
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'overview',
      label: 'War Room',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'idea-lab',
      label: 'Idea Forge',
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: 'mvp-planner',
      label: 'Scope Triage',
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      label: 'Battle Board',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'judge-mode',
      label: 'Judge Arena',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'launch',
      label: 'Pitch & Ship',
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: 'resources',
      label: 'API & Quotas',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: NavigationTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const initialLetter = (teamName || projectName || 'H').charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="halftime-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#080B12] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-6 border-b border-white/10">
          <BrandLogo size="md" showLabel={true} animated={false} />
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-[#64748B] uppercase">
            NAVIGATION
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold shadow-sm border border-white/10'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.03] font-medium border border-transparent'
                }`}
              >
                <span className={`transition-colors shrink-0 ${isActive ? 'text-[#00FF88]' : 'text-[#64748B]'}`}>
                  {item.icon}
                </span>

                <span className="text-sm tracking-wide flex-1 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Project & Team Card */}
        <div className="p-4 border-t border-white/10">
          <div 
            onClick={onOpenProjectSwitcher}
            className={`flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl border border-white/10 transition-all ${
              onOpenProjectSwitcher ? 'cursor-pointer' : ''
            }`}
            title="Click to switch hackathons"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 border border-white/10">
                {initialLetter}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{teamName || projectName}</p>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {isDemo ? 'Sandbox Demo' : projectName}
                </p>
              </div>
            </div>
            {onOpenProjectSwitcher && (
              <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0 ml-1" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
