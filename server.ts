import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  generateIdeasServer,
  auditAndAdvanceIdeaServer,
  evaluateIdeaServer,
  defineProblemServer,
  generateMVPServer,
  generateRoadmapServer,
  recommendNextActionServer,
  recommendScopeCutsServer,
  recommendToolServer,
  judgeProjectServer,
  improvePitchServer,
  generateDemoFlowServer,
  detectRisksServer,
} from "./server/geminiService.js";

// Rate limiting in-memory store: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "You've reached the current AI usage limit. Please wait a moment before trying again.",
      rateLimited: true,
    });
  }

  record.count += 1;
  next();
}

const app = express();
app.use(express.json());

// Basic CORS and Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Audit & Advance Solution (No random ideas - User Problem + Solution)
app.post("/api/ai/advance-solution", rateLimiter, async (req, res) => {
  try {
    const result = await auditAndAdvanceIdeaServer(req.body || {});
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/advance-solution]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      result: null,
    });
  }
});

// 1b. Legacy Generate Ideas Route
app.post("/api/ai/generate-ideas", rateLimiter, async (req, res) => {
  try {
    const ideas = await generateIdeasServer(req.body || {});
    res.json({ success: true, ideas });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/generate-ideas]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      ideas: null,
    });
  }
});

// 2. Evaluate Idea
app.post("/api/ai/evaluate-idea", rateLimiter, async (req, res) => {
  try {
    const evaluation = await evaluateIdeaServer(req.body || {});
    res.json({ success: true, evaluation });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/evaluate-idea]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      evaluation: null,
    });
  }
});

// 3. Define the Problem
app.post("/api/ai/define-problem", rateLimiter, async (req, res) => {
  try {
    const problem = await defineProblemServer(req.body || {});
    res.json({ success: true, problem });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/define-problem]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      problem: null,
    });
  }
});

// 4. Generate MVP Plan
app.post("/api/ai/generate-mvp", rateLimiter, async (req, res) => {
  try {
    const plan = await generateMVPServer(req.body || {});
    res.json({ success: true, plan });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/generate-mvp]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      plan: null,
    });
  }
});

// 5. Generate Build Roadmap
app.post("/api/ai/generate-roadmap", rateLimiter, async (req, res) => {
  try {
    const roadmap = await generateRoadmapServer(req.body || {});
    res.json({ success: true, roadmap });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/generate-roadmap]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      roadmap: null,
    });
  }
});

// 6. Recommend Next Action (Halftime Says)
app.post("/api/ai/recommend-next-action", rateLimiter, async (req, res) => {
  try {
    const recommendation = await recommendNextActionServer(req.body || {});
    res.json({ success: true, recommendation });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/recommend-next-action]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      recommendation: null,
    });
  }
});

// 7. Recommend Scope Cuts
app.post("/api/ai/recommend-scope-cuts", rateLimiter, async (req, res) => {
  try {
    const scopeCuts = await recommendScopeCutsServer(req.body || {});
    res.json({ success: true, scopeCuts });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/recommend-scope-cuts]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      scopeCuts: null,
    });
  }
});

// 8. Recommend a Tool
app.post("/api/ai/recommend-tool", rateLimiter, async (req, res) => {
  try {
    const recommendation = await recommendToolServer(req.body || {});
    res.json({ success: true, recommendation });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/recommend-tool]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      recommendation: null,
    });
  }
});

// 9. Judge Project Simulation
app.post("/api/ai/judge-project", rateLimiter, async (req, res) => {
  try {
    const evaluation = await judgeProjectServer(req.body || {});
    res.json({ success: true, evaluation });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/judge-project]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      evaluation: null,
    });
  }
});

// 10. Pitch Coach
app.post("/api/ai/pitch-coach", rateLimiter, async (req, res) => {
  try {
    const pitch = await improvePitchServer(req.body || {});
    res.json({ success: true, pitch });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/pitch-coach]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      pitch: null,
    });
  }
});

// 11. Generate Demo Flow
app.post("/api/ai/generate-demo-flow", rateLimiter, async (req, res) => {
  try {
    const demoFlow = await generateDemoFlowServer(req.body || {});
    res.json({ success: true, demoFlow });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/generate-demo-flow]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      demoFlow: null,
    });
  }
});

// 12. Detect Risks
app.post("/api/ai/detect-risks", rateLimiter, async (req, res) => {
  try {
    const risks = await detectRisksServer(req.body || {});
    res.json({ success: true, risks });
  } catch (err: any) {
    console.error("[API ERROR /api/ai/detect-risks]", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "HALFTIME AI is temporarily unavailable. Please try again.",
      risks: null,
    });
  }
});

export default app;

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HALFTIME Server] Live on http://localhost:${PORT}`);
  });
}

// Only start when directly executed
if (process.env.VERCEL !== "1") {
  startServer();
}
