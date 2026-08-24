import { IdeaItem, MVPFeature, ScopeCutItem, JudgeEvaluation, ProjectHealth, SolutionAuditResult, ProjectObjective } from '../types';

export interface IdeaGenerationPrompt {
  teamSkills?: string;
  frustrations?: string;
  interests?: string;
  targetUsers?: string;
  availableTimeHours?: number;
  hackathonCategory?: string;
  hackathonCriteria?: string;
}

export interface RoadmapResult {
  objectives?: ProjectObjective[];
  phases: RoadmapPhase[];
}

/**
 * 1. AUDIT & ADVANCE USER'S SOLUTION (User inputs exact problem + solution -> AI roasts & supercharges)
 */
export async function auditAndAdvanceSolution(input: {
  problemStatement: string;
  proposedSolution: string;
  targetUser?: string;
  projectTitle?: string;
  availableTimeHours?: number;
  teamSkills?: string;
  hackathonCriteria?: string;
}): Promise<SolutionAuditResult> {
  const res = await fetch('/api/ai/advance-solution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.result) {
    return data.result;
  }

  throw new Error(data?.error || 'Failed to advance solution from Gemini.');
}

/**
 * 1b. Legacy Generate Ideas
 */
export async function generateIdeas(input: IdeaGenerationPrompt): Promise<IdeaItem[]> {
  const res = await fetch('/api/ai/generate-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && Array.isArray(data.ideas) && data.ideas.length > 0) {
    return data.ideas;
  }
  if (data?.success && data.result) {
    const r = data.result;
    return [{
      id: `idea-${Date.now()}`,
      title: r.projectTitle || "Advanced Project Solution",
      problem: r.problemStatement || "",
      targetUser: r.targetUser || "",
      solution: r.proposedSolution || "",
      innovationScore: r.innovationScore || 9,
      problemFitScore: r.problemFitScore || 9,
      feasibilityScore: r.feasibilityScore || 8.5,
      demoPotentialScore: r.demoPotentialScore || 9.2,
      verdict: r.brutallyHonestVerdict === 'KILL / PIVOT' ? 'KILL' : r.brutallyHonestVerdict === 'ADVANCE & REFINE' ? 'MODIFY' : 'BUILD',
      verdictReason: r.brutallyHonestFeedback || "Solution analyzed and advanced.",
      whyThisCouldWin: r.whyThisCouldWin,
      whyThisCouldFail: r.whyThisCouldFail,
      advancements: r.advancements,
      tags: ["Advanced", "AI", "User Solution"]
    }];
  }

  throw new Error(data?.error || 'Failed to generate ideas from Gemini.');
}

/**
 * 2. EVALUATE IDEA (Idea Killer / Validator)
 */
export async function evaluateIdea(idea: Partial<IdeaItem>, extra?: {
  availableTime?: number;
  teamSkills?: string;
  hackathonCriteria?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/evaluate-idea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea: idea.title,
      problem: idea.problem,
      targetUser: idea.targetUser,
      solution: idea.solution,
      availableTime: extra?.availableTime,
      teamSkills: extra?.teamSkills,
      hackathonCriteria: extra?.hackathonCriteria,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.evaluation) {
    const ev = data.evaluation;
    return {
      ...idea,
      ...ev,
      innovationScore: ev.innovation || idea.innovationScore || 8.5,
      problemFitScore: ev.problemFit || idea.problemFitScore || 8.5,
      feasibilityScore: ev.feasibility || idea.feasibilityScore || 8.5,
      demoPotentialScore: ev.demoPotential || idea.demoPotentialScore || 8.5,
      usabilityScore: ev.usability || 8.0,
      executionScore: ev.execution || 8.0,
      impactScore: ev.impact || 8.0,
      overallScore: ev.overallScore || 8.2,
      verdict: ev.verdict || 'BUILD',
      verdictReason: ev.verdictReason || 'Evaluated successfully by Gemini.',
      whyThisCouldWin: ev.whyThisCouldWin || (Array.isArray(ev.strengths) ? ev.strengths.join(' • ') : ''),
      whyThisCouldFail: ev.whyThisCouldFail || (Array.isArray(ev.weaknesses) ? ev.weaknesses.join(' • ') : ''),
      whatToChange: ev.whatToChange || (Array.isArray(ev.recommendations) ? ev.recommendations.join(' • ') : ''),
    };
  }

  throw new Error(data?.error || 'Failed to evaluate idea with Gemini.');
}

/**
 * 3. DEFINE THE PROBLEM
 */
export async function defineProblem(params: {
  projectTitle: string;
  description?: string;
  targetUser?: string;
  hackathonName?: string;
}): Promise<ProblemDefinitionResult> {
  const res = await fetch('/api/ai/define-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.problem) {
    return data.problem;
  }

  throw new Error(data?.error || 'Failed to define problem statement.');
}

/**
 * 4. GENERATE MVP
 */
export async function generateMVP(ideaTitle: string, remainingHours: number = 16, details?: {
  problem?: string;
  targetUser?: string;
  solution?: string;
  teamSkills?: string;
}): Promise<{
  problemStatement: string;
  targetUser: string;
  coreSolution: string;
  valueProposition: string;
  coreDemoPath: string;
  estimatedTotalHours?: number;
  features: MVPFeature[];
}> {
  const res = await fetch('/api/ai/generate-mvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ideaTitle,
      remainingHours,
      problem: details?.problem,
      targetUser: details?.targetUser,
      solution: details?.solution,
      teamSkills: details?.teamSkills,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.plan) {
    return data.plan;
  }

  throw new Error(data?.error || 'Failed to generate MVP plan from Gemini.');
}

/**
 * 5. GENERATE BUILD ROADMAP
 */
export async function generateRoadmap(params: {
  projectTitle: string;
  mvpFeatures?: MVPFeature[];
  teamMembers?: string[];
  availableHours?: number;
}): Promise<RoadmapResult> {
  const res = await fetch('/api/ai/generate-roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.roadmap) {
    return data.roadmap;
  }

  throw new Error(data?.error || 'Failed to generate roadmap from Gemini.');
}

/**
 * 6. RECOMMEND NEXT ACTION (Halftime Says)
 */
export async function recommendNextAction(params: {
  timeRemaining?: string | number;
  workRemaining?: string | number;
  tasks?: any[];
  teamMembers?: any[];
  currentProject?: string;
  projectHealth?: any;
  riskStatus?: string;
  scopeCutApplied?: boolean;
}): Promise<any> {
  const res = await fetch('/api/ai/recommend-next-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.recommendation) {
    return data.recommendation;
  }

  throw new Error(data?.error || 'Failed to get recommendation from Gemini.');
}

/**
 * 7. SCOPE CUTTER - Real Gemini Cuts
 */
export async function recommendScopeCuts(params: {
  project?: string;
  features?: any[];
  remainingTime?: string;
  remainingWork?: string;
  judgingCriteria?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/recommend-scope-cuts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.scopeCuts) {
    return data.scopeCuts;
  }

  throw new Error(data?.error || 'Failed to get scope cut recommendation.');
}

/**
 * 8. RECOMMEND A TOOL
 */
export async function recommendTool(params: {
  task: string;
  timeAvailableHours?: number;
  teamSkills?: string;
  existingStack?: string;
  budgetConstraint?: string;
}): Promise<ToolRecommendationResult> {
  const res = await fetch('/api/ai/recommend-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.recommendation) {
    return data.recommendation;
  }

  throw new Error(data?.error || 'Failed to get tool recommendation.');
}

/**
 * 9. JUDGE PROJECT
 */
export async function judgeProject(params: {
  scopeCutApplied: boolean;
  projectName?: string;
  problem?: string;
  solution?: string;
  features?: any[];
}): Promise<JudgeEvaluation> {
  const res = await fetch('/api/ai/judge-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.evaluation) {
    return data.evaluation;
  }

  throw new Error(data?.error || 'Failed to run judge evaluation.');
}

/**
 * 10. IMPROVE PITCH / PITCH COACH
 */
export async function improvePitch(params: {
  projectName?: string;
  problem?: string;
  targetUser?: string;
  solution?: string;
  demoMoment?: string;
  impact?: string;
}): Promise<PitchCoachResult> {
  const res = await fetch('/api/ai/pitch-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.pitch) {
    return data.pitch;
  }

  throw new Error(data?.error || 'Failed to improve pitch with Gemini.');
}

/**
 * 11. GENERATE DEMO FLOW
 */
export async function generateDemoFlow(params: {
  projectName?: string;
  solution?: string;
  features?: any[];
}): Promise<DemoFlowResult> {
  const res = await fetch('/api/ai/generate-demo-flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.demoFlow) {
    return data.demoFlow;
  }

  throw new Error(data?.error || 'Failed to generate demo flow.');
}

/**
 * 12. DETECT RISKS
 */
export async function detectRisks(params: {
  timeRemainingHours: number;
  workRemainingHours: number;
  criticalTasksCount: number;
  incompleteCriticalTasks: string[];
}): Promise<{
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  riskFactors: string[];
  recommendedAction: string;
}> {
  const res = await fetch('/api/ai/detect-risks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  const data = await res.json();
  if (data?.success && data.risks) {
    return data.risks;
  }

  throw new Error(data?.error || 'Failed to detect risks.');
}
