
ALTER TABLE public.repositories
  ADD COLUMN IF NOT EXISTS dependency_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dependency_health_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS code_complexity_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS large_files_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_directory_depth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_file_size integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dependency_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dependency_risk_level text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS cached_at timestamp with time zone DEFAULT NULL;
