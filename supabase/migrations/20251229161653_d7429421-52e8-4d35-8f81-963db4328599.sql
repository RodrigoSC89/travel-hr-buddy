-- Create task_assignments table for tracking tasks assigned to users
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES auth.users(id),
  related_entity_type TEXT,
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Users can see their own assigned tasks
CREATE POLICY "Users can view their assigned tasks"
ON public.task_assignments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their assigned tasks"
ON public.task_assignments
FOR UPDATE
USING (auth.uid() = user_id);

-- Managers can create tasks for organization members
CREATE POLICY "Authenticated users can create tasks"
ON public.task_assignments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for faster queries
CREATE INDEX idx_task_assignments_user_status ON public.task_assignments(user_id, status);
CREATE INDEX idx_task_assignments_org ON public.task_assignments(organization_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_assignments;