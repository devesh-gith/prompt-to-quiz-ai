
-- Create a shared_quizzes table for temporary quiz storage
CREATE TABLE public.shared_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('image', 'youtube', 'pdf', 'text', 'prompt')),
  quiz_data JSONB NOT NULL,
  created_by TEXT NOT NULL, -- Clerk user ID
  organization_id TEXT NOT NULL, -- Clerk organization ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS
ALTER TABLE public.shared_quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for shared quizzes - anyone in the organization can view
CREATE POLICY "Organization members can view shared quizzes" 
  ON public.shared_quizzes 
  FOR SELECT 
  USING (true); -- We'll handle organization filtering in the application

CREATE POLICY "Users can create shared quizzes" 
  ON public.shared_quizzes 
  FOR INSERT 
  WITH CHECK (true); -- We'll handle validation in the application

-- Create index for efficient cleanup
CREATE INDEX idx_shared_quizzes_expires_at ON public.shared_quizzes(expires_at);
CREATE INDEX idx_shared_quizzes_organization_id ON public.shared_quizzes(organization_id);

-- Enable pg_cron extension for automatic cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to clean up expired quizzes
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_quizzes()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.shared_quizzes 
  WHERE expires_at < now();
$$;

-- Schedule the cleanup to run every 30 minutes
SELECT cron.schedule(
  'cleanup-expired-shared-quizzes',
  '*/30 * * * *', -- Every 30 minutes
  'SELECT public.cleanup_expired_shared_quizzes();'
);
