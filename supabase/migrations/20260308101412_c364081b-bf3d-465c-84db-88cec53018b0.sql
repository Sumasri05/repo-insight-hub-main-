
ALTER TABLE public.repositories
  ADD COLUMN IF NOT EXISTS risk_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS risk_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS score_explanations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS file_tree jsonb NOT NULL DEFAULT '[]'::jsonb;
