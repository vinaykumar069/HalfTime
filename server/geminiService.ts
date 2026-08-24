import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import { GoogleGenAI, Type } from "@google/genai";

// Default model verified against current Google GenAI API
export const GEMINI_MODEL = "gemini-3.6-flash";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * 1. AUDIT & ADVANCE USER'S SOLUTION (No random unsolicited ideas - takes user problem + solution)
 */
export async function auditAndAdvanceIdeaServer(params: {
  problemStatement: string;
  proposedSolution: string;
  targetUser?: string;
  projectTitle?: string;
  availableTimeHours?: number;
  teamSkills?: string;
  hackathonCriteria?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's brutally honest AI Co-Founder and Senior Hackathon Judge.
Do NOT generate your own random ideas. The user is providing their EXACT problem statement and proposed solution.
Your job is to:
1. Provide a brutally honest, unfiltered critique of where this idea might fail in front of judges or run out of time.
2. Formulate 2 to 3 strategic "Advancements / Superchargers" that 10x the solution's impact without expanding the build scope.
3. Break the solution down into 3 to 4 sequential Project Objectives (concrete milestone steps).
4. Score the concept realistically across hackathon metrics (0-10).

USER'S SUBMISSION:
- Project Title: ${params.projectTitle || "User Project"}
- Problem Statement: "${params.problemStatement}"
- Proposed Solution: "${params.proposedSolution}"
- Target User: ${params.targetUser || "Developers / Consumers"}
- Hackathon Runway: ${params.availableTimeHours || 12} hours
- Team Stack: ${params.teamSkills || "Fullstack & AI"}
- Judging Rubric: ${params.hackathonCriteria || "Innovation 25%, Problem Fit 20%, Usability 20%, Execution 15%, Impact 10%, Feasibility 10%"}

CRITICAL RULES:
- Be brutally direct. If the problem is too broad, call it out. If the solution is a glorified wrapper, warn them about the VC roast question.
- Advancements MUST be actionable in a hackathon (e.g. adding a real-time reactive trigger, a deterministic fallback, or an unforgettable 30-second live demo moment).
- Break the implementation into concrete "Objectives" (Objective 1, Objective 2, Objective 3, Objective 4).

Return strict JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectTitle: { type: Type.STRING },
          problemStatement: { type: Type.STRING },
          proposedSolution: { type: Type.STRING },
          targetUser: { type: Type.STRING },
          brutallyHonestVerdict: {
            type: Type.STRING,
            enum: ["BUILD AS IS", "ADVANCE & REFINE", "KILL / PIVOT"],
          },
          brutallyHonestFeedback: { type: Type.STRING },
          whyThisCouldWin: { type: Type.STRING },
          whyThisCouldFail: { type: Type.STRING },
          innovationScore: { type: Type.NUMBER },
          problemFitScore: { type: Type.NUMBER },
          feasibilityScore: { type: Type.NUMBER },
          demoPotentialScore: { type: Type.NUMBER },
          overallScore: { type: Type.NUMBER },
          advancements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                howItImprovesSolution: { type: Type.STRING },
                impactOnJudging: { type: Type.STRING },
                estimatedExtraTimeMinutes: { type: Type.NUMBER },
              },
              required: ["title", "howItImprovesSolution", "impactOnJudging", "estimatedExtraTimeMinutes"],
            },
          },
          objectives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                objectiveNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedTime: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      owner: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                      estimatedMinutes: { type: Type.NUMBER },
                      dependencies: { type: Type.STRING },
                    },
                    required: ["title", "owner", "priority", "estimatedMinutes", "dependencies"],
                  },
                },
              },
              required: ["objectiveNumber", "title", "description", "estimatedTime", "tasks"],
            },
          },
        },
        required: [
          "projectTitle",
          "problemStatement",
          "proposedSolution",
          "targetUser",
          "brutallyHonestVerdict",
          "brutallyHonestFeedback",
          "whyThisCouldWin",
          "whyThisCouldFail",
          "innovationScore",
          "problemFitScore",
          "feasibilityScore",
          "demoPotentialScore",
          "overallScore",
          "advancements",
          "objectives",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response received from Gemini.");
  return JSON.parse(text);
}

/**
 * 1b. (Legacy compatibility wrapper)
 */
export async function generateIdeasServer(params: any) {
  return auditAndAdvanceIdeaServer({
    problemStatement: params.frustrations || "Hackathon teams waste time building wrong features",
    proposedSolution: params.interests || "AI War room that enforces ruthless scope cuts and live pitch rehearsal",
    targetUser: params.targetUsers || "Hackathon developers",
    projectTitle: "Hackathon Copilot",
    availableTimeHours: params.availableTimeHours || 12,
    teamSkills: params.teamSkills,
    hackathonCriteria: params.hackathonCriteria,
  });
}

/**
 * 2. IDEA EVALUATOR / KILLER - Critical evaluation
 */
export async function evaluateIdeaServer(params: {
  idea: string;
  problem?: string;
  targetUser?: string;
  solution?: string;
  availableTime?: number;
  teamSkills?: string;
  hackathonCriteria?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's brutally honest Idea Evaluator & Hackathon Judge.
Critically evaluate this hackathon project concept.

Concept Title: ${params.idea}
Problem Statement: ${params.problem || "Not specified"}
Target User: ${params.targetUser || "General users"}
Proposed Solution: ${params.solution || "Not specified"}
Time Constraint: ${params.availableTime || 24} hours
Team Stack: ${params.teamSkills || "React, TypeScript, Python"}
Judging Criteria: ${params.hackathonCriteria || "Innovation 25%, Problem Fit 20%, Usability 20%, Execution 15%, Impact 10%, Feasibility 10%"}

CRITICAL INSTRUCTIONS:
- Do NOT blindly praise the idea. Be a skeptical, experienced hackathon judge.
- Verdict must strictly be one of:
  * "BUILD": Clear pain point, achievable MVP within ${params.availableTime || 24}h, strong 3-minute demo moment.
  * "MODIFY": Strong core problem, but scope is bloated or target user is too broad; needs narrowing.
  * "KILL": Solves a crowded problem without differentiation, unfeasible in ${params.availableTime || 24}h, or boring demo.

Return JSON with rigorous breakdown.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["BUILD", "MODIFY", "KILL"] },
          verdictReason: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          innovation: { type: Type.NUMBER },
          problemFit: { type: Type.NUMBER },
          usability: { type: Type.NUMBER },
          execution: { type: Type.NUMBER },
          impact: { type: Type.NUMBER },
          feasibility: { type: Type.NUMBER },
          demoPotential: { type: Type.NUMBER },
          whyThisCouldWin: { type: Type.STRING },
          whyThisCouldFail: { type: Type.STRING },
          whatToChange: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "verdict",
          "verdictReason",
          "overallScore",
          "innovation",
          "problemFit",
          "usability",
          "execution",
          "impact",
          "feasibility",
          "demoPotential",
          "whyThisCouldWin",
          "whyThisCouldFail",
          "whatToChange",
          "strengths",
          "weaknesses",
          "recommendations",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response received from Gemini.");
  return JSON.parse(text);
}

/**
 * 3. DEFINE THE PROBLEM - Real Problem Statement Generator
 */
export async function defineProblemServer(params: {
  projectTitle: string;
  description?: string;
  targetUser?: string;
  hackathonName?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's Problem Statement Architect.
Generate a structured, judge-ready Problem Statement for this hackathon project:

- Project Title: ${params.projectTitle}
- Description: ${params.description || "Hackathon tool"}
- Target User: ${params.targetUser || "Developers & builders"}
- Hackathon: ${params.hackathonName || "Hackathon"}

Generate:
1. problemStatement (A single crisp, punchy sentence defining the core problem)
2. targetUser (Specific persona experiencing this problem)
3. painPoint (The visceral friction/cost)
4. currentAlternative (What they do today without this tool)
5. whyExistingSolutionsFail (Why status quo is inadequate)
6. desiredOutcome (The measurable end state)
7. successCriteria (How judges know it worked)`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemStatement: { type: Type.STRING },
          targetUser: { type: Type.STRING },
          painPoint: { type: Type.STRING },
          currentAlternative: { type: Type.STRING },
          whyExistingSolutionsFail: { type: Type.STRING },
          desiredOutcome: { type: Type.STRING },
          successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "problemStatement",
          "targetUser",
          "painPoint",
          "currentAlternative",
          "whyExistingSolutionsFail",
          "desiredOutcome",
          "successCriteria",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 4. MVP PLANNER - Scope-controlled MVP generation
 */
export async function generateMVPServer(params: {
  ideaTitle: string;
  problem?: string;
  targetUser?: string;
  solution?: string;
  remainingHours?: number;
  teamSkills?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const hours = params.remainingHours || 16;

  const prompt = `You are HALFTIME MVP Architect.
Design a razor-sharp, scope-controlled MVP for the following hackathon project:

- Project Title: ${params.ideaTitle}
- Problem: ${params.problem || "Hackathon pain point"}
- Target User: ${params.targetUser || "Hackathon participants"}
- Solution: ${params.solution || "Streamlined AI tool"}
- Total Hackathon Runway: ${hours} hours
- Team Stack: ${params.teamSkills || "React, TypeScript, Node.js"}

CRITICAL REQUIREMENT:
The total MUST BUILD features MUST easily be achievable within ${Math.max(4, Math.floor(hours * 0.6))} hours so the team has time left to rehearse pitch and test live demo.
Aggressively classify features into:
- MUST_BUILD: 2-3 essential features without which there is no demo.
- SHOULD_BUILD: 1-2 features that strengthen the pitch if time permits.
- NICE_TO_HAVE: 1-2 visual polish items.
- CUT: 2-3 scope traps (e.g., full authentication, custom billing, deep settings, excessive charts) that must be avoided.

Also provide:
- coreDemoPath (The exact 3-step sequence to show judges in 45 seconds)
- estimatedTotalHours (Sum of MUST_BUILD hours)`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemStatement: { type: Type.STRING },
          targetUser: { type: Type.STRING },
          coreSolution: { type: Type.STRING },
          valueProposition: { type: Type.STRING },
          estimatedTotalHours: { type: Type.NUMBER },
          coreDemoPath: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER },
                priority: {
                  type: Type.STRING,
                  enum: ["MUST_BUILD", "SHOULD_BUILD", "NICE_TO_HAVE", "CUT"],
                },
                demoCritical: { type: Type.BOOLEAN },
                category: {
                  type: Type.STRING,
                  enum: ["Core AI", "UI / Polish", "Infrastructure", "Add-on"],
                },
              },
              required: ["name", "description", "estimatedHours", "priority", "demoCritical", "category"],
            },
          },
        },
        required: [
          "problemStatement",
          "targetUser",
          "coreSolution",
          "valueProposition",
          "features",
          "coreDemoPath",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  const parsed = JSON.parse(text);

  return {
    ...parsed,
    features: parsed.features.map((f: any, i: number) => ({
      id: f.id || `mvp-feat-${Date.now()}-${i + 1}`,
      name: f.name,
      description: f.description,
      estimatedHours: Number(f.estimatedHours) || 1.5,
      priority: f.priority,
      demoCritical: Boolean(f.demoCritical),
      category: f.category || "Core AI",
    })),
  };
}

/**
 * 5. GENERATE BUILD ROADMAP
 */
export async function generateRoadmapServer(params: {
  projectTitle: string;
  mvpFeatures?: any[];
  teamMembers?: string[];
  availableHours?: number;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const teamList = params.teamMembers && params.teamMembers.length > 0 
    ? params.teamMembers.join(", ") 
    : "Builder, Designer, Product, Growth";

  const prompt = `You are HALFTIME's Sprint Lead.
Generate EXACTLY 3 high-level Project Objectives for this hackathon build. Keep them dead simple, human-readable, and grouped:

- Project: ${params.projectTitle}
- Available Hours: ${params.availableHours || 12} hours
- Team Members: ${teamList}
- MVP Features: ${JSON.stringify(params.mvpFeatures || [])}

Generate EXACTLY 3 simple objectives:
- Objective 1: Core AI & Logic Setup (2-3 sub-tasks)
- Objective 2: User Interface & Core Flow (2-3 sub-tasks)
- Objective 3: Live Demo Safety & Polish (2-3 sub-tasks)

Under each objective, group 2-3 simple sub-tasks in plain everyday English. Assign each sub-task to one of the team members: [${teamList}].

Return JSON with an objectives array.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objectives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                objectiveNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedTime: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      owner: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                      estimatedMinutes: { type: Type.NUMBER },
                      dependencies: { type: Type.STRING },
                    },
                    required: ["title", "owner", "priority", "estimatedMinutes", "dependencies"],
                  },
                },
              },
              required: ["objectiveNumber", "title", "description", "estimatedTime", "tasks"],
            },
          },
        },
        required: ["objectives"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  const parsed = JSON.parse(text);
  
  // Provide backward-compatible phases mapping alongside objectives
  return {
    ...parsed,
    phases: (parsed.objectives || []).map((obj: any) => ({
      phaseName: obj.title || `Objective ${obj.objectiveNumber}`,
      estimatedTime: obj.estimatedTime || '2h',
      tasks: obj.tasks || [],
    })),
  };
}

/**
 * 6. NEXT ACTION RECOMMENDATION - Halftime Next Move
 */
export async function recommendNextActionServer(params: {
  timeRemaining?: number | string;
  workRemaining?: number | string;
  tasks?: any[];
  teamMembers?: any[];
  currentProject?: string;
  projectHealth?: any;
  riskStatus?: string;
  scopeCutApplied?: boolean;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME AI Mission Director for Hackathons.
Given the current project state:

- Project Name: ${params.currentProject || "HALFTIME Command Center"}
- Time Available Before Freeze: ${params.timeRemaining || "11h 00m"}
- Backlog Work Remaining: ${params.workRemaining || (params.scopeCutApplied ? "10h 15m" : "14h 00m")}
- Health Status: ${params.riskStatus || (params.scopeCutApplied ? "ON TRACK (94%)" : "AT RISK (72%)")}
- Scope Cut Applied: ${params.scopeCutApplied ? "Yes" : "No"}

Question: "What is the single most valuable thing this team should do next?"

Guidelines:
- If over capacity and scope cut is not applied: Urgently recommend cutting secondary features to recover time.
- If on track: Recommend finishing the anchor core AI evaluation flow and testing the 30-second live demo hook.

Return concise JSON with:
nextAction (concise title)
priority ("CRITICAL" | "HIGH")
estimatedTime (e.g. "1h 20m" or "45m")
reason (why everything else depends on this)
risk (what breaks if ignored)
alternativeAction (fallback if blocked)`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nextAction: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["CRITICAL", "HIGH"] },
          estimatedTime: { type: Type.STRING },
          reason: { type: Type.STRING },
          risk: { type: Type.STRING },
          alternativeAction: { type: Type.STRING },
        },
        required: ["nextAction", "priority", "estimatedTime", "reason", "risk", "alternativeAction"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 7. SCOPE CUTTER - AI reasoning on what to cut
 */
export async function recommendScopeCutsServer(params: {
  project?: string;
  features?: any[];
  remainingTime?: string;
  remainingWork?: string;
  judgingCriteria?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME Scope Cutter AI.
Identify exactly which 3 features this hackathon team should cut immediately to eliminate their capacity deficit while preserving 100% of their demo wow-factor and judging score.

- Project: ${params.project || "HALFTIME"}
- Time Available: ${params.remainingTime || "11 hours"}
- Work Backlog: ${params.remainingWork || "14 hours (3 hours over capacity)"}
- Criteria: ${params.judgingCriteria || "DoraHacks 2.0 (Innovation 25%, Problem Fit 20%, Usability 20%, Execution 15%, Impact 10%, Feasibility 10%)"}

Evaluate features to cut (e.g. complex user profiles, analytics dashboards, deep custom settings, multi-step auth).

Return JSON with 3 recommended cuts.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalRecoverableHours: { type: Type.NUMBER },
          cuts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                timeMinutes: { type: Type.NUMBER },
                timeFormatted: { type: Type.STRING },
                reason: { type: Type.STRING },
                impactScore: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ["name", "category", "timeMinutes", "timeFormatted", "reason", "impactScore", "recommendation"],
            },
          },
        },
        required: ["totalRecoverableHours", "cuts"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 8. RECOMMEND A TOOL
 */
export async function recommendToolServer(params: {
  task: string;
  timeAvailableHours?: number;
  teamSkills?: string;
  existingStack?: string;
  budgetConstraint?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's Stack & AI Tool Advisor.
Recommend the most optimal, fastest tool or SDK for this hackathon task:

- Task: ${params.task}
- Time Available: ${params.timeAvailableHours || 8} hours
- Team Skills: ${params.teamSkills || "TypeScript, React"}
- Existing Stack: ${params.existingStack || "Vite, Tailwind, Node"}
- Budget/Resource Limits: ${params.budgetConstraint || "Free tier / standard credits"}

Return:
- recommendedTool
- why (why this is fastest for hackathon execution)
- setupCost (e.g. "Free / 5 min install")
- estimatedTimeSaved (e.g. "2 hours vs custom implementation")
- alternative (fallback option)`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedTool: { type: Type.STRING },
          why: { type: Type.STRING },
          setupCost: { type: Type.STRING },
          estimatedTimeSaved: { type: Type.STRING },
          alternative: { type: Type.STRING },
        },
        required: ["recommendedTool", "why", "setupCost", "estimatedTimeSaved", "alternative"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 9. JUDGE MODE - Shark Tank Rubric & Archetype Evaluation
 */
export async function judgeProjectServer(params: {
  problem?: string;
  targetUser?: string;
  solution?: string;
  projectName?: string;
  features?: any[];
  scopeCutApplied?: boolean;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are a panel of 3 cynical, experienced hackathon judges evaluating a submission:
- Project Name: ${params.projectName || "Hackathon Project"}
- Problem Solved: ${params.problem || "Developers waste time on bloated hackathon features"}
- Proposed Solution: ${params.solution || "AI War room with 1-click Scope Cutter and live pitch teleprompter"}
- Scope Cut Applied: ${params.scopeCutApplied ? "YES (Team cut 3h 45m of dead weight)" : "NO (Team is over capacity)"}

Evaluate this project through 3 distinct judge personalities:
1. The Cynical VC Judge (Focus: Moat, Defensibility, Business Model, "Why won't OpenAI build this?")
2. The Hardcore Tech Judge (Focus: Architecture, Code Quality, Systems Engineering, API depth vs wrapper)
3. The Design & UX Judge (Focus: 5-second clarity, User Experience, mobile flow, stage demo punch)

For EACH judge archetype, generate:
- mainRoast: The brutal, uncomfortable question they will ask on stage.
- defense: The exact 1-2 sentence winning counter-argument the team should say to stun them.
- critiqueScore: e.g. "9.2 / 10"

Also provide:
- overallScore: Number between 7.5 and 9.8 (if scope cut is applied give ~9.1 - 9.5; if not give ~8.2 - 8.7)
- statusLabel: "WINNING ZONE" | "FINALIST CONTENDER" | "BORDERLINE RISK"
- whyYouMightLose: The #1 pitfall that could cost them the prize.
- fixes: 4 concrete pre-submission fixes with score bonuses.

Return structured JSON.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          statusLabel: { type: Type.STRING },
          whyYouMightLose: { type: Type.STRING },
          judges: {
            type: Type.OBJECT,
            properties: {
              vc: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                  mainRoast: { type: Type.STRING },
                  defense: { type: Type.STRING },
                  critiqueScore: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ["name", "title", "avatar", "mainRoast", "defense", "critiqueScore", "tag"],
              },
              tech: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                  mainRoast: { type: Type.STRING },
                  defense: { type: Type.STRING },
                  critiqueScore: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ["name", "title", "avatar", "mainRoast", "defense", "critiqueScore", "tag"],
              },
              ux: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                  mainRoast: { type: Type.STRING },
                  defense: { type: Type.STRING },
                  critiqueScore: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ["name", "title", "avatar", "mainRoast", "defense", "critiqueScore", "tag"],
              },
            },
            required: ["vc", "tech", "ux"],
          },
          fixes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                desc: { type: Type.STRING },
              },
              required: ["id", "title", "desc"],
            },
          },
        },
        required: ["overallScore", "statusLabel", "whyYouMightLose", "judges", "fixes"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 10. PITCH COACH - 60-90s Spoken Pitch Script
 */
export async function improvePitchServer(params: {
  projectName?: string;
  problem?: string;
  targetUser?: string;
  solution?: string;
  demoMoment?: string;
  impact?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's Pitch Coach.
Generate a punchy, high-conversion 60-90 second hackathon pitch script for judges.

Project: ${params.projectName || "HALFTIME"}
Problem: ${params.problem || "Teams run out of time and fail to ship working demos"}
Solution: ${params.solution || "AI halftime telemetry and 1-click Scope Cutter"}
Demo Moment: ${params.demoMoment || "Live 1-click Scope Cut that turns a deficit into a buffer"}
Impact: ${params.impact || "Empowers thousands of hackathon builders globally to ship on time"}

Structure:
1. Problem (The visceral pain)
2. Why it matters (The human & financial cost)
3. Solution (The concise thesis)
4. How it works (The 3-step mechanics)
5. Demo moment (The visual proof point)
6. Impact & Market (The future potential)
7. Why now (The LLM paradigm shift)
8. Script (Word-for-word 75-second spoken script with delivery cues)

Return structured JSON.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          whyItMatters: { type: Type.STRING },
          solution: { type: Type.STRING },
          howItWorks: { type: Type.STRING },
          demoMoment: { type: Type.STRING },
          impact: { type: Type.STRING },
          whyNow: { type: Type.STRING },
          script: { type: Type.STRING },
          durationSeconds: { type: Type.INTEGER },
          keyTakeaway: { type: Type.STRING },
        },
        required: [
          "problem",
          "whyItMatters",
          "solution",
          "howItWorks",
          "demoMoment",
          "impact",
          "whyNow",
          "script",
          "durationSeconds",
          "keyTakeaway",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 11. GENERATE DEMO FLOW
 */
export async function generateDemoFlowServer(params: {
  projectName?: string;
  solution?: string;
  features?: any[];
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME's Demo Day Director.
Generate a bulletproof 3-minute live demonstration flow for this project:

- Project: ${params.projectName || "Hackathon Project"}
- Solution: ${params.solution || "AI Solution"}
- Features: ${JSON.stringify(params.features || [])}

Generate:
- openingHook (15s attention grabber)
- problemSetup (25s establishing the user pain)
- solutionReveal (20s presenting the app)
- demoSteps (Step-by-step 90s visual journey)
- wowMoment (The high-impact climax that judges remember)
- technicalHighlights (30s explaining the architecture / Gemini integration)
- closingCallToAction (10s wrap up)
- estimatedDurationSeconds (total demo time in seconds, around 180s)`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          openingHook: { type: Type.STRING },
          problemSetup: { type: Type.STRING },
          solutionReveal: { type: Type.STRING },
          demoSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                action: { type: Type.STRING },
                whatToSay: { type: Type.STRING },
                visualCue: { type: Type.STRING },
              },
              required: ["stepNumber", "action", "whatToSay", "visualCue"],
            },
          },
          wowMoment: { type: Type.STRING },
          technicalHighlights: { type: Type.STRING },
          closingCallToAction: { type: Type.STRING },
          estimatedDurationSeconds: { type: Type.INTEGER },
        },
        required: [
          "openingHook",
          "problemSetup",
          "solutionReveal",
          "demoSteps",
          "wowMoment",
          "technicalHighlights",
          "closingCallToAction",
          "estimatedDurationSeconds",
        ],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}

/**
 * 12. RISK DETECTION
 */
export async function detectRisksServer(params: {
  timeRemainingHours: number;
  workRemainingHours: number;
  criticalTasksCount: number;
  incompleteCriticalTasks: string[];
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const prompt = `You are HALFTIME Risk Officer.
Evaluate the current hackathon risks:

- Time Remaining: ${params.timeRemainingHours} hours
- Backlog Work: ${params.workRemainingHours} hours
- Incomplete Critical Tasks: ${params.incompleteCriticalTasks.join(", ") || "None"}

Generate risk summary, 3 top risk factors, and urgent recommended action.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
          summary: { type: Type.STRING },
          riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedAction: { type: Type.STRING },
        },
        required: ["riskLevel", "summary", "riskFactors", "recommendedAction"],
      },
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Empty response from Gemini.");
  return JSON.parse(text);
}
