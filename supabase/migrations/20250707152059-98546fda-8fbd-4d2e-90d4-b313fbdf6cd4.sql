-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only organization admins can create shared quizzes" ON public.shared_quizzes;

-- Create a more permissive policy that allows organization members to create shared quizzes
CREATE POLICY "Organization members can create shared quizzes" 
  ON public.shared_quizzes 
  FOR INSERT 
  WITH CHECK (
    get_clerk_user_id() = created_by 
    AND EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE user_id = get_clerk_user_id() 
      AND organization_id = shared_quizzes.organization_id
    )
  );

-- Add yourself as an admin for your organization
INSERT INTO public.organization_members (user_id, organization_id, role)
VALUES ('user_2yHXwTYf3tvq8Dmdx502jebeUZh', 'org_2zRiFNkhDp40xfGt7lhdRblHLII', 'admin')
ON CONFLICT (user_id, organization_id) 
DO UPDATE SET role = 'admin';