
-- First, let's ensure we have proper RLS policies for quiz_results table
-- (The table already exists but we need to make sure RLS is properly configured)

-- Enable RLS on quiz_results if not already enabled
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_results if they don't exist
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;

CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Create a function to clean up quiz results older than 1 day
CREATE OR REPLACE FUNCTION public.cleanup_old_quiz_results()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.quiz_results 
  WHERE completed_at < (now() - interval '1 day');
$$;

-- Enable pg_cron extension (if not already enabled)
-- Note: This might already be enabled in your Supabase project
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup function to run daily at midnight
SELECT cron.schedule(
  'cleanup-quiz-results-daily',
  '0 0 * * *', -- Run at midnight every day
  'SELECT public.cleanup_old_quiz_results();'
);

-- Add an index on completed_at for better cleanup performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at);

-- Add an index on user_id for better query performance when fetching user results
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id_completed_at ON public.quiz_results(user_id, completed_at DESC);
