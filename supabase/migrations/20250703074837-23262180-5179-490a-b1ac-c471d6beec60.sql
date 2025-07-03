
-- Drop the problematic policy for organization admins viewing quiz results
DROP POLICY IF EXISTS "Organization admins can view quiz results" ON public.quiz_results;

-- Create a corrected policy that properly handles the quiz_id as text
CREATE POLICY "Organization admins can view quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_quizzes 
      WHERE shared_quizzes.id::text = quiz_results.quiz_id 
      AND is_organization_admin(get_clerk_user_id(), shared_quizzes.organization_id)
    )
  );
