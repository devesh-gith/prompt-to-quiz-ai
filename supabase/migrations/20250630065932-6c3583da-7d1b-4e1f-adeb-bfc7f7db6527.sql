
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view shared quizzes in their organization" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;

-- Create a helper function to extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'user_id',
    auth.jwt() ->> 'clerk_user_id'
  );
$$;

-- Create new policies using the helper function
CREATE POLICY "Users can view their own quizzes" 
  ON public.quizzes 
  FOR SELECT 
  USING (public.get_clerk_user_id() = created_by);

CREATE POLICY "Users can view shared quizzes in their organization" 
  ON public.quizzes 
  FOR SELECT 
  USING (is_shared = true);

CREATE POLICY "Users can create their own quizzes" 
  ON public.quizzes 
  FOR INSERT 
  WITH CHECK (public.get_clerk_user_id() = created_by);

CREATE POLICY "Users can update their own quizzes" 
  ON public.quizzes 
  FOR UPDATE 
  USING (public.get_clerk_user_id() = created_by);

CREATE POLICY "Users can delete their own quizzes" 
  ON public.quizzes 
  FOR DELETE 
  USING (public.get_clerk_user_id() = created_by);

-- For quiz_results table
CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (public.get_clerk_user_id() = user_id);

CREATE POLICY "Users can create their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (public.get_clerk_user_id() = user_id);
