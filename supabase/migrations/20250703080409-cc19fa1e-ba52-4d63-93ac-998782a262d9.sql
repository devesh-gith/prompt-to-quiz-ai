
-- Drop the problematic INSERT policy and recreate it with better logic
DROP POLICY IF EXISTS "Users can create quiz results for org quizzes" ON public.quiz_results;

-- Create a new policy that allows users to create quiz results for shared quizzes
-- where they are members of the organization that owns the quiz
CREATE POLICY "Users can create quiz results for org quizzes" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (
    get_clerk_user_id() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.shared_quizzes sq
      JOIN public.organization_members om ON om.organization_id = sq.organization_id
      WHERE sq.id = quiz_results.quiz_id
      AND om.user_id = get_clerk_user_id()
    )
  );
