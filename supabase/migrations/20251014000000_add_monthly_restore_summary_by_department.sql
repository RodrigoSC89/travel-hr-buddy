-- Create RPC function to get monthly restore summary by department
CREATE OR REPLACE FUNCTION public.get_monthly_restore_summary_by_department()
RETURNS TABLE(department text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(p.department, 'Sem Departamento') as department,
    count(*)::bigint as count
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  WHERE r.restored_at >= date_trunc('month', CURRENT_DATE)
  GROUP BY p.department
  ORDER BY count DESC
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_monthly_restore_summary_by_department() TO authenticated;

COMMENT ON FUNCTION public.get_monthly_restore_summary_by_department() IS 'Returns monthly restore summary grouped by department for current month';
