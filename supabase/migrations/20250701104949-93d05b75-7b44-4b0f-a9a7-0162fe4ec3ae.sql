
-- Check if we need to add any missing functionality for quiz result tracking
-- The quiz_results table already exists with proper structure
-- Let's ensure we have proper indexing for performance

-- Add index for better performance when fetching results by organization
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);

-- Add index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id_quiz_id ON public.quiz_results(user_id, quiz_id);

-- Ensure the cleanup function and cron job are properly set up
-- (The cleanup function already exists, just ensuring it's optimal)
CREATE OR REPLACE FUNCTION public.cleanup_old_quiz_results()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.quiz_results 
  WHERE completed_at < (now() - interval '24 hours');
$$;

-- Verify the cron job exists (this should already be set up)
-- SELECT cron.schedule(
--   'cleanup-quiz-results-daily',
--   '0 0 * * *', -- Run at midnight every day
--   'SELECT public.cleanup_old_quiz_results();'
-- );
