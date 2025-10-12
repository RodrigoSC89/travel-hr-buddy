-- Sample Data for Assistant Report Logs Testing
-- This script inserts test data into the assistant_report_logs table
-- Run this after deploying the migration to test the functionality

-- Note: Replace the user_id values with actual user IDs from your auth.users table
-- or use NULL if user_id is optional

-- Sample 1: Successful report send
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'admin@example.com',
  'success',
  'Daily summary report sent successfully',
  'daily_summary',
  NOW() - INTERVAL '1 hour',
  '{"recipients": ["admin@example.com"], "subject": "Daily Summary - ' || CURRENT_DATE || '"}'::jsonb
);

-- Sample 2: Error sending report
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'user1@example.com',
  'error',
  'Failed to send email: SMTP connection timeout',
  'weekly_report',
  NOW() - INTERVAL '2 hours',
  '{"error": "SMTP timeout", "retry_count": 3}'::jsonb
);

-- Sample 3: Pending report
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'user2@example.com',
  'pending',
  'Report queued for sending',
  'monthly_report',
  NOW() - INTERVAL '30 minutes',
  '{"queue_position": 5}'::jsonb
);

-- Sample 4: Another successful report
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'manager@example.com',
  'success',
  'Team performance report delivered',
  'team_performance',
  NOW() - INTERVAL '3 hours',
  '{"team": "Engineering", "recipients": ["manager@example.com", "cto@example.com"]}'::jsonb
);

-- Sample 5: Successful automated report
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'system@example.com',
  'success',
  'System health report sent',
  'system_health',
  NOW() - INTERVAL '6 hours',
  '{"automated": true, "schedule": "daily"}'::jsonb
);

-- Sample 6: Another error for testing filtering
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'user3@example.com',
  'error',
  'Invalid recipient email address',
  'custom_report',
  NOW() - INTERVAL '1 day',
  '{"error": "Invalid email format", "email_provided": "invalid.email"}'::jsonb
);

-- Sample 7: Success from yesterday
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'admin@example.com',
  'success',
  'Yesterday summary report sent',
  'daily_summary',
  NOW() - INTERVAL '1 day 2 hours',
  '{"recipients": ["admin@example.com"], "date": "yesterday"}'::jsonb
);

-- Sample 8: Multiple recipients success
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'team@example.com',
  'success',
  'Sent to 5 recipients',
  'team_report',
  NOW() - INTERVAL '4 hours',
  '{"recipients": ["user1@example.com", "user2@example.com", "user3@example.com", "manager@example.com", "admin@example.com"]}'::jsonb
);

-- Sample 9: Pending with scheduled time
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'scheduled@example.com',
  'pending',
  'Scheduled for future delivery',
  'scheduled_report',
  NOW() - INTERVAL '15 minutes',
  '{"scheduled_time": "' || (NOW() + INTERVAL '1 hour')::text || '"}'::jsonb
);

-- Sample 10: Old successful report for date filtering test
INSERT INTO public.assistant_report_logs (
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata
) VALUES (
  'olduser@example.com',
  'success',
  'Historical report from last week',
  'historical_report',
  NOW() - INTERVAL '7 days',
  '{"archive": true}'::jsonb
);

-- Verify inserted data
SELECT 
  COUNT(*) as total_logs,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  MIN(sent_at) as oldest_log,
  MAX(sent_at) as newest_log
FROM public.assistant_report_logs;

-- Show all inserted logs
SELECT 
  id,
  user_email,
  status,
  message,
  report_type,
  sent_at,
  metadata->>'recipients' as recipients_info
FROM public.assistant_report_logs
ORDER BY sent_at DESC;
