
-- Drop all existing RLS policies first
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view shared quizzes in their organization" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;

-- Drop the existing foreign key constraints
ALTER TABLE public.quizzes 
DROP CONSTRAINT IF EXISTS quizzes_created_by_fkey;

ALTER TABLE public.quiz_results 
DROP CONSTRAINT IF EXISTS quiz_results_user_id_fkey;

-- Update the column types to TEXT for Clerk user IDs
ALTER TABLE public.quizzes 
ALTER COLUMN created_by TYPE TEXT;

ALTER TABLE public.quiz_results 
ALTER COLUMN user_id TYPE TEXT;

-- Recreate the RLS policies with the correct data types
CREATE POLICY "Users can view their own quizzes" 
  ON public.quizzes 
  FOR SELECT 
  USING (auth.jwt() ->> 'sub' = created_by);

CREATE POLICY "Users can view shared quizzes in their organization" 
  ON public.quizzes 
  FOR SELECT 
  USING (is_shared = true);

CREATE POLICY "Users can create their own quizzes" 
  ON public.quizzes 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = created_by);

CREATE POLICY "Users can update their own quizzes" 
  ON public.quizzes 
  FOR UPDATE 
  USING (auth.jwt() ->> 'sub' = created_by);

CREATE POLICY "Users can delete their own quizzes" 
  ON public.quizzes 
  FOR DELETE 
  USING (auth.jwt() ->> 'sub' = created_by);

CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);
