-- Drop the complex admin policy and create a simpler one
DROP POLICY "Organization admins can view quiz results" ON quiz_results;

-- Create a simpler admin policy that checks if user is admin of any organization
CREATE POLICY "Organization admins can view all quiz results" 
ON quiz_results FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE user_id = get_clerk_user_id() 
    AND role = 'admin'
  )
);

-- Also add a policy for admins to see results for their specific organization quizzes
CREATE POLICY "Admins can view organization quiz results" 
ON quiz_results FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM shared_quizzes sq 
    JOIN organization_members om ON (om.organization_id = sq.organization_id)
    WHERE sq.id = quiz_results.quiz_id 
    AND om.user_id = get_clerk_user_id() 
    AND om.role = 'admin'
  )
);