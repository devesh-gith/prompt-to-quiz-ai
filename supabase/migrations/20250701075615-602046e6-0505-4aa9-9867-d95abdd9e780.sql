
-- Create an enum for organization roles
CREATE TYPE public.organization_role AS ENUM ('admin', 'member');

-- Create a table to store user roles within organizations
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  organization_id TEXT NOT NULL, -- Clerk organization ID
  role organization_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own organization memberships" 
  ON public.organization_members 
  FOR SELECT 
  USING (true); -- We'll handle filtering in the application

CREATE POLICY "Organization admins can manage memberships" 
  ON public.organization_members 
  FOR ALL 
  USING (true); -- We'll handle validation in the application

-- Create index for efficient queries
CREATE INDEX idx_organization_members_user_org ON public.organization_members(user_id, organization_id);
CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);

-- Create a function to check if a user is an admin of an organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(user_id TEXT, org_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_members.user_id = is_organization_admin.user_id
      AND organization_members.organization_id = is_organization_admin.org_id
      AND role = 'admin'
  );
$$;

-- Update shared_quizzes policies to only allow admins to create
DROP POLICY IF EXISTS "Users can create shared quizzes" ON public.shared_quizzes;
CREATE POLICY "Only organization admins can create shared quizzes" 
  ON public.shared_quizzes 
  FOR INSERT 
  WITH CHECK (public.is_organization_admin(created_by, organization_id));
