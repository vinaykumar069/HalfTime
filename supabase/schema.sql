-- ==============================================================================
-- HALFTIME (Hackathon Copilot) — Official Supabase Database Schema
-- Architecture: Document Model (public.projects + public.project_data)
-- Multi-Tenant Isolation with strict Postgres Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
-- Note: 'id' is TEXT because the application generates structured human-readable IDs
-- (e.g. 'prj_1724410000000_abc123' or 'demo-doom').
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hackathon_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMPTZ NOT NULL,
  team_name TEXT DEFAULT 'My Team',
  team_members JSONB DEFAULT '[]'::jsonb,
  team_skills JSONB DEFAULT '[]'::jsonb,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Data Table (Document Model)
-- Exactly one project_data document exists per project, storing rich sprint telemetry
CREATE TABLE IF NOT EXISTS public.project_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  scope_cut_applied BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;

-- 5. Drop any prior obsolete policies to ensure clean execution
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users access own projects" ON public.projects;
DROP POLICY IF EXISTS "Users manage projects" ON public.projects;

DROP POLICY IF EXISTS "Users can manage project data in their projects" ON public.project_data;
DROP POLICY IF EXISTS "Users access own project data" ON public.project_data;
DROP POLICY IF EXISTS "Users manage project data" ON public.project_data;

-- 6. RLS Policies: Projects
-- Authenticated users can view their own projects or public demo projects
CREATE POLICY "Users access own projects"
  ON public.projects
  FOR ALL
  USING (auth.uid() = user_id OR is_demo = true)
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policies: Project Data
-- A user can access a project_data document ONLY if project_data.user_id matches auth.uid()
-- OR the project is an explicit demo project.
CREATE POLICY "Users access own project data"
  ON public.project_data
  FOR ALL
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_data.project_id 
      AND projects.is_demo = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_data.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_data_project ON public.project_data(project_id);
CREATE INDEX IF NOT EXISTS idx_project_data_user ON public.project_data(user_id);
