import { IdeaItem, MVPFeature, ScopeCutItem, JudgeEvaluation, ProjectHealth, SolutionAuditResult, ProjectObjective, ToolRecommendationResult, RoadmapPhase, ProblemDefinitionResult, PitchCoachResult, DemoFlowResult } from '../types';

const CUSTOM_API_KEY_STORAGE = 'halftime_custom_gemini_api_key';

export function getCustomApiKey(): string | null {
  try {
    return localStorage.getItem(CUSTOM_API_KEY_STORAGE) || null;
  } catch {
    return null;
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(CUSTOM_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
    }
  } catch {}
}

export function removeCustomApiKey(): void {
  try {
    localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
  } catch {}
}

export async function validateCustomApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('/api/validate-key', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-gemini-api-key': apiKey.trim(),
      },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });
    const data = await res.json();
    if (res.ok && data?.success) {
      return { valid: true };
    }
    return { valid: false, error: data?.error || 'Invalid Gemini API key.' };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Network error while testing key.' };
  }
}

async function postAiEndpoint(endpoint: string, body: any): Promise<any> {
  const customKey = getCustomApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 429 || (errorData.error && errorData.error.toLowerCase().includes('quota'))) {
      throw new Error(
        'Gemini API quota exhausted on the shared server key. Click the API Key button in the top bar to use your own free key.'
      );
    }
    throw new Error(errorData.error || 'HALFTIME AI is temporarily unavailable. Please try again.');
  }

  return await res.json();
}

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
 * 1. AUDIT & ADVANCE USER'S SOLUTION
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
  const data = await postAiEndpoint('/api/ai/advance-solution', input);
  if (data?.success && data.result) {
    return data.result;
  }
  throw new Error(data?.error || 'Failed to advance solution from Gemini.');
}

/**
 * 1b. Legacy Generate Ideas
 */
export async function generateIdeas(input: IdeaGenerationPrompt): Promise<IdeaItem[]> {
  const data = await postAiEndpoint('/api/ai/generate-ideas', input);
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
 * 2. EVALUATE IDEA
 */
export async function evaluateIdea(idea: Partial<IdeaItem>, extra?: {
  availableTime?: number;
  teamSkills?: string;
  hackathonCriteria?: string;
}): Promise<any> {
  const data = await postAiEndpoint('/api/ai/evaluate-idea', {
    idea: idea.title,
    problem: idea.problem,
    targetUser: idea.targetUser,
    solution: idea.solution,
    availableTime: extra?.availableTime,
    teamSkills: extra?.teamSkills,
    hackathonCriteria: extra?.hackathonCriteria,
  });

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
  const data = await postAiEndpoint('/api/ai/define-problem', params);
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
  estimatedTotalHours: number;
  features: MVPFeature[];
  coreDemoPath: string[];
}> {
  const data = await postAiEndpoint('/api/ai/generate-mvp', {
    ideaTitle,
    remainingHours,
    ...details,
  });

  if (data?.success && data.plan) {
    return data.plan;
  }
  throw new Error(data?.error || 'Failed to generate MVP plan from Gemini.');
}

/**
 * 5. GENERATE ROADMAP
 */
export async function generateRoadmap(params: {
  projectTitle: string;
  mvpFeatures: MVPFeature[];
  teamMembers?: string[];
  availableHours?: number;
}): Promise<RoadmapResult> {
  const data = await postAiEndpoint('/api/ai/generate-roadmap', params);
  if (data?.success && data.roadmap) {
    return data.roadmap;
  }
  throw new Error(data?.error || 'Failed to generate build roadmap.');
}

/**
 * 6. RECOMMEND NEXT ACTION
 */
export async function recommendNextAction(params: {
  timeRemaining?: number | string;
  workRemaining?: number | string;
  tasks?: any[];
  teamMembers?: any[];
  currentProject?: string;
  projectHealth?: any;
  riskStatus?: string;
  scopeCutApplied?: boolean;
}): Promise<any> {
  const data = await postAiEndpoint('/api/ai/recommend-next-action', params);
  if (data?.success && data.recommendation) {
    return data.recommendation;
  }
  throw new Error(data?.error || 'Failed to get recommendation from Gemini.');
}

/**
 * 7. SCOPE CUTTER
 */
export async function recommendScopeCuts(params: {
  project?: string;
  features?: any[];
  remainingTime?: string;
  remainingWork?: string;
  judgingCriteria?: string;
}): Promise<any> {
  const data = await postAiEndpoint('/api/ai/recommend-scope-cuts', params);
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
  const data = await postAiEndpoint('/api/ai/recommend-tool', params);
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
  const data = await postAiEndpoint('/api/ai/judge-project', params);
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
  const data = await postAiEndpoint('/api/ai/pitch-coach', params);
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
  const data = await postAiEndpoint('/api/ai/generate-demo-flow', params);
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
  const data = await postAiEndpoint('/api/ai/detect-risks', params);
  if (data?.success && data.risks) {
    return data.risks;
  }
  throw new Error(data?.error || 'Failed to detect risks.');
}
