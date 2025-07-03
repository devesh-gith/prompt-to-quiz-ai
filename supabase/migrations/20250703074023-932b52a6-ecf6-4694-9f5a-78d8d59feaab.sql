
-- Drop existing RLS policies for quiz_results
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can create their own quiz results" ON public.quiz_results;

-- Create new RLS policies that work with Clerk user IDs
CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (get_clerk_user_id() = user_id);

CREATE POLICY "Users can create their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (get_clerk_user_id() = user_id);

-- Allow organization admins to view all quiz results for their organization's quizzes
CREATE POLICY "Organization admins can view quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_quizzes 
      WHERE shared_quizzes.id = quiz_results.quiz_id::uuid 
      AND is_organization_admin(get_clerk_user_id(), shared_quizzes.organization_id)
    )
  );
