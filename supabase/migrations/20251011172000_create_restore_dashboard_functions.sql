-- Create RPC function to get restore count by day with email filter
CREATE OR REPLACE FUNCTION public.get_restore_count_by_day_with_email(email_input text)
RETURNS TABLE(day date, count int)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    date_trunc('day', restored_at)::date as day,
    count(*)::int as count
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  WHERE email_input IS NULL OR email_input = '' OR p.email ILIKE '%' || email_input || '%'
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT 15
$$;

-- Create RPC function to get restore summary statistics
CREATE OR REPLACE FUNCTION public.get_restore_summary(email_input text)
RETURNS TABLE(total int, unique_docs int, avg_per_day numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    count(*)::int as total,
    count(DISTINCT document_id)::int as unique_docs,
    round(count(*)::numeric / GREATEST(1, count(DISTINCT date_trunc('day', restored_at))), 2) as avg_per_day
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  WHERE email_input IS NULL OR email_input = '' OR p.email ILIKE '%' || email_input || '%'
$$;
