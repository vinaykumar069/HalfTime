export type NavigationTab = 
  | 'overview' 
  | 'idea-lab' 
  | 'mvp-planner' 
  | 'tasks' 
  | 'resources' 
  | 'judge-mode' 
  | 'launch';

export type HealthStatus = 'on-track' | 'at-risk' | 'critical';

export interface Project {
  id: string;
  userId?: string;
  name: string;
  hackathonName: string;
  description: string;
  deadline: string; // ISO String (e.g. 2026-08-23T14:40:00.000Z)
  teamName?: string;
  teamMembers?: string[];
  teamSkills?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHealth {
  score: number; // e.g. 72 or 94
  status: HealthStatus;
  timeAvailableHours: number; // e.g. 11
  workRequiredHours: number; // e.g. 14 or 10.25
  capacityGapHours: number; // e.g. 3 or 0
  mvpPercent: number; // 82
  mvpStatus: string; // 'ON TRACK'
  scopePercent: number; // 64 or 96
  scopeStatus: string; // 'TOO LARGE' or 'OPTIMAL'
  teamPercent: number; // 91
  teamStatus: string; // 'ON TRACK'
  resourcesPercent: number; // 48
  resourcesStatus: string; // 'LIMITED'
  testingPercent: number; // 31
  testingStatus: string; // 'NEEDS ATTENTION'
}

export interface ScopeCutItem {
  id: string;
  name: string;
  category: string;
  timeMinutes: number; // e.g. 120 for 2h
  timeFormatted: string; // '-2h'
  reason: string;
  selectedForCut: boolean;
  isCut: boolean;
  impactScore: string; // 'Zero demo impact'
}

export interface SolutionAdvancement {
  title: string;
  howItImprovesSolution: string;
  impactOnJudging: string;
  estimatedExtraTimeMinutes: number;
}

export interface ProjectObjective {
  objectiveNumber: number;
  title: string;
  description: string;
  estimatedTime: string;
  tasks: Array<{
    title: string;
    owner: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedMinutes: number;
    dependencies: string;
  }>;
}

export interface SolutionAuditResult {
  projectTitle: string;
  problemStatement: string;
  proposedSolution: string;
  targetUser: string;
  brutallyHonestVerdict: 'BUILD AS IS' | 'ADVANCE & REFINE' | 'KILL / PIVOT';
  brutallyHonestFeedback: string;
  whyThisCouldWin: string;
  whyThisCouldFail: string;
  advancements: SolutionAdvancement[];
  objectives: ProjectObjective[];
  innovationScore: number;
  problemFitScore: number;
  feasibilityScore: number;
  demoPotentialScore: number;
  overallScore: number;
}

export interface IdeaItem {
  id: string;
  title: string;
  problem: string;
  targetUser: string;
  solution: string;
  innovationScore: number;
  problemFitScore: number;
  feasibilityScore: number;
  demoPotentialScore: number;
  usabilityScore?: number;
  executionScore?: number;
  impactScore?: number;
  overallScore?: number;
  verdict: 'BUILD' | 'MODIFY' | 'KILL';
  verdictReason: string;
  whyThisCouldWin?: string;
  whyThisCouldFail?: string;
  whatToChange?: string;
  advancements?: SolutionAdvancement[];
  tags: string[];
}

export type FeaturePriority = 'MUST_BUILD' | 'SHOULD_BUILD' | 'NICE_TO_HAVE' | 'CUT';

export interface MVPFeature {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  priority: FeaturePriority;
  demoCritical: boolean;
  category: 'Core AI' | 'UI / Polish' | 'Infrastructure' | 'Add-on';
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskItem {
  id: string;
  title: string;
  owner: string;
  role: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedTime: string;
  estimatedMinutes: number;
  reason?: string;
  activeSince?: number;
  objectiveGroup?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Builder' | 'Designer' | 'Growth' | 'Product' | 'AI Eng';
  avatar: string;
  tasksActiveCount: number;
  status: 'online' | 'busy' | 'away';
}

export interface AIResourceItem {
  id: string;
  tool: string;
  provider: string;
  resourceType?: string;
  budgetLimit?: number;
  currentUsage?: number;
  unit?: string;
  remainingPercent: number;
  creditsLabel: string;
  recommendedUse: string;
  burnRate: 'Low' | 'Medium' | 'High';
  statusNote: string;
  resetDate?: string;
  notes?: string;
  isUserEntered?: boolean;
}

export interface UserResourceItem {
  id: string;
  toolName: string;
  provider: string;
  resourceType: string;
  budgetLimit: number;
  currentUsage: number;
  unit: string;
  resetDate?: string;
  notes?: string;
  createdAt: string;
}

export interface JudgeRubricItem {
  id: string;
  category: string;
  weight: number;
  score: number;
  criteria: string;
  tip: string;
}

export interface JudgeEvaluation {
  predictedScore: number;
  maxScore: number;
  percentile: string;
  status: 'WINNING ZONE' | 'FINALIST' | 'BORDERLINE' | 'UNRANKED';
  rubric: JudgeRubricItem[];
  strengths: string[];
  vulnerabilities: string[];
}

export interface LaunchChecklistItem {
  id: string;
  category: string;
  label: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'cut' | 'task' | 'eval' | 'timer' | 'mvp';
  badgeColor?: string;
}

export interface PitchCoachResult {
  problem: string;
  whyItMatters: string;
  solution: string;
  howItWorks: string;
  demoMoment: string;
  impact: string;
  whyNow: string;
  script: string;
  durationSeconds: number;
  keyTakeaway: string;
}

export interface DemoFlowStep {
  stepNumber: number;
  action: string;
  whatToSay: string;
  visualCue: string;
}

export interface DemoFlowResult {
  openingHook: string;
  problemSetup: string;
  solutionReveal: string;
  demoSteps: DemoFlowStep[];
  wowMoment: string;
  technicalHighlights: string;
  closingCallToAction: string;
  estimatedDurationSeconds: number;
}
