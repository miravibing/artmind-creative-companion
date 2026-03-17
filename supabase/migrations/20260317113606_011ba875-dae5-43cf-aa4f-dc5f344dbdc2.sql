
ALTER TABLE public.challenges 
  ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS publisher_name text DEFAULT NULL;
