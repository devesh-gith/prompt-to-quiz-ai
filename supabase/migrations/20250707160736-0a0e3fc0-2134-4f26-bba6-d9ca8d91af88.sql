-- Fix RLS policy for quiz_results to properly handle Clerk authentication
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can create quiz results for org quizzes" ON public.quiz_results;

-- Create a more permissive policy that allows authenticated users to create quiz results
-- for shared quizzes in organizations they belong to
CREATE POLICY "Users can create quiz results for shared quizzes" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (
    -- Ensure the user_id matches the authenticated user (from Clerk)
    user_id = get_clerk_user_id()
    AND
    -- Ensure the quiz exists in shared_quizzes and user is member of that organization
    EXISTS (
      SELECT 1 
      FROM public.shared_quizzes sq
      JOIN public.organization_members om ON om.organization_id = sq.organization_id
      WHERE sq.id = quiz_results.quiz_id 
      AND om.user_id = get_clerk_user_id()
      AND sq.expires_at > now()
    )
  );