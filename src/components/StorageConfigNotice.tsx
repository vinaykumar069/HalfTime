import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, ShieldCheck, Key, CheckCircle, Copy, RefreshCw, Sparkles, Terminal, ArrowRight, ExternalLink } from 'lucide-react';
import { verifySupabaseConnection, isSupabaseConfigured, ConnectionTestResult, getSupabaseConfigStatus } from '../lib/supabase';
import { BrandLogo } from './BrandLogo';

interface StorageConfigNoticeProps {
  onEnterDemoMode: () => void;
  onRetryConnection?: () => void;
}

export const StorageConfigNotice: React.FC<StorageConfigNoticeProps> = ({
  onEnterDemoMode,
  onRetryConnection,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'env'>('overview');

  const configStatus = getSupabaseConfigStatus();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await verifySupabaseConnection();
      setTestResult(result);
      if (result.ok && onRetryConnection) {
        onRetryConnection();
      }
    } catch (e: any) {
      setTestResult({
        ok: false,
        message: e?.message || 'Connection test failed unexpectedly.',
        tableAccessible: false,
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  const sampleEnv = `# In your deployment / .env file:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
GEMINI_API_KEY=your-gemini-api-key`;

  const copyToClipboard = (text: string, type: 'sql' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    }
  };

  const sqlSchemaSnippet = `-- Run this in Supabase Project > SQL Editor
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  hackathon_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMPTZ NOT NULL,
  team_name TEXT DEFAULT 'My Team',
  team_members JSONB DEFAULT '[]'::jsonb,
  team_skills JSONB DEFAULT '[]'::jsonb,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  scope_items JSONB DEFAULT '[]'::jsonb,
  ideas JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  judge_eval JSONB DEFAULT NULL,
  launch_checklist JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  pitch JSONB DEFAULT NULL,
  demo_flow JSONB DEFAULT NULL,
  scope_cut_applied BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id OR is_demo = true)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own project data" ON public.project_data
  FOR ALL USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_data.project_id AND projects.is_demo = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_data.project_id AND projects.user_id = auth.uid())
  );`;

  return (
    <div id="storage-config-screen" className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF2A5F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00D2FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <BrandLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF2A5F]/15 border border-[#FF2A5F]/30 text-[#FF2A5F] text-xs font-mono font-bold shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>HALFTIME STORAGE NOTICE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Production Cloud Persistence Required
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            HALFTIME enforces zero silent data loss. Normal production projects require a connected Supabase database with Row Level Security (RLS).
          </p>
        </div>

        {/* Diagnostic Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Connection Test Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${testResult?.ok ? 'bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30' : 'bg-[#FFAA00]/15 text-[#FFAA00] border border-[#FFAA00]/30'}`}>
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white flex items-center gap-2 font-mono">
                  <span>Supabase Live Connection Test:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${testResult?.ok ? 'bg-[#00F59B]/20 text-[#00F59B]' : 'bg-[#FF2A5F]/20 text-[#FF2A5F]'}`}>
                    {testing ? 'TESTING...' : testResult?.ok ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  {testing ? 'Validating credentials & table access...' : testResult?.message || configStatus.configError || 'No connection configured.'}
                </p>
              </div>
            </div>

            <button
              id="retry-connection-btn"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Re-test Connection
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 font-bold transition border-b-2 cursor-pointer ${activeTab === 'overview' ? 'border-[#00F59B] text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
            >
              1. Setup Checklist
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`pb-3 px-4 font-bold transition border-b-2 cursor-pointer ${activeTab === 'env' ? 'border-[#00D2FF] text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
            >
              2. Environment Config
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`pb-3 px-4 font-bold transition border-b-2 cursor-pointer ${activeTab === 'schema' ? 'border-[#FFAA00] text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
            >
              3. SQL Schema &amp; RLS
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-mono font-bold">
                    <Key className="w-4 h-4 text-[#FFAA00]" />
                    <span>Supabase Project URL</span>
                  </div>
                  <p className="text-[#94A3B8] text-[11px]">
                    Status: {configStatus.hasUrl ? <span className="text-[#00F59B] font-mono font-bold">Configured</span> : <span className="text-[#FF2A5F] font-mono font-bold">Missing (VITE_SUPABASE_URL)</span>}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-mono font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#00F59B]" />
                    <span>Supabase Anon API Key</span>
                  </div>
                  <p className="text-[#94A3B8] text-[11px]">
                    Status: {configStatus.hasKey ? <span className="text-[#00F59B] font-mono font-bold">Configured</span> : <span className="text-[#FF2A5F] font-mono font-bold">Missing (VITE_SUPABASE_ANON_KEY)</span>}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-white font-mono font-bold">Production Security Rules Enforced:</div>
                <ul className="list-disc list-inside space-y-1 text-[#94A3B8] text-[11px]">
                  <li>Strict tenant isolation via Supabase Row Level Security (RLS).</li>
                  <li>No client-side spoofing of <code className="text-white font-mono">user_id</code> or <code className="text-white font-mono">project_id</code>.</li>
                  <li>Zero silent fallback to browser localStorage in production mode.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Environment Config */}
          {activeTab === 'env' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Define these variables in your deployment environment:</span>
                <button
                  onClick={() => copyToClipboard(sampleEnv, 'env')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00D2FF] hover:underline cursor-pointer"
                >
                  {copiedEnv ? <CheckCircle className="w-3.5 h-3.5 text-[#00F59B]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEnv ? 'Copied!' : 'Copy .env snippet'}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono text-[#00F59B] overflow-x-auto">
                {sampleEnv}
              </pre>
            </div>
          )}

          {/* Tab 3: SQL Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Run this SQL in Supabase SQL Editor (creates tables + RLS):</span>
                <button
                  onClick={() => copyToClipboard(sqlSchemaSnippet, 'sql')}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00D2FF] hover:underline cursor-pointer"
                >
                  {copiedSql ? <CheckCircle className="w-3.5 h-3.5 text-[#00F59B]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto">
                {sqlSchemaSnippet}
              </pre>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#94A3B8] text-center sm:text-left">
              Want to explore the app interface without cloud persistence right now?
            </div>

            <button
              id="try-demo-sandbox-btn"
              onClick={onEnterDemoMode}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF8A00] to-[#FFAA00] text-[#07090E] font-mono text-xs font-black shadow-lg glow-orange transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>TRY DEMO (ISOLATED SANDBOX)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
