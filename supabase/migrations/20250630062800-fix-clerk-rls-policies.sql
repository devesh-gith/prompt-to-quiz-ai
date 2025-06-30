
-- Fix RLS policies to work with Clerk JWT tokens
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view shared quizzes in their organization" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;

-- Create new policies that work with Clerk JWT tokens
-- For quizzes table
CREATE POLICY "Users can view their own quizzes" 
  ON public.quizzes 
  FOR SELECT 
  USING (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = created_by
  );

CREATE POLICY "Users can view shared quizzes in their organization" 
  ON public.quizzes 
  FOR SELECT 
  USING (is_shared = true);

CREATE POLICY "Users can create their own quizzes" 
  ON public.quizzes 
  FOR INSERT 
  WITH CHECK (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = created_by
  );

CREATE POLICY "Users can update their own quizzes" 
  ON public.quizzes 
  FOR UPDATE 
  USING (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = created_by
  );

CREATE POLICY "Users can delete their own quizzes" 
  ON public.quizzes 
  FOR DELETE 
  USING (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = created_by
  );

-- For quiz_results table
CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = user_id
  );

CREATE POLICY "Users can create their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (
    COALESCE(
      auth.jwt() ->> 'sub', 
      auth.jwt() ->> 'user_id'
    ) = user_id
  );
