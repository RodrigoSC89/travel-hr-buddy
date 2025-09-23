-- Fix critical security issue: Employee certificates are publicly readable
-- This migration restricts access to employee certificates to authorized users only

-- First, drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view certificates" ON public.employee_certificates;
DROP POLICY IF EXISTS "Authenticated users can delete certificates" ON public.employee_certificates;
DROP POLICY IF EXISTS "Authenticated users can insert certificates" ON public.employee_certificates;
DROP POLICY IF EXISTS "Authenticated users can update certificates" ON public.employee_certificates;

-- Create a user roles system for proper access control
CREATE TYPE IF NOT EXISTS public.user_role AS ENUM ('admin', 'hr_manager', 'employee', 'manager');

-- Create user_roles table to manage access levels
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = user_uuid),
    'employee'::user_role
  );
$$;

-- Create security definer function to check if user can access employee data
CREATE OR REPLACE FUNCTION public.can_access_employee_data(target_employee_id TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- Admins and HR managers can access all employee data
      WHEN public.get_user_role(user_uuid) IN ('admin', 'hr_manager') THEN true
      -- Employees can only access their own data (assuming employee_id matches user email or ID)
      WHEN target_employee_id = (SELECT email FROM auth.users WHERE id = user_uuid) THEN true
      -- Default deny
      ELSE false
    END;
$$;

-- Create new restrictive RLS policies for employee_certificates
CREATE POLICY "Authorized users can view employee certificates"
ON public.employee_certificates
FOR SELECT
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "HR managers can insert employee certificates"
ON public.employee_certificates
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() IN ('admin', 'hr_manager') OR
  public.can_access_employee_data(employee_id)
);

CREATE POLICY "HR managers can update employee certificates"
ON public.employee_certificates
FOR UPDATE
TO authenticated
USING (
  public.get_user_role() IN ('admin', 'hr_manager') OR
  public.can_access_employee_data(employee_id)
);

CREATE POLICY "HR managers can delete employee certificates"
ON public.employee_certificates
FOR DELETE
TO authenticated
USING (
  public.get_user_role() IN ('admin', 'hr_manager') OR
  public.can_access_employee_data(employee_id)
);

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'admin');

-- Update certificate alerts policies to also be more restrictive
DROP POLICY IF EXISTS "Anyone can view certificate alerts" ON public.certificate_alerts;

CREATE POLICY "Authorized users can view certificate alerts"
ON public.certificate_alerts
FOR SELECT
TO authenticated
USING (
  public.get_user_role() IN ('admin', 'hr_manager') OR
  EXISTS (
    SELECT 1 FROM public.employee_certificates ec 
    WHERE ec.id = certificate_alerts.certificate_id 
    AND public.can_access_employee_data(ec.employee_id)
  )
);

-- Add trigger to update timestamps
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();