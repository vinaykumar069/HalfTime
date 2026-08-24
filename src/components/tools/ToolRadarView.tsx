import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Search, 
  Clock, 
  Zap, 
  ExternalLink, 
  Check, 
  Copy, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Flame, 
  ChevronRight,
  ArrowUpRight,
  Terminal,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { TaskItem, ToolRecommendationResult } from '../../types';
import { recommendTool } from '../../services/aiService';

interface ToolRadarViewProps {
  tasks: TaskItem[];
  teamSkills?: string[];
  currentStack?: string;
  projectName?: string;
  availableHours?: number;
}

interface DefaultToolMatch {
  keywords: string[];
  tool: string;
  category: 'AI & LLMs' | 'Frontend & UI' | 'Backend & DB' | 'Pitch & Demo' | 'DevOps & Deploy';
  why: string;
  speedScore: number;
  setupTime: string;
  timeSaved: string;
  installCommand?: string;
  docsUrl?: string;
  alternative: string;
}

// Battle-tested, fastest tools benchmarked for hackathon velocity
const BENCHMARK_TOOLS: DefaultToolMatch[] = [
  {
    keywords: ['ai', 'gemini', 'llm', 'prompt', 'model', 'gpt', 'generate', 'reasoning'],
    tool: 'Google Gemini 2.0 / 3.6 Flash (@google/genai)',
    category: 'AI & LLMs',
    why: 'Fastest time-to-first-token in the industry with 1M token window and native JSON structured outputs.',
    speedScore: 99,
    setupTime: '2 min setup',
    timeSaved: 'Saves ~3 hours vs fine-tuning/custom infra',
    installCommand: 'npm i @google/genai',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    alternative: 'OpenAI gpt-4o-mini',
  },
  {
    keywords: ['ui', 'frontend', 'dashboard', 'interface', 'react', 'css', 'style', 'components'],
    tool: 'Tailwind CSS v4 + Lucide Icons + v0.dev',
    category: 'Frontend & UI',
    why: 'Zero-config utility classes paired with 1000+ SVG icons enables lightning-fast high-contrast UI assembly.',
    speedScore: 98,
    setupTime: '1 min setup',
    timeSaved: 'Saves ~4 hours of raw CSS writing',
    installCommand: 'npm i lucide-react tailwindcss',
    docsUrl: 'https://tailwindcss.com',
    alternative: 'shadcn/ui or Chakra UI',
  },
  {
    keywords: ['db', 'database', 'auth', 'user', 'storage', 'backend', 'crud', 'postgres', 'sql'],
    tool: 'Supabase PostgreSQL (@supabase/supabase-js)',
    category: 'Backend & DB',
    why: 'Instant PostgreSQL database with built-in email auth, Row-Level Security (RLS), and real-time auto-generated REST APIs.',
    speedScore: 97,
    setupTime: '3 min setup',
    timeSaved: 'Saves ~5 hours building custom auth/DB servers',
    installCommand: 'npm i @supabase/supabase-js',
    docsUrl: 'https://supabase.com/docs',
    alternative: 'Convex / Firebase',
  },
  {
    keywords: ['pitch', 'slides', 'deck', 'present', 'presentation', 'script'],
    tool: 'Gamma.app / Decktopus AI',
    category: 'Pitch & Demo',
    why: 'Generates polished, investor-grade 8-slide pitch decks from a 1-paragraph prompt in under 90 seconds.',
    speedScore: 96,
    setupTime: 'Zero install (Web)',
    timeSaved: 'Saves ~2.5 hours of manual slide formatting',
    docsUrl: 'https://gamma.app',
    alternative: 'Canva / Pitch.com',
  },
  {
    keywords: ['video', 'demo', 'record', 'screen', 'backup', 'safeguard'],
    tool: 'Screenity / Loom Chrome Extension',
    category: 'Pitch & Demo',
    why: '1-click HD screen & webcam recording with instant MP4 download for zero-latency stage backup videos.',
    speedScore: 98,
    setupTime: '30 sec install',
    timeSaved: 'Saves live demo disasters on stage',
    docsUrl: 'https://screenity.io',
    alternative: 'OBS Studio',
  },
  {
    keywords: ['voice', 'speech', 'audio', 'tts', 'stt', 'transcribe', 'talk'],
    tool: 'Deepgram Nova-2 / ElevenLabs',
    category: 'AI & LLMs',
    why: 'Sub-300ms ultra-realistic streaming text-to-speech and transcription with plug-and-play REST SDKs.',
    speedScore: 97,
    setupTime: '3 min setup',
    timeSaved: 'Saves ~3 hours vs self-hosted Whisper',
    installCommand: 'npm i @deepgram/sdk',
    docsUrl: 'https://deepgram.com',
    alternative: 'Web Speech API',
  },
  {
    keywords: ['deploy', 'host', 'server', 'render', 'vercel', 'docker', 'live', 'domain'],
    tool: 'Render Web Service / Vercel',
    category: 'DevOps & Deploy',
    why: 'Automatic Git-triggered builds with free automatic SSL, CDN edge caching, and Zero-config environment management.',
    speedScore: 95,
    setupTime: '2 min setup',
    timeSaved: 'Saves ~3 hours of manual VPS / Nginx setup',
    docsUrl: 'https://render.com/docs',
    alternative: 'Railway / Fly.io',
  },
  {
    keywords: ['vector', 'embeddings', 'search', 'rag', 'semantic', 'documents'],
    tool: 'pgvector on Supabase / Pinecone Serverless',
    category: 'Backend & DB',
    why: 'Native vector cosine similarity search without provisioning separate vector cluster infra.',
    speedScore: 96,
    setupTime: '4 min setup',
    timeSaved: 'Saves ~3.5 hours building custom RAG indexing',
    installCommand: 'npm i @supabase/supabase-js',
    docsUrl: 'https://supabase.com/docs/guides/database/extensions/pgvector',
    alternative: 'Qdrant / Chroma',
  },
];

export const ToolRadarView: React.FC<ToolRadarViewProps> = ({
  tasks,
  teamSkills = ['React', 'TypeScript', 'Node.js', 'Tailwind'],
  currentStack = 'Vite, React, Express, Supabase, Gemini 2.0 Flash',
  projectName = 'Hackathon Copilot',
  availableHours = 12,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Custom AI Recommender Query State
  const [customTaskQuery, setCustomTaskQuery] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiCustomResult, setAiCustomResult] = useState<ToolRecommendationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const categories = ['ALL', 'AI & LLMs', 'Frontend & UI', 'Backend & DB', 'Pitch & Demo', 'DevOps & Deploy'];

  // Match each task in the project with the best-performing tool
  const taskToolMatches = useMemo(() => {
    return tasks.map((task) => {
      const lower = `${task.title} ${task.description || ''}`.toLowerCase();
      
      // Find matching benchmark tool
      const matched = BENCHMARK_TOOLS.find((t) => 
        t.keywords.some((k) => lower.includes(k))
      ) || BENCHMARK_TOOLS[0]; // fallback to Gemini

      return {
        task,
        match: matched,
      };
    });
  }, [tasks]);

  // Filtered tasks
  const filteredMatches = useMemo(() => {
    return taskToolMatches.filter(({ task, match }) => {
      const matchesCategory = selectedCategory === 'ALL' || match.category === selectedCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.why.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [taskToolMatches, selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAskCustomTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskQuery.trim()) return;

    setIsAskingAi(true);
    setAiError(null);
    setAiCustomResult(null);

    try {
      const res = await recommendTool({
        task: customTaskQuery.trim(),
        timeAvailableHours: availableHours,
        teamSkills: teamSkills.join(', '),
        existingStack: currentStack,
      });
      setAiCustomResult(res);
    } catch (err: any) {
      setAiError(err?.message || 'Failed to query AI tool recommendations.');
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Clean Header */}
      <div className="space-y-1.5 pb-3 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          Best-Performing Tools For Your Tasks
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          Recommended tools, libraries, and SDKs matched to your project tasks for fast hackathon execution.
        </p>
      </div>

      {/* 2. Custom Tool Lookup Card */}
      <div className="rounded-2xl bg-[#0A0E18] border border-white/10 p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-4 h-4 text-[#00FF88]" />
          <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Find the Best Tool for a Custom Task
          </span>
        </div>

        <form onSubmit={handleAskCustomTool} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="e.g. I need to parse PDF resumes or handle multi-user WebSockets..."
              value={customTaskQuery}
              onChange={e => setCustomTaskQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isAskingAi || !customTaskQuery.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00FF88] hover:brightness-110 disabled:opacity-50 text-[#07090E] font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            {isAskingAi ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#07090E]" />
                <span>Searching Tools...</span>
              </>
            ) : (
              <span>Get Recommendation →</span>
            )}
          </button>
        </form>

        {aiError && (
          <div className="mt-3 p-3 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 text-[#FF4D4D] text-xs font-mono">
            {aiError}
          </div>
        )}

        {aiCustomResult && (
          <div className="mt-4 p-4 rounded-xl bg-black/80 border border-white/15 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-sm">
                  {aiCustomResult.recommendedTool}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-[#00F0FF]">
                  {aiCustomResult.setupCost}
                </span>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">
                {aiCustomResult.estimatedTimeSaved}
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {aiCustomResult.why}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8] border-t border-white/10">
              <div>
                <span className="text-[#64748B]">Alternative:</span> {aiCustomResult.alternative}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00FF88] text-[#07090E]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task or tool..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00FF88]"
          />
        </div>
      </div>

      {/* 4. Task-by-Task Tool Matching Cards */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#0A0E18] border border-white/10 text-[#94A3B8] font-mono text-xs space-y-1.5">
            <div>No matching tasks found for "{searchQuery}".</div>
            <div className="text-[#64748B]">Try searching another keyword or create tickets on the Battle Board.</div>
          </div>
        ) : (
          filteredMatches.map(({ task, match }, index) => {
            const cardId = `match-${task.id || index}`;
            const isCopied = copiedIndex === cardId;

            return (
              <div 
                key={cardId}
                className="rounded-2xl bg-[#0A0E18] border border-white/10 hover:border-white/20 p-5 transition-all shadow-md space-y-3.5 group"
              >
                {/* Top Row: Task Name vs Best Tool */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] font-mono text-[10px] text-[#94A3B8] uppercase font-bold">
                        Task #{index + 1}
                      </span>
                      <span className="font-mono text-[10px] text-[#00F0FF] uppercase">
                        {match.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 font-mono text-xs text-[#CBD5E1]">
                      ⏱️ {match.setupTime}
                    </div>
                  </div>
                </div>

                {/* Main Recommendation Body */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Tool Badge & Description */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#64748B] uppercase font-bold">Recommended:</span>
                      <span className="text-xs font-bold text-white font-mono bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/10">
                        {match.tool}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {match.why}
                    </p>
                  </div>

                  {/* Right Side: Setup Command / Docs */}
                  <div className="md:col-span-4 flex flex-col gap-2 md:items-end">
                    {match.installCommand && (
                      <button
                        onClick={() => handleCopy(match.installCommand!, cardId)}
                        className="w-full md:w-auto px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black border border-white/15 hover:border-[#00FF88]/50 text-xs font-mono text-[#CBD5E1] flex items-center justify-between md:justify-end gap-2 transition cursor-pointer group"
                        title="Click to copy terminal command"
                      >
                        <span className="text-[#00FF88] font-bold">$</span>
                        <span className="truncate max-w-[180px]">{match.installCommand}</span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-[#00FF88]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white" />
                        )}
                      </button>
                    )}

                    {match.docsUrl && (
                      <a
                        href={match.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 self-start md:self-end"
                      >
                        <span>Docs &amp; Quickstart</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Insight */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#64748B] border-t border-white/5">
                  <div>
                    <span>Fallback: {match.alternative}</span>
                  </div>
                  <span className="text-[#94A3B8]">
                    Owner: {task.owner || 'Teammate'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
