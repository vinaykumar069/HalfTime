import { 
  Project, 
  TaskItem, 
  MVPFeature, 
  ScopeCutItem, 
  ActivityTimelineItem, 
  IdeaItem, 
  JudgeEvaluation,
  LaunchChecklistItem,
  AIResourceItem,
  PitchCoachResult,
  DemoFlowResult
} from '../types';
import { 
  supabase, 
  isSupabaseConfigured, 
  getCurrentAuthenticatedUser 
} from '../lib/supabase';
import { 
  initialTasks, 
  initialMVPFeatures, 
  initialScopeCutItems, 
  initialActivityTimeline,
  initialIdeas,
  initialJudgeEvaluation,
  initialLaunchChecklist,
  aiResources
} from '../data/mockData';

export const DEMO_PROJECT: Project = {
  id: 'demo-doom',
  name: 'Hackathon Copilot',
  hackathonName: 'DoraHacks 2.0',
  teamName: 'Squad',
  description: 'An AI mission control that continuously recalculates work vs. remaining time, flags judge risks, and executes ruthless scope cuts.',
  deadline: new Date(Date.now() + 11 * 3600 * 1000).toISOString(),
  teamSkills: ['Frontend development', 'AI', 'UI/UX'],
  teamMembers: ['Teammate 1', 'Teammate 2', 'Teammate 3', 'Teammate 4'],
  isDemo: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// UI-only local preference keys (NOT used as authoritative project storage)
const UI_PREF_KEYS = {
  ACTIVE_PROJECT_ID: 'halftime_active_project_id',
  DEMO_MODE_ACTIVE: 'halftime_demo_mode_active',
  SIDEBAR_COLLAPSED: 'halftime_sidebar_collapsed',
};

export interface ProjectFullData {
  project: Project;
  tasks: TaskItem[];
  features: MVPFeature[];
  scopeItems: ScopeCutItem[];
  ideas: IdeaItem[];
  activities: ActivityTimelineItem[];
  judgeEval: JudgeEvaluation;
  launchChecklist: LaunchChecklistItem[];
  resources: AIResourceItem[];
  pitch?: PitchCoachResult | null;
  demoFlow?: DemoFlowResult | null;
  scopeCutApplied: boolean;
}

// In-memory cache for fast responsive UI updates during active user session
const memoryDataCache = new Map<string, ProjectFullData>();

/**
 * Fetch projects for the currently authenticated Supabase user.
 * STRICT: Does NOT silently fall back to localStorage in production.
 */
export async function fetchUserProjects(): Promise<{ projects: Project[]; error?: string }> {
  // If user explicitly chose Demo Mode
  if (isExplicitDemoMode()) {
    return { projects: [DEMO_PROJECT] };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      projects: [],
      error: 'HALFTIME storage is not configured. Connect your Supabase project in environment variables.',
    };
  }

  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return {
      projects: [],
      error: 'AUTHENTICATION_REQUIRED',
    };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Fetch Projects Error]', error);
      return {
        projects: [],
        error: `Supabase database error: ${error.message}`,
      };
    }

    const projects: Project[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      hackathonName: row.hackathon_name,
      description: row.description || '',
      deadline: row.deadline,
      teamName: row.team_name,
      teamMembers: Array.isArray(row.team_members) ? row.team_members : [],
      teamSkills: Array.isArray(row.team_skills) ? row.team_skills : [],
      isDemo: Boolean(row.is_demo),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { projects };
  } catch (err: any) {
    console.error('[Supabase Network/Client Error]', err);
    return {
      projects: [],
      error: err?.message || 'Failed to connect to Supabase database.',
    };
  }
}

/**
 * Create a new user project in Supabase with RLS.
 * STRICT: Fails explicitly if Supabase insert fails.
 */
export async function createNewProject(params: {
  name: string;
  hackathonName: string;
  deadline: string;
  description: string;
  teamName?: string;
  teamMembers?: string[];
  teamSkills?: string[];
}): Promise<{ project: Project; fullData: ProjectFullData }> {
  // Handle explicit demo mode creation
  if (isExplicitDemoMode()) {
    const newId = `demo_prj_${Date.now()}`;
    const now = new Date().toISOString();
    const demoPrj: Project = {
      id: newId,
      name: params.name.trim(),
      hackathonName: params.hackathonName.trim(),
      description: params.description.trim(),
      deadline: params.deadline,
      teamName: params.teamName?.trim() || 'Demo Team',
      teamMembers: params.teamMembers || ['Lead Builder', 'Designer'],
      teamSkills: params.teamSkills || ['Frontend', 'AI'],
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };
    const freshData = createInitialProjectFullData(demoPrj);
    memoryDataCache.set(newId, freshData);
    setActiveProjectId(newId);
    return { project: demoPrj, fullData: freshData };
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('HALFTIME storage is not configured. Missing valid Supabase environment variables.');
  }

  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    throw new Error('You must be signed in to create and persist projects in Supabase.');
  }

  const newId = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id: newId,
    userId: user.id,
    name: params.name.trim(),
    hackathonName: params.hackathonName.trim(),
    description: params.description.trim(),
    deadline: params.deadline,
    teamName: params.teamName?.trim() || 'My Team',
    teamMembers: params.teamMembers || [],
    teamSkills: params.teamSkills || [],
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  };

  const initialData = createInitialProjectFullData(newProject);

  // 1. Insert Project Row into Supabase
  const { error: prjError } = await supabase.from('projects').insert({
    id: newProject.id,
    user_id: user.id,
    name: newProject.name,
    hackathon_name: newProject.hackathonName,
    description: newProject.description,
    deadline: newProject.deadline,
    team_name: newProject.teamName,
    team_members: newProject.teamMembers,
    team_skills: newProject.teamSkills,
    is_demo: false,
    created_at: now,
    updated_at: now,
  });

  if (prjError) {
    console.error('[Supabase Create Project Error]', prjError);
    throw new Error(`Unable to save project to Supabase: ${prjError.message}`);
  }

  // 2. Insert Initial Project Full Data into Supabase
  const { error: dataError } = await supabase.from('project_data').insert({
    project_id: newProject.id,
    user_id: user.id,
    tasks: initialData.tasks,
    features: initialData.features,
    scope_items: initialData.scopeItems,
    ideas: initialData.ideas,
    activities: initialData.activities,
    judge_eval: initialData.judgeEval,
    launch_checklist: initialData.launchChecklist,
    resources: initialData.resources,
    pitch: initialData.pitch || null,
    demo_flow: initialData.demoFlow || null,
    scope_cut_applied: initialData.scopeCutApplied,
    updated_at: now,
  });

  if (dataError) {
    console.error('[Supabase Create Project Data Error]', dataError);
    // Note: Do not silently succeed if full data insert failed
    throw new Error(`Unable to initialize project data in Supabase: ${dataError.message}`);
  }

  // Cache in memory for smooth transitions
  memoryDataCache.set(newId, initialData);
  setActiveProjectId(newId);

  return { project: newProject, fullData: initialData };
}

/**
 * Load full project data directly from Supabase
 */
export async function loadProjectFullData(projectId: string, fallbackProject?: Project): Promise<{ data: ProjectFullData; error?: string }> {
  // Demo Mode Handler
  if (projectId === 'demo-doom' || isExplicitDemoMode()) {
    if (memoryDataCache.has(projectId)) {
      return { data: memoryDataCache.get(projectId)! };
    }
    const demoData: ProjectFullData = {
      project: fallbackProject || DEMO_PROJECT,
      tasks: initialTasks,
      features: initialMVPFeatures,
      scopeItems: initialScopeCutItems,
      ideas: initialIdeas,
      activities: initialActivityTimeline,
      judgeEval: initialJudgeEvaluation,
      launchChecklist: initialLaunchChecklist,
      resources: aiResources,
      scopeCutApplied: false,
    };
    memoryDataCache.set(projectId, demoData);
    return { data: demoData };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      data: createInitialProjectFullData(fallbackProject || { ...DEMO_PROJECT, id: projectId }),
      error: 'HALFTIME storage is not configured.',
    };
  }

  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return {
      data: createInitialProjectFullData(fallbackProject || { ...DEMO_PROJECT, id: projectId }),
      error: 'AUTHENTICATION_REQUIRED',
    };
  }

  try {
    // Query project_data table
    const { data: row, error } = await supabase
      .from('project_data')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase Load Project Data Error]', error);
      return {
        data: memoryDataCache.get(projectId) || createInitialProjectFullData(fallbackProject || { ...DEMO_PROJECT, id: projectId }),
        error: `Supabase load error: ${error.message}`,
      };
    }

    if (row) {
      const fullData: ProjectFullData = {
        project: fallbackProject || {
          id: projectId,
          name: 'Loaded Project',
          hackathonName: 'Hackathon',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          description: '',
          teamName: 'Team',
          teamMembers: [],
          teamSkills: [],
          isDemo: false,
          createdAt: row.updated_at,
          updatedAt: row.updated_at,
        },
        tasks: Array.isArray(row.tasks) ? row.tasks : [],
        features: Array.isArray(row.features) ? row.features : [],
        scopeItems: Array.isArray(row.scope_items) ? row.scope_items : [],
        ideas: Array.isArray(row.ideas) ? row.ideas : [],
        activities: Array.isArray(row.activities) ? row.activities : [],
        judgeEval: row.judge_eval || initialJudgeEvaluation,
        launchChecklist: Array.isArray(row.launch_checklist) ? row.launch_checklist : initialLaunchChecklist,
        resources: Array.isArray(row.resources) ? row.resources : aiResources,
        pitch: row.pitch || null,
        demoFlow: row.demo_flow || null,
        scopeCutApplied: Boolean(row.scope_cut_applied),
      };

      memoryDataCache.set(projectId, fullData);
      return { data: fullData };
    }

    // Row not yet created for this project: create and return initial structure
    const initialData = createInitialProjectFullData(fallbackProject || { ...DEMO_PROJECT, id: projectId });
    memoryDataCache.set(projectId, initialData);
    return { data: initialData };
  } catch (err: any) {
    return {
      data: memoryDataCache.get(projectId) || createInitialProjectFullData(fallbackProject || { ...DEMO_PROJECT, id: projectId }),
      error: err?.message || 'Failed to fetch project from Supabase.',
    };
  }
}

/**
 * Save full project data back to Supabase.
 * STRICT: Does not write project data to localStorage as primary source of truth.
 */
export async function saveProjectFullData(
  projectId: string, 
  data: ProjectFullData
): Promise<{ success: boolean; error?: string }> {
  // Always update in-memory cache for instantaneous client transitions
  memoryDataCache.set(projectId, data);

  // If in explicit Demo Mode, no cloud persistence needed
  if (projectId === 'demo-doom' || isExplicitDemoMode() || data.project.isDemo) {
    return { success: true };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'HALFTIME storage is not configured. Changes cannot be persisted to Supabase.',
    };
  }

  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      error: 'Authentication expired. Please sign in to persist changes.',
    };
  }

  try {
    const now = new Date().toISOString();
    const { error } = await supabase.from('project_data').upsert({
      project_id: projectId,
      user_id: user.id,
      tasks: data.tasks,
      features: data.features,
      scope_items: data.scopeItems,
      ideas: data.ideas,
      activities: data.activities,
      judge_eval: data.judgeEval,
      launch_checklist: data.launchChecklist,
      resources: data.resources,
      pitch: data.pitch || null,
      demo_flow: data.demoFlow || null,
      scope_cut_applied: data.scopeCutApplied,
      updated_at: now,
    });

    if (error) {
      console.error('[Supabase Save Project Data Error]', error);
      return {
        success: false,
        error: `Failed to persist to Supabase: ${error.message}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase Persistence Error]', err);
    return {
      success: false,
      error: err?.message || 'Failed to persist project data to Supabase.',
    };
  }
}

/**
 * Delete a project from Supabase
 */
export async function deleteProjectFromCloud(projectId: string): Promise<{ success: boolean; error?: string }> {
  if (projectId === 'demo-doom' || isExplicitDemoMode()) {
    memoryDataCache.delete(projectId);
    return { success: true };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Storage is not configured.' };
  }

  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    memoryDataCache.delete(projectId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete project.' };
  }
}

/**
 * Helper to construct clean default project full data
 */
export function createInitialProjectFullData(project: Project): ProjectFullData {
  return {
    project,
    tasks: [],
    features: [],
    scopeItems: [],
    ideas: [],
    activities: [
      {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: `Project "${project.name}" initiated for ${project.hackathonName}`,
        timestamp: 'just now',
        type: 'dashboard',
        badgeColor: '#A8E6CF',
      },
    ],
    judgeEval: {
      overallScore: 8.0,
      statusLabel: 'PLANNING',
      summaryFeedback: 'New project configured. Add core tasks and features to generate real-time judge telemetry.',
      criteria: [
        { name: 'Innovation', weight: 25, score: 8.0, feedback: 'Thesis established. Execute core differentiator.' },
        { name: 'Problem Fit', weight: 20, score: 8.0, feedback: 'Clear hackathon problem statement.' },
        { name: 'Usability', weight: 20, score: 8.0, feedback: 'Design clean visual demo pathway.' },
        { name: 'Execution', weight: 15, score: 8.0, feedback: 'Maintain disciplined MVP scope.' },
        { name: 'Impact', weight: 10, score: 8.0, feedback: 'Address clear developer/user pain point.' },
        { name: 'Feasibility', weight: 10, score: 8.0, feedback: 'Deliverable within sprint timeline.' },
      ],
      whyYouMightLose: 'Maintain strict scope discipline during the first half of the hackathon.',
      fixes: [
        { id: 1, title: 'Define and build core MVP flow first', description: 'Ensure the single most important user action works end-to-end.', scoreBonus: 0.5, applied: false },
        { id: 2, title: 'Prune non-essential settings and tabs', description: 'Eliminate auxiliary code to preserve testing buffer.', scoreBonus: 0.3, applied: false },
      ],
    },
    launchChecklist: initialLaunchChecklist.map(item => ({
      ...item,
      status: item.id === 'l-1' || item.id === 'l-3' ? 'NEEDS_ATTENTION' : 'NOT_STARTED',
    })),
    resources: aiResources,
    pitch: null,
    demoFlow: null,
    scopeCutApplied: false,
  };
}

/**
 * UI Preference Management (Non-authoritative state)
 */
export function getActiveProjectId(): string | null {
  return localStorage.getItem(UI_PREF_KEYS.ACTIVE_PROJECT_ID);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(UI_PREF_KEYS.ACTIVE_PROJECT_ID, id);
}

export function clearActiveProjectId(): void {
  localStorage.removeItem(UI_PREF_KEYS.ACTIVE_PROJECT_ID);
}

export function isExplicitDemoMode(): boolean {
  return localStorage.getItem(UI_PREF_KEYS.DEMO_MODE_ACTIVE) === 'true';
}

export function setExplicitDemoMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(UI_PREF_KEYS.DEMO_MODE_ACTIVE, 'true');
  } else {
    localStorage.removeItem(UI_PREF_KEYS.DEMO_MODE_ACTIVE);
  }
}
