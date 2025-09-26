-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Add policies for operational_checklists
CREATE POLICY "Users can view checklists from their organization" 
ON public.operational_checklists 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can insert checklists in their organization" 
ON public.operational_checklists 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can update checklists from their organization" 
ON public.operational_checklists 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add policies for checklist_items
CREATE POLICY "Users can view checklist items from their organization" 
ON public.checklist_items 
FOR SELECT 
USING (
  checklist_id IN (
    SELECT id FROM public.operational_checklists
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Users can insert checklist items in their organization" 
ON public.checklist_items 
FOR INSERT 
WITH CHECK (
  checklist_id IN (
    SELECT id FROM public.operational_checklists
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Users can update checklist items from their organization" 
ON public.checklist_items 
FOR UPDATE 
USING (
  checklist_id IN (
    SELECT id FROM public.operational_checklists
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);