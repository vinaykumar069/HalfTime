import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  NavigationTab, 
  ProjectHealth, 
  ScopeCutItem, 
  IdeaItem, 
  MVPFeature, 
  TaskItem, 
  AIResourceItem, 
  JudgeEvaluation, 
  LaunchChecklistItem, 
  ActivityTimelineItem,
  FeaturePriority,
  TaskStatus,
  Project,
  PitchCoachResult,
  DemoFlowResult
} from './types';
import { 
  teamMembers as defaultTeamMembers, 
  aiResources,
  initialTasks,
  initialScopeCutItems,
  initialIdeas,
  initialMVPFeatures,
  initialJudgeEvaluation,
  initialLaunchChecklist,
  initialActivityTimeline
} from './data/mockData';
import { 
  formatCountdown, 
  calculateProjectMetrics,
  formatMinutes
} from './services/projectEngine';
import { 
  fetchUserProjects, 
  createNewProject, 
  loadProjectFullData, 
  saveProjectFullData, 
  getActiveProjectId, 
  setActiveProjectId, 
  isExplicitDemoMode,
  setExplicitDemoMode,
  DEMO_PROJECT,
  ProjectFullData
} from './services/projectStorage';
import { 
  supabase,
  isSupabaseConfigured, 
  verifySupabaseConnection, 
  getCurrentAuthenticatedUser,
  ConnectionTestResult
} from './lib/supabase';
import { recommendNextAction } from './services/aiService';
import { Sidebar } from './components/Sidebar';
import { BrandLogo } from './components/BrandLogo';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ReasoningModal } from './components/modals/ReasoningModal';
import { ShipModeModal } from './components/ShipModeModal';
import { ProjectSwitcherModal } from './components/modals/ProjectSwitcherModal';
import { AuthModal, AuthModalView, UnconfirmedSource } from './components/modals/AuthModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { getCustomApiKey } from './services/aiService';
import { StorageConfigNotice } from './components/StorageConfigNotice';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { IdeaLab } from './components/ideas/IdeaLab';
import { MVPPlanner } from './components/mvp/MVPPlanner';
import { TaskBoard } from './components/tasks/TaskBoard';
import { ToolRadarView } from './components/tools/ToolRadarView';
import { JudgeMode } from './components/judge/JudgeMode';
import { LaunchView } from './components/launch/LaunchView';
import confetti from 'canvas-confetti';
import { Menu, AlertTriangle, Database, Sparkles, LogIn } from 'lucide-react';

export default function App() {
  // Supabase Configuration & Mode State
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(isSupabaseConfigured);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isExplicitDemoMode());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Projects & Multi-User State
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState<boolean>(false);
  
  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('signin');
  const [authModalEmail, setAuthModalEmail] = useState<string>('');
  const [authModalUnconfirmedSource, setAuthModalUnconfirmedSource] = useState<UnconfirmedSource>('signup');

  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Project Scoped State - Default to rich active workspace
  const [scopeItems, setScopeItems] = useState<ScopeCutItem[]>(initialScopeCutItems);
  const [ideas, setIdeas] = useState<IdeaItem[]>(initialIdeas);
  const [mvpFeatures, setMvpFeatures] = useState<MVPFeature[]>(initialMVPFeatures);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [dynamicTeamMembers, setDynamicTeamMembers] = useState<string[]>(
    DEMO_PROJECT.teamMembers || ['Alex (Builder)', 'Elena (Designer)', 'Marcus (Product)', 'Sam (Growth)']
  );
  const [resources, setResources] = useState<AIResourceItem[]>(aiResources);
  const [judgeEval, setJudgeEval] = useState<JudgeEvaluation>(initialJudgeEvaluation);
  const [launchChecklist, setLaunchChecklist] = useState<LaunchChecklistItem[]>(initialLaunchChecklist);
  const [pitchData, setPitchData] = useState<PitchCoachResult | null>(null);
  const [demoFlowResult, setDemoFlowResult] = useState<DemoFlowResult | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityTimelineItem[]>(initialActivityTimeline);
  const [scopeCutApplied, setScopeCutApplied] = useState(false);

  // Modals & UI States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const [isShipModeOpen, setIsShipModeOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyModalReason, setApiKeyModalReason] = useState<string | null>(null);
  const [hasCustomApiKey, setHasCustomApiKey] = useState<boolean>(() => Boolean(getCustomApiKey()));

  // Active Task Timer
  const [isTaskActive, setIsTaskActive] = useState(true);
  const [activeTaskSeconds, setActiveTaskSeconds] = useState(15 * 60 + 23);
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'warning' | 'info' | 'ai', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Listen to Global Gemini API Quota Exhaustion Events
  useEffect(() => {
    const handleQuotaExhausted = (event: any) => {
      const msg = event?.detail?.message || 'Gemini API quota has been exhausted. Please enter your API key.';
      setApiKeyModalReason(msg);
      setIsApiKeyModalOpen(true);
      addToast('warning', 'API Quota Exceeded', 'Please add or update your free Gemini API key to continue.');
    };

    window.addEventListener('halftime-quota-exhausted', handleQuotaExhausted);
    return () => window.removeEventListener('halftime-quota-exhausted', handleQuotaExhausted);
  }, [addToast]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. INITIAL PROJECT BOOTSTRAP
  const loadUserProjectsAndState = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);

    try {
      if (isExplicitDemoMode()) {
        setIsDemoMode(true);
        setProjectsList([DEMO_PROJECT]);
        await switchProject(DEMO_PROJECT.id, [DEMO_PROJECT]);
        setIsInitializing(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setIsInitializing(false);
        return;
      }

      // Check current user session in Supabase
      const user = await getCurrentAuthenticatedUser();
      setCurrentUser(user);

      if (!user) {
        setProjectsList([]);
        setActiveProject(null);
        setIsInitializing(false);
        return;
      }

      const { projects, error } = await fetchUserProjects();

      if (error && error !== 'AUTHENTICATION_REQUIRED') {
        setInitError(error);
        addToast('warning', 'DATABASE SYNC ISSUE', error);
      }

      if (projects.length === 0) {
        setProjectsList([DEMO_PROJECT]);
        await switchProject(DEMO_PROJECT.id, [DEMO_PROJECT]);
      } else {
        setProjectsList(projects);
        const savedActiveId = getActiveProjectId();
        const targetProject = projects.find(p => p.id === savedActiveId) || projects[0];
        await switchProject(targetProject.id, projects);
      }
    } catch (err: any) {
      console.error('Failed to initialize project state:', err);
      // Fallback to active demo workspace
      setProjectsList([DEMO_PROJECT]);
      await switchProject(DEMO_PROJECT.id, [DEMO_PROJECT]);
    } finally {
      setIsInitializing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadUserProjectsAndState();
  }, [loadUserProjectsAndState]);

  // 2. LISTEN FOR AUTH STATE CHANGES & CONFIRMATION REDIRECTS
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check if user landed on HALFTIME via an Email Confirmation link
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash.includes('error=') || search.includes('error=')) {
        const params = new URLSearchParams(hash.replace('#', '?') || search);
        const errorDesc = params.get('error_description') || params.get('error') || 'Authentication issue.';
        const errorCode = params.get('error_code') || '';

        if (errorCode === 'otp_expired' || errorDesc.toLowerCase().includes('expired')) {
          addToast('warning', 'CONFIRMATION LINK EXPIRED', 'Your confirmation link has expired. Please request a new one.');
          setAuthModalView('unconfirmed');
          setAuthModalUnconfirmedSource('signin');
          setIsAuthModalOpen(true);
        } else {
          addToast('warning', 'AUTHENTICATION NOTICE', errorDesc);
        }

        // Clean URL hash cleanly without page reload
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (hash.includes('type=signup') || hash.includes('access_token=') || search.includes('type=signup')) {
        addToast('success', 'EMAIL CONFIRMED', 'Your account is ready. Welcome to HALFTIME!');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('[HALFTIME Auth]', e);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const user = session?.user || null;
        setCurrentUser(user);
        if (user) {
          loadUserProjectsAndState();
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setProjectsList([]);
        setActiveProject(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProjectsAndState, addToast]);

  // Switch Active Project
  const switchProject = async (projectId: string, currentList: Project[] = projectsList) => {
    const targetProject = currentList.find(p => p.id === projectId) || 
      (projectId === DEMO_PROJECT.id ? DEMO_PROJECT : currentList[0] || DEMO_PROJECT);

    setActiveProject(targetProject);
    setActiveProjectId(targetProject.id);
    setIsOnboarding(false);

    // Load project data directly from Supabase
    const { data: pData, error } = await loadProjectFullData(targetProject.id, targetProject);
    
    if (error && !targetProject.isDemo) {
      addToast('warning', 'DATA LOAD NOTICE', error);
    }

    setScopeItems(pData.scopeItems || []);
    setIdeas(pData.ideas || []);
    setMvpFeatures(pData.features || []);
    setTasks(pData.tasks || []);
    if (targetProject.teamMembers && targetProject.teamMembers.length > 0) {
      setDynamicTeamMembers(targetProject.teamMembers);
    }
    setResources(pData.resources || aiResources);
    setJudgeEval(pData.judgeEval);
    setLaunchChecklist(pData.launchChecklist || []);
    setPitchData(pData.pitch || null);
    setDemoFlowResult(pData.demoFlow || null);
    setActivityLogs(pData.activities || []);
    setScopeCutApplied(Boolean(pData.scopeCutApplied));

    if (targetProject.isDemo || isDemoMode) {
      addToast('ai', 'DEMO MODE (SANDBOX)', 'Viewing sample Team DOOM sprint on DoraHacks 2.0.');
    } else {
      addToast('success', 'PROJECT LOADED', `Active workspace: ${targetProject.name}`);
    }
  };

  // Sync state changes back to Supabase
  useEffect(() => {
    if (!activeProject || isInitializing || isOnboarding) return;

    const fullData: ProjectFullData = {
      project: activeProject,
      tasks,
      features: mvpFeatures,
      scopeItems,
      ideas,
      activities: activityLogs,
      judgeEval,
      launchChecklist,
      resources,
      pitch: pitchData,
      demoFlow: demoFlowResult,
      scopeCutApplied,
    };

    saveProjectFullData(activeProject.id, fullData).then(({ success, error }) => {
      if (!success && error && !activeProject.isDemo && !isDemoMode) {
        console.warn('[Supabase Sync Warning]', error);
      }
    });
  }, [
    activeProject,
    tasks,
    mvpFeatures,
    scopeItems,
    ideas,
    activityLogs,
    judgeEval,
    launchChecklist,
    resources,
    pitchData,
    demoFlowResult,
    scopeCutApplied,
    isInitializing,
    isOnboarding,
    isDemoMode,
  ]);

  // Derived Project Engine Metrics
  const projectMetrics = useMemo(() => {
    return calculateProjectMetrics(scopeItems, activeProject || undefined, tasks, mvpFeatures);
  }, [scopeItems, activeProject, tasks, mvpFeatures]);

  const health = projectMetrics.health;

  // Real-time Countdown calculation with Pause/Resume and Runway Extension
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!activeProject) return 11 * 3600;
    const msLeft = new Date(activeProject.deadline).getTime() - Date.now();
    return Math.max(0, Math.floor(msLeft / 1000));
  });

  useEffect(() => {
    if (!activeProject) return;

    const computeSeconds = () => {
      const msLeft = new Date(activeProject.deadline).getTime() - Date.now();
      return Math.max(0, Math.floor(msLeft / 1000));
    };

    setSecondsRemaining(computeSeconds());

    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeProject?.deadline, activeProject?.id, isTimerPaused]);

  const countdownInfo = formatCountdown(secondsRemaining);

  const handleToggleTimer = () => {
    setIsTimerPaused(prev => !prev);
    if (!isTimerPaused) {
      addToast('warning', 'HACKATHON TIMER PAUSED', 'Countdown is paused. Runway clock is frozen.');
    } else {
      addToast('success', 'HACKATHON TIMER RESUMED', 'Countdown is running.');
    }
  };

  const handleExtendTimer = (extraMinutes: number) => {
    const addedSeconds = extraMinutes * 60;
    setSecondsRemaining(prev => prev + addedSeconds);

    if (activeProject) {
      const newDeadlineMs = new Date(activeProject.deadline).getTime() + addedSeconds * 1000;
      const newDeadlineIso = new Date(newDeadlineMs).toISOString();
      setActiveProject(prev => prev ? { ...prev, deadline: newDeadlineIso } : null);
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#00FF88', '#00F0FF', '#FFFFFF'],
      });
    } catch (e) {}

    addToast('success', 'RUNWAY EXTENDED', `Added +${extraMinutes} minutes to your hackathon deadline!`);
  };

  // Live timer for active task
  useEffect(() => {
    let interval: any = null;
    if (isTaskActive) {
      interval = setInterval(() => {
        setActiveTaskSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTaskActive]);

  // Handle Entering Explicit Demo Mode
  const handleEnterDemoMode = () => {
    setExplicitDemoMode(true);
    setIsDemoMode(true);
    setIsOnboarding(false);
    setProjectsList([DEMO_PROJECT]);
    switchProject(DEMO_PROJECT.id, [DEMO_PROJECT]);
    addToast('ai', 'DEMO MODE ACTIVATED', 'Exploring sample Team DOOM sprint in local sandbox.');
  };

  // Handle Exiting Demo Mode
  const handleExitDemoMode = () => {
    setExplicitDemoMode(false);
    setIsDemoMode(false);
    setActiveProject(null);
    loadUserProjectsAndState();
  };

  // Handle Creating New Project
  const handleCreateProject = async (data: {
    name: string;
    hackathonName: string;
    deadline: string;
    description: string;
    teamName?: string;
    teamMembers?: string[];
    teamSkills?: string[];
  }) => {
    try {
      const { project: created, fullData } = await createNewProject(data);
      const updatedList = [created, ...projectsList.filter(p => p.id !== created.id)];
      setProjectsList(updatedList);
      await switchProject(created.id, updatedList);
      addToast('success', 'HACKATHON CREATED', `"${created.name}" configured and saved to Supabase.`);
    } catch (err: any) {
      console.error('Project creation failed:', err);
      addToast('warning', 'CREATE FAILED', err?.message || 'Unable to save your project. Please try again.');
      throw err;
    }
  };

  // Execute Scope Cut
  const handleExecuteScopeCut = () => {
    const selectedItems = scopeItems.filter(i => i.selectedForCut);
    if (selectedItems.length === 0) {
      addToast('warning', 'NO FEATURES SELECTED', 'Select at least one feature to prune.');
      return;
    }

    setScopeCutApplied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5C5C', '#A8E6CF', '#C7F9A6'],
    });

    const totalRecoveredMinutes = selectedItems.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
    const recoveredFormatted = formatMinutes(totalRecoveredMinutes);

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: `Scope Cut Executed: Pruned ${selectedItems.length} features, recovered ${recoveredFormatted}`,
        timestamp: 'just now',
        type: 'scope',
        badgeColor: '#FF5C5C',
      },
      ...prev,
    ]);

    addToast('success', 'SCOPE CUT APPLIED', `Pruned ${selectedItems.length} items. Recovered ${recoveredFormatted} of runway!`);
  };

  const handleResetScopeCut = () => {
    setScopeCutApplied(false);
    setScopeItems(prev => prev.map(item => ({ ...item, selectedForCut: false })));
    addToast('info', 'SCOPE RESTORED', 'All pruned items returned to active backlog.');
  };

  const handleToggleScopeSelect = (id: string) => {
    setScopeItems(prev => prev.map(item => item.id === id ? { ...item, selectedForCut: !item.selectedForCut } : item));
  };

  // Recalculate Plan with Gemini AI
  const handleRecalculatePlan = async () => {
    addToast('ai', 'AI TRIAGE ACTIVE', 'Analyzing sprint telemetry with Gemini...');
    try {
      const rec = await recommendNextAction({
        timeRemaining: `${Math.max(1, Math.round(secondsRemaining / 3600))} hours`,
        workRemaining: `${Math.round(projectMetrics.totalEstimatedHours)} hours`,
        tasks,
        teamMembers: dynamicTeamMembers,
        currentProject: currentProjectName,
        projectHealth: health,
        riskStatus: health.status,
        scopeCutApplied,
      });

      setActivityLogs(prev => [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          title: `AI Triage: ${rec?.actionTitle || 'Focus on core demo'} - ${rec?.reason || 'Optimizes judge demo score.'}`,
          timestamp: 'just now',
          type: 'ai',
          badgeColor: '#C7F9A6',
        },
        ...prev,
      ]);
      addToast('success', 'SPRINT PLAN UPDATED', rec?.actionTitle ? `Focus: ${rec.actionTitle}` : 'Sprint synchronized with Gemini.');
    } catch (err: any) {
      addToast('warning', 'AI TRIAGE NOTICE', err?.message || 'HALFTIME AI is temporarily unavailable. Please try again.');
    }
  };

  const handleStartNextTask = () => {
    setIsTaskActive(true);
    setActiveTaskSeconds(0);
    setActiveTab('tasks');
    addToast('info', 'SPRINT TIMER STARTED', 'Tracking active build sprint for primary milestone.');
  };

  // Ideas Actions
  const handleSelectActiveIdea = (idea: IdeaItem) => {
    addToast('ai', 'ACTIVE IDEA SELECTED', `Switched primary project context to "${idea.title}".`);
  };

  const handleAddGeneratedIdeas = (newIdeas: IdeaItem[]) => {
    setIdeas(prev => [...newIdeas, ...prev]);
    addToast('success', 'IDEAS GENERATED', `${newIdeas.length} new hackathon concepts synthesized.`);
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
    addToast('info', 'IDEA REMOVED', 'Concept removed from matrix.');
  };

  // MVP Actions
  const handleChangeFeaturePriority = (id: string, newPriority: FeaturePriority) => {
    setMvpFeatures(prev => prev.map(f => f.id === id ? { ...f, priority: newPriority } : f));
    addToast('info', 'MVP MATRIX UPDATED', `Feature moved to ${newPriority.replace('_', ' ')}.`);
  };

  const handleAddFeature = (feat: MVPFeature) => {
    setMvpFeatures(prev => [...prev, feat]);
    addToast('success', 'FEATURE ADDED', `"${feat.name}" added to MVP Plan.`);
  };

  const handleDeleteFeature = (featId: string) => {
    setMvpFeatures(prev => prev.filter(f => f.id !== featId));
    addToast('info', 'FEATURE REMOVED', 'Feature pruned from MVP architecture.');
  };

  const handleAddTasksFromRoadmap = (newTasks: TaskItem[]) => {
    setTasks(prev => [...newTasks, ...prev]);
    addToast('success', 'ROADMAP IMPORTED', `Added ${newTasks.length} sprint tickets to Task Board.`);
  };

  // Task Actions
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (newStatus === 'DONE') {
      addToast('success', 'TASK COMPLETED', 'Sprint velocity updated.');
    }
  };

  const handleAddTask = (task: TaskItem) => {
    setTasks(prev => [task, ...prev]);
    addToast('info', 'TASK CREATED', `"${task.title}" added to backlog.`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addToast('info', 'TASK REMOVED', 'Ticket removed from board.');
  };

  const handleAddTeamMember = (memberName: string) => {
    setDynamicTeamMembers(prev => [...prev, memberName]);
    addToast('success', 'TEAM UPDATED', `${memberName} added to active hacker roster.`);
  };

  const handleRenameTeamMember = (oldName: string, newName: string) => {
    setDynamicTeamMembers(prev => prev.map(m => m === oldName ? newName : m));
    setTasks(prev => prev.map(t => t.owner === oldName ? { ...t, owner: newName } : t));
    addToast('success', 'TEAMMATE RENAMED', `"${oldName}" updated to "${newName}".`);
  };

  const handleDeleteTeamMember = (name: string) => {
    setDynamicTeamMembers(prev => {
      const filtered = prev.filter(m => m !== name);
      return filtered.length > 0 ? filtered : ['Teammate 1'];
    });
    const fallback = dynamicTeamMembers.find(m => m !== name) || 'Teammate 1';
    setTasks(prev => prev.map(t => t.owner === name ? { ...t, owner: fallback } : t));
    addToast('info', 'TEAMMATE REMOVED', `${name} removed from roster.`);
  };

  // Resource Actions
  const handleAddResource = (resItem: AIResourceItem) => {
    setResources(prev => [resItem, ...prev]);
    addToast('success', 'RESOURCE TRACKED', `${resItem.tool} quota added.`);
  };

  const handleUpdateResourceUsage = (id: string, newUsage: number) => {
    setResources(prev => prev.map(r => {
      if (r.id === id && r.budgetLimit) {
        const remaining = Math.max(0, r.budgetLimit - newUsage);
        const percent = Math.min(100, Math.max(0, Math.round((remaining / r.budgetLimit) * 100)));
        return {
          ...r,
          currentUsage: newUsage,
          remainingPercent: percent,
          creditsLabel: `${(r.budgetLimit - newUsage).toFixed(0)} / ${r.budgetLimit} ${r.unit || 'units'} remaining`,
        };
      }
      return r;
    }));
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    addToast('info', 'RESOURCE REMOVED', 'Resource telemetry unlinked.');
  };

  // Judge Actions
  const handleToggleJudgeFix = (fixId: number) => {
    setJudgeEval(prev => {
      const updatedFixes = prev.fixes.map(f => f.id === fixId ? { ...f, applied: !f.applied } : f);
      const newlyApplied = updatedFixes.find(f => f.id === fixId);
      const scoreDelta = newlyApplied?.applied ? (newlyApplied.scoreBonus || 0.5) : -(newlyApplied?.scoreBonus || 0.5);
      const newScore = Math.min(10.0, Math.max(1.0, Math.round((prev.overallScore + scoreDelta) * 10) / 10));

      return {
        ...prev,
        overallScore: newScore,
        fixes: updatedFixes,
      };
    });
    addToast('success', 'JUDGE TELEMETRY UPDATED', 'Applied fix bonus to projected score.');
  };

  const handleRerunJudge = () => {
    addToast('ai', 'AI JUDGE RE-EVALUATION', 'Recalibrating project rubric score with Gemini...');
  };

  // Launch Checklist Actions
  const handleToggleLaunchStatus = (id: string) => {
    setLaunchChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'COMPLETE' ? 'NOT_STARTED' : item.status === 'NOT_STARTED' ? 'IN_PROGRESS' : 'COMPLETE';
        if (nextStatus === 'COMPLETE') {
          addToast('success', 'PRE-FLIGHT GATE CLEARED', `Passed: ${item.label}`);
        }
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleAddChecklistItem = (item: LaunchChecklistItem) => {
    setLaunchChecklist(prev => [...prev, item]);
    addToast('info', 'GATE ADDED', `"${item.label}" added to launch pre-flight.`);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setLaunchChecklist(prev => prev.filter(i => i.id !== itemId));
    addToast('info', 'GATE REMOVED', 'Item removed from checklist.');
  };

  // Active Project metadata
  const currentProjectName = activeProject?.name || 'Hackathon Copilot';
  const currentHackathonName = activeProject?.hackathonName || 'DoraHacks 2.0';
  const currentTeamName = activeProject?.teamName || 'DOOM';
  const isDemo = Boolean(activeProject?.isDemo || isDemoMode);

  // 1. First-time onboarding screen (Idea & Stack Form)
  if (isOnboarding && !activeProject) {
    return (
      <>
        <OnboardingScreen
          onCreateProject={handleCreateProject}
          onSelectDemo={handleEnterDemoMode}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // 2. Unauthenticated / No Active Project Welcome Screen
  if (!activeProject && !isDemo) {
    return (
      <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#00FF88] selection:text-[#07090E]">
        {/* Ambient atmosphere glow */}
        <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#00F0FF] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#00FF88] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

        <div className="w-full max-w-lg rounded-[36px] bg-[#0A0E18] border border-white/10 p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <BrandLogo size="lg" showLabel={false} animated={true} />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#00F0FF] uppercase mb-1">
              TACTICAL HACKATHON MISSION CONTROL
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
              WELCOME TO HALFTIME
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 max-w-sm">
              Stop building the wrong features. Recalculate your time and ship a winning live demo.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {/* Primary: Create Project */}
            <button
              onClick={() => setIsOnboarding(true)}
              className="w-full py-4 px-5 rounded-2xl bg-[#00FF88] hover:brightness-110 text-[#07090E] font-mono text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#00FF88]/20 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#07090E]" />
              <span>CREATE HACKATHON PROJECT (IDEA &amp; STACK) →</span>
            </button>

            {/* Secondary: Sign in / Sign up */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/15 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#00F0FF]" />
              <span>SIGN IN / SIGN UP (CLOUD SYNC)</span>
            </button>

            {/* Tertiary: Explore Sandbox */}
            <button
              onClick={handleEnterDemoMode}
              className="w-full py-3 px-4 rounded-xl text-[#64748B] hover:text-[#94A3B8] font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Or explore interactive Demo Sandbox (Team DOOM) →</span>
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalView('signin');
          }}
          onAuthChange={loadUserProjectsAndState}
          initialView={authModalView}
          initialEmail={authModalEmail}
          initialUnconfirmedSource={authModalUnconfirmedSource}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div id="halftime-app-root" className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#00F59B] selection:text-[#07090E] relative overflow-x-hidden">
      {/* Explicit Demo Mode Warning Banner */}
      {isDemo && (
        <div id="demo-mode-banner" className="bg-[#FFAA00]/15 border-b border-[#FFAA00]/30 px-4 py-2 text-center text-xs font-mono text-[#FFAA00] flex items-center justify-center gap-3 z-50 backdrop-blur-md">
          <span className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-[#FFAA00]" />
            <span>DEMO MODE (SANDBOX — ISOLATED DEMO SPRINT)</span>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-[#94A3B8]">Viewing sample Team DOOM sprint on DoraHacks 2.0</span>
          {supabaseConfigured ? (
            <button
              onClick={handleExitDemoMode}
              className="ml-2 px-3 py-0.5 rounded-full bg-[#00F59B] text-[#07090E] font-black text-[10px] hover:brightness-110 transition cursor-pointer"
            >
              Exit Demo Mode
            </button>
          ) : (
            <button
              onClick={() => {
                setExplicitDemoMode(false);
                setIsDemoMode(false);
              }}
              className="ml-2 px-3 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px] hover:bg-white/20 transition cursor-pointer"
            >
              Configure Storage
            </button>
          )}
        </div>
      )}

      {/* Ambient background glow */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#00D2FF] opacity-[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#FF6B00] opacity-[0.03] blur-[140px] rounded-full pointer-events-none" />

      {/* Main Persistent Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab}
        scopeCutApplied={scopeCutApplied}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        projectName={currentProjectName}
        teamName={currentTeamName}
        isDemo={isDemo}
        onOpenProjectSwitcher={() => setIsProjectSwitcherOpen(true)}
      />

      {/* Main Content Layout with Left Offset for Desktop Sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative z-10">
        {/* Mobile Top Header Toggle Bar */}
        <div className="lg:hidden h-14 bg-[#0B0E17]/90 border-b border-white/10 px-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white/[0.04] text-white border border-white/10 active:scale-95 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsProjectSwitcherOpen(true)}
            className="font-mono font-bold text-xs tracking-wider text-white flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentProjectName}</span>
            {isDemo && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FFAA00]/20 text-[#FFAA00] font-bold">
                DEMO
              </span>
            )}
          </button>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30">
            {countdownInfo.display}
          </span>
        </div>

        {/* Global Top Bar with Functional Real-Time Countdown, Auth & Project Switcher */}
        <TopBar
          healthStatus={health.status}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShipMode={() => setIsShipModeOpen(true)}
          onOpenProjectSwitcher={() => setIsProjectSwitcherOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenApiKeyModal={() => {
            setApiKeyModalReason(null);
            setIsApiKeyModalOpen(true);
          }}
          hasCustomApiKey={hasCustomApiKey}
          shipModeReady={launchChecklist.filter(i => i.status === 'COMPLETE').length >= 6}
          countdownDisplay={countdownInfo.display}
          countdownStatus={countdownInfo.status}
          projectName={currentProjectName}
          hackathonName={currentHackathonName}
          isDemo={isDemo}
        />

        {/* Dynamic Main View Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              health={health}
              scopeItems={scopeItems}
              activityLogs={activityLogs}
              scopeCutApplied={scopeCutApplied}
              onExecuteScopeCut={handleExecuteScopeCut}
              onResetScopeCut={handleResetScopeCut}
              onToggleScopeSelect={handleToggleScopeSelect}
              onRecalculatePlan={handleRecalculatePlan}
              onOpenReasoning={() => setIsReasoningOpen(true)}
              onStartNextTask={handleStartNextTask}
              isTaskActive={isTaskActive}
              taskActiveSeconds={activeTaskSeconds}
              projectName={currentProjectName}
              hackathonName={currentHackathonName}
              teamName={currentTeamName}
              teamMembers={dynamicTeamMembers}
              onAddTeamMember={handleAddTeamMember}
              onRenameTeamMember={handleRenameTeamMember}
              onDeleteTeamMember={handleDeleteTeamMember}
              countdownDisplay={countdownInfo.display}
              countdownStatus={countdownInfo.status}
              isTimerPaused={isTimerPaused}
              onToggleTimer={handleToggleTimer}
              onExtendTimer={handleExtendTimer}
              onNavigateTab={setActiveTab}
              onOpenShipMode={() => setIsShipModeOpen(true)}
            />
          )}

          {activeTab === 'idea-lab' && (
            <IdeaLab
              ideas={ideas}
              onSelectActiveIdea={handleSelectActiveIdea}
              onAddGeneratedIdeas={handleAddGeneratedIdeas}
              onDeleteIdea={handleDeleteIdea}
              currentProjectName={currentProjectName}
            />
          )}

          {activeTab === 'mvp-planner' && (
            <MVPPlanner
              features={mvpFeatures}
              onChangeFeaturePriority={handleChangeFeaturePriority}
              onAddFeature={handleAddFeature}
              onDeleteFeature={handleDeleteFeature}
              onSetAllFeatures={(newFeats) => setMvpFeatures(newFeats)}
              onAddTasksFromRoadmap={handleAddTasksFromRoadmap}
              activeIdeaTitle={currentProjectName}
              availableHours={Math.max(2, Math.round(secondsRemaining / 3600))}
              teamSkills={activeProject?.teamSkills || []}
              teamMembers={dynamicTeamMembers}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              teamMembers={dynamicTeamMembers}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onAddTeamMember={handleAddTeamMember}
              activeTaskId={activeTaskId}
              onSetActiveTask={setActiveTaskId}
            />
          )}

          {activeTab === 'resources' && (
            <ToolRadarView
              tasks={tasks}
              teamSkills={activeProject?.teamSkills || ['React', 'TypeScript', 'Node.js', 'Tailwind']}
              projectName={currentProjectName}
              availableHours={Math.max(2, Math.round(secondsRemaining / 3600))}
            />
          )}

          {activeTab === 'judge-mode' && (
            <JudgeMode
              evaluation={judgeEval}
              onToggleFix={handleToggleJudgeFix}
              onRerunJudge={handleRerunJudge}
              onUpdateEvaluation={(newEval) => setJudgeEval(newEval)}
              scopeCutApplied={scopeCutApplied}
              projectName={currentProjectName}
              problem={activeProject?.description}
              solution={currentProjectName}
              features={mvpFeatures}
            />
          )}

          {activeTab === 'launch' && (
            <LaunchView
              checklist={launchChecklist}
              onToggleStatus={handleToggleLaunchStatus}
              onAddChecklistItem={handleAddChecklistItem}
              onDeleteChecklistItem={handleDeleteChecklistItem}
              onOpenShipMode={() => setIsShipModeOpen(true)}
              scopeCutApplied={scopeCutApplied}
              projectName={currentProjectName}
              problem={activeProject?.description}
              solution={currentProjectName}
              features={mvpFeatures}
              initialPitch={pitchData}
              initialDemoFlow={demoFlowResult}
              onSavePitch={(p) => setPitchData(p)}
              onSaveDemoFlow={(df) => setDemoFlowResult(df)}
            />
          )}
        </main>
      </div>

      {/* Floating Bottom-Right Corner Widget */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center space-x-3 pointer-events-auto">
        <div className="bg-[#293735]/85 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center space-x-2.5 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-[#A8E6CF] animate-pulse" />
          <span className="text-[10px] font-bold tracking-tight text-[#F0F4EE]">
            {isDemo ? 'DEMO MODE' : 'AI ONLINE'}
          </span>
        </div>
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="bg-[#C7F9A6] text-[#202B2A] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(199,249,166,0.4)] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Open Quick Command Palette (⌘K)"
        >
          <span className="text-xs font-black">⌘K</span>
        </button>
      </div>

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onTriggerScopeCut={handleExecuteScopeCut}
        onTriggerShipMode={() => setIsShipModeOpen(true)}
        onStartNextTask={handleStartNextTask}
        onOpenApiKeyModal={() => {
          setApiKeyModalReason(null);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* AI Reasoning Deep Dive Modal */}
      <ReasoningModal
        isOpen={isReasoningOpen}
        onClose={() => setIsReasoningOpen(false)}
        health={health}
        scopeCutApplied={scopeCutApplied}
      />

      {/* Hero Ship Mode Modal */}
      <ShipModeModal
        isOpen={isShipModeOpen}
        onClose={() => setIsShipModeOpen(false)}
        scopeCutApplied={scopeCutApplied}
        score={judgeEval?.overallScore || 8.8}
      />

      {/* Project Switcher Modal */}
      <ProjectSwitcherModal
        isOpen={isProjectSwitcherOpen}
        onClose={() => setIsProjectSwitcherOpen(false)}
        projects={projectsList}
        activeProjectId={activeProject?.id || ''}
        onSelectProject={(id) => switchProject(id)}
        onOpenCreateNew={() => {
          setIsOnboarding(true);
          setActiveProject(null);
        }}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalView('signin');
        }}
        onAuthChange={loadUserProjectsAndState}
        initialView={authModalView}
        initialEmail={authModalEmail}
        initialUnconfirmedSource={authModalUnconfirmedSource}
      />

      {/* Gemini API Key BYOK Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setApiKeyModalReason(null);
        }}
        quotaExceededReason={apiKeyModalReason}
        onKeyChanged={() => {
          setHasCustomApiKey(Boolean(getCustomApiKey()));
          addToast('success', 'API Key Saved', 'Gemini API key updated successfully!');
        }}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
