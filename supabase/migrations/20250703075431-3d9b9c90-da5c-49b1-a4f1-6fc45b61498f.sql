
-- First, let's check the current state and fix the RLS policies for quiz_results
-- Drop existing policies to rebuild them properly
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Organization admins can view quiz results" ON public.quiz_results;

-- Allow users to view their own quiz results
CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (get_clerk_user_id() = user_id);

-- Allow users to create quiz results for shared quizzes in their organization
CREATE POLICY "Users can create quiz results for org quizzes" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (
    get_clerk_user_id() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.shared_quizzes 
      WHERE shared_quizzes.id = quiz_results.quiz_id
    )
  );

-- Allow organization admins to view all quiz results for their organization's quizzes
CREATE POLICY "Organization admins can view quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_quizzes 
      WHERE shared_quizzes.id = quiz_results.quiz_id 
      AND is_organization_admin(get_clerk_user_id(), shared_quizzes.organization_id)
    )
  );
