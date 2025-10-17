# DP Incidents Action Plan - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

This guide will help you get the DP Incidents Action Plan feature up and running quickly.

## Prerequisites Checklist

- [ ] Supabase project is set up
- [ ] OpenAI API key is available
- [ ] Node.js and npm are installed
- [ ] Repository is cloned locally

## Step 1: Environment Variables (1 min)

Create or update your `.env` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

**Where to find these values:**
- Supabase URL & Keys: Supabase Dashboard → Settings → API
- OpenAI API Key: OpenAI Dashboard → API Keys

## Step 2: Database Migration (1 min)

### Option A: Using Supabase CLI
```bash
supabase migration up
```

### Option B: Manual SQL
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `supabase/migrations/20251017174300_add_plan_of_action_to_dp_incidents.sql`
3. Click "Run"

## Step 3: Seed Test Data (1 min - Optional)

1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `scripts/seed-dp-incidents.sql`
3. Click "Run"
4. Verify: You should see 4 test incidents

## Step 4: Build & Run (2 min)

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

The app should now be running at `http://localhost:5173` (or your configured port).

## Step 5: Test the Feature (1 min)

1. Navigate to the DP Intelligence page (usually at `/admin/dp-intelligence`)
2. You should see a list of incidents
3. Click the "🔧 Plano de Ação" button on any incident
4. Wait 5-10 seconds for the AI to generate the plan
5. The action plan should appear in a collapsible section
6. The incident status should change to "Analisado"

## ✅ Success Indicators

You know it's working when:
- ✅ Incidents load and display in the grid
- ✅ "Plano de Ação" button is visible on each card
- ✅ Clicking the button shows "Gerando..." temporarily
- ✅ Action plan appears after generation
- ✅ Status badge changes to "Analisado"
- ✅ Green success toast notification appears

## ❌ Troubleshooting Common Issues

### Issue: "Error fetching incidents"
**Solution:** Check Supabase connection and ensure RLS policies allow read access

### Issue: "Erro ao gerar plano de ação"
**Possible causes:**
1. OpenAI API key is missing or invalid
   - Check `.env` file has `VITE_OPENAI_API_KEY`
   - Verify key is active in OpenAI dashboard
2. Supabase service role key is missing
   - Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`
3. Incident not found in database
   - Run the seed script to add test data

### Issue: "No incidents shown"
**Solution:** 
1. Check if database has data: Run `SELECT * FROM dp_incidents;` in Supabase
2. If empty, run the seed script
3. Check RLS policies allow authenticated users to read

### Issue: Button does nothing when clicked
**Check:**
1. Browser console for errors (F12)
2. Network tab to see if API request is made
3. Verify API route exists at `pages/api/dp-incidents/action.ts`

### Issue: Action plan shows but formatting is broken
**Solution:** 
- This usually means the AI returned text instead of JSON
- Check OpenAI API response in console
- The API has fallback handling for this

## 🔍 Verification Commands

### Check Database Schema
```sql
-- In Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dp_incidents';
```

You should see: `plan_of_action`, `severity`, `status`, `incident_date`, `description`

### Check Test Data
```sql
-- In Supabase SQL Editor
SELECT id, title, status, plan_of_action IS NOT NULL as has_plan
FROM dp_incidents
LIMIT 5;
```

### Check API Endpoint
```bash
# Test if API route is accessible (should return 405 Method Not Allowed for GET)
curl http://localhost:5173/api/dp-incidents/action
```

## 📊 Usage Flow

```
1. User visits /admin/dp-intelligence
   ↓
2. Component fetches incidents from database
   ↓
3. User clicks "Plano de Ação" on an incident
   ↓
4. API calls GPT-4 with incident details
   ↓
5. GPT-4 returns structured JSON plan
   ↓
6. API saves to database
   ↓
7. Component refreshes and shows the plan
```

## 🎯 Quick Test Script

Create a file `test-api.sh` to quickly test the API:

```bash
#!/bin/bash
# Quick test for the action plan API

INCIDENT_ID="imca-2025-014"
API_URL="http://localhost:5173/api/dp-incidents/action"

echo "Testing Action Plan API..."
echo "Incident ID: $INCIDENT_ID"
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$INCIDENT_ID\"}" \
  | jq '.'

echo ""
echo "Check Supabase to verify plan_of_action was saved!"
```

Make it executable:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 📝 Next Steps

After successful setup:

1. **Customize the AI Prompt**: Edit `pages/api/dp-incidents/action.ts` to adjust the GPT-4 prompt
2. **Add More Incidents**: Use the Supabase interface to add real incident data
3. **Customize UI**: Modify `src/components/dp-intelligence/dp-intelligence-center.tsx`
4. **Add Export Feature**: Implement PDF export of action plans
5. **Set up Monitoring**: Track API usage and errors

## 📚 Additional Resources

- [Full Implementation Guide](./DP_INCIDENTS_ACTION_PLAN_IMPLEMENTATION.md)
- [Visual Guide](./DP_INCIDENTS_ACTION_PLAN_VISUAL_GUIDE.md)
- [IMCA Guidelines](https://www.imca-int.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console logs (F12)
3. Check API logs in your deployment platform
4. Verify environment variables are set correctly
5. Ensure OpenAI API has sufficient credits

## 💡 Pro Tips

- **Development**: Use `.env.local` for local environment variables
- **Testing**: Start with the seeded test data before adding real incidents
- **API Key**: Consider using OpenAI's cheaper models (gpt-3.5-turbo) for testing
- **Rate Limits**: Be aware of OpenAI API rate limits when testing repeatedly
- **Database**: Use Supabase's real-time features to auto-refresh incidents

---

**Estimated Setup Time:** 5-10 minutes
**Difficulty Level:** Beginner-Intermediate
**Prerequisites:** Basic knowledge of React, Next.js, and Supabase
