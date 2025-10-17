# DP Plan Status - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Deploy Database Migration
```bash
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy
supabase db push
```

This creates the required columns in `dp_incidents` table:
- `plan_of_action`
- `plan_status`
- `plan_sent_to`
- `plan_sent_at`
- `plan_updated_at`

### 2. Deploy Edge Function
```bash
supabase functions deploy resend_pending_plans
```

### 3. Set Environment Variables
In Supabase Dashboard → Project Settings → Edge Functions:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 4. Deploy Frontend
```bash
npm run build
# Then deploy to your hosting platform
```

### 5. Verify
Navigate to `/dp-incidents` and check for:
- Status dropdown on incidents with plans
- Ability to change status
- Toast notifications on success

## 📋 Testing Checklist

- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] Frontend deployed
- [ ] Status dropdown appears
- [ ] Status changes save
- [ ] Toast notifications work
- [ ] Cron job scheduled (check Supabase logs after 24h)
- [ ] Email reminders working (test with 7+ day old pending plan)

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251017193400_add_plan_fields_to_dp_incidents.sql` | Database schema |
| `pages/api/dp-incidents/update-status.ts` | API endpoint |
| `src/components/dp/PlanStatusSelect.tsx` | UI component |
| `supabase/functions/resend_pending_plans/index.ts` | Email automation |
| `supabase/config.toml` | Cron configuration |

## 🎯 Quick Usage

### For Users
1. Go to `/dp-incidents`
2. Find incident with action plan
3. Use dropdown to update status
4. Status saves automatically

### For Admins
Monitor in Supabase Dashboard:
- Edge Functions → resend_pending_plans → Logs
- Database → dp_incidents → plan_status column

## 📊 Quick SQL Queries

### Check status distribution
```sql
SELECT plan_status, COUNT(*) 
FROM dp_incidents 
WHERE plan_of_action IS NOT NULL 
GROUP BY plan_status;
```

### Find overdue plans
```sql
SELECT id, title, vessel, 
       EXTRACT(DAY FROM NOW() - plan_sent_at) as days_pending
FROM dp_incidents 
WHERE plan_status = 'pendente' 
  AND plan_sent_at < NOW() - INTERVAL '7 days';
```

## 🐛 Troubleshooting

### Status not updating?
1. Check browser console for errors
2. Verify API endpoint is accessible: `curl -X POST /api/dp-incidents/update-status`
3. Check Supabase RLS policies

### Emails not sending?
1. Verify `RESEND_API_KEY` in Supabase
2. Check Edge Function logs
3. Verify cron is scheduled: `supabase functions list`

### Cron not running?
1. Check `supabase/config.toml` has the cron entry
2. Verify function is deployed: `supabase functions list`
3. Check execution logs in Supabase Dashboard

## 📚 Full Documentation

- **Feature Guide:** `DP_PLAN_STATUS_FEATURE.md`
- **Implementation Details:** `DP_PLAN_STATUS_IMPLEMENTATION_SUMMARY.md`
- **Architecture:** `DP_PLAN_STATUS_ARCHITECTURE.md`

## ✅ Success Indicators

Your implementation is working if:
- ✅ Dropdown appears on incidents with plans
- ✅ Status changes save to database
- ✅ Toast notifications appear
- ✅ Timestamps update correctly
- ✅ Cron job runs daily (check logs)
- ✅ Emails sent for overdue plans

## 🎓 Need Help?

1. Check the full documentation files
2. Review test files for examples
3. Check Supabase logs for errors
4. Verify environment variables

## 🔄 Update/Rollback

### To update:
```bash
# Pull latest changes
git pull

# Run new migrations
supabase db push

# Redeploy function
supabase functions deploy resend_pending_plans

# Rebuild frontend
npm run build
```

### To rollback:
```bash
# Revert database migration
supabase db reset

# Remove function
supabase functions delete resend_pending_plans

# Deploy previous frontend version
```

---

**Quick Start Version:** 1.0  
**Last Updated:** 2025-10-17  
**Estimated Setup Time:** 5 minutes
