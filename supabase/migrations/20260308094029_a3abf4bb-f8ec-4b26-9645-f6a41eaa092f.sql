
-- Create repositories table
CREATE TABLE public.repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  forks INTEGER NOT NULL DEFAULT 0,
  issues INTEGER NOT NULL DEFAULT 0,
  language TEXT,
  score NUMERIC NOT NULL DEFAULT 0,
  documentation_score NUMERIC NOT NULL DEFAULT 0,
  maintainability_score NUMERIC NOT NULL DEFAULT 0,
  structure_score NUMERIC NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read repositories (public leaderboard/dashboard)
CREATE POLICY "Anyone can view repositories"
  ON public.repositories FOR SELECT
  USING (true);

-- Allow insert from service role (edge functions)
CREATE POLICY "Service role can insert repositories"
  ON public.repositories FOR INSERT
  WITH CHECK (true);
