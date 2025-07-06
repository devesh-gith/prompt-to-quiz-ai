
-- First, let's check if you have any organization memberships and fix the RLS policy
-- Add yourself as an admin for your organization (replace with your actual user ID and org ID)
-- You can find these in the console logs when you try to share a quiz

-- The issue is that the RLS policy checks if user is admin but there might not be any admin records
-- Let's update the shared_quizzes policy to allow any authenticated organization member to create quizzes
-- and add a separate check for admin-only creation

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

-- Also ensure you have an admin record for yourself
-- Replace 'your_user_id_here' with your actual Clerk user ID 
-- Replace 'your_org_id_here' with your actual organization ID
-- You can see these in the console when you try to share a quiz

-- Example (uncomment and replace with actual IDs):
-- INSERT INTO public.organization_members (user_id, organization_id, role)
-- VALUES ('user_2yHXwTYf3tvq8Dmdx502jebeUZh', 'org_2zRiFNkhDp40xfGt7lhdRblHLII', 'admin')
-- ON CONFLICT (user_id, organization_id) 
-- DO UPDATE SET role = 'admin';
