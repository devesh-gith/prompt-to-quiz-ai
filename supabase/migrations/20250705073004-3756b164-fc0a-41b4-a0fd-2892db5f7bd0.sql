
-- Drop the existing policy that relies on organization_members table
DROP POLICY IF EXISTS "Only organization admins can create shared quizzes" ON public.shared_quizzes;

-- Create a more permissive policy that allows authenticated users to create shared quizzes
-- We'll handle admin validation in the application layer instead
CREATE POLICY "Authenticated users can create shared quizzes" 
  ON public.shared_quizzes 
  FOR INSERT 
  WITH CHECK (
    get_clerk_user_id() = created_by
  );
