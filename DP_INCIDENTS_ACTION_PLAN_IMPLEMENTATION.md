# DP Incidents Action Plan Feature - Implementation Guide

## 📋 Overview

This document describes the implementation of AI-powered action plan generation for DP (Dynamic Positioning) incidents, as specified in the requirements.

## 🎯 Features Implemented

### 1. Database Schema Enhancement

**Migration File:** `supabase/migrations/20251017174300_add_plan_of_action_to_dp_incidents.sql`

Added the following fields to the `dp_incidents` table:

- `plan_of_action` (JSONB) - Stores structured AI-generated action plans
- `severity` (TEXT) - Incident severity: critical, high, medium, low
- `status` (TEXT) - Analysis status: analyzed, pending
- `incident_date` (DATE) - Date of incident occurrence
- `description` (TEXT) - Detailed incident description

**Action Plan JSON Structure:**
```json
{
  "diagnostico": "Technical diagnosis summary",
  "causa_raiz": "Probable root cause",
  "acoes_corretivas": ["Corrective action 1", "Corrective action 2"],
  "acoes_preventivas": ["Preventive action 1", "Preventive action 2"],
  "responsavel": "Suggested responsible department/role",
  "prazo": "Suggested timeline",
  "normas": ["IMCA M103", "IMCA M117", "IMO guidelines"]
}
```

### 2. API Endpoint

**File:** `pages/api/dp-incidents/action.ts`

A Next.js API route that:

1. **Receives** an incident ID via POST request
2. **Fetches** incident details from the database
3. **Calls GPT-4** with a specialized prompt based on IMCA standards
4. **Parses** the AI response into structured JSON
5. **Updates** the database with the action plan
6. **Returns** the generated plan

**Endpoint:** `POST /api/dp-incidents/action`

**Request Body:**
```json
{
  "id": "imca-2025-014"
}
```

**Response:**
```json
{
  "ok": true,
  "plan_of_action": {
    "diagnostico": "...",
    "causa_raiz": "...",
    "acoes_corretivas": [...],
    "acoes_preventivas": [...],
    "responsavel": "...",
    "prazo": "...",
    "normas": [...]
  }
}
```

**AI Prompt Includes:**
- Incident details (title, vessel, date, severity, description)
- Request for analysis based on IMCA M103, M117, M190, M166 and IMO guidelines
- Structured JSON output format
- Technical diagnosis, root cause analysis, corrective and preventive actions
- Suggested responsible party and timeline
- Relevant regulatory standards

### 3. UI Component Updates

**File:** `src/components/dp-intelligence/dp-intelligence-center.tsx`

Enhanced the DP Intelligence Center with:

#### New Interface Types
- `PlanOfAction` interface for type-safe action plan handling
- Updated `Incident` interface to include `plan_of_action` field

#### New State Management
- `generatingAction` - Tracks which incident is being processed
- Loading states for button feedback

#### New Functions
- `handleGenerateAction(id)` - Triggers action plan generation via API
- Updates `fetchIncidents()` to fetch from database first (includes plan_of_action)

#### UI Components
1. **"Plano de Ação" Button**
   - Wrench icon (🔧)
   - Disabled state during generation
   - "Gerando..." loading text
   
2. **Action Plan Display**
   - Collapsible `<details>` component
   - Structured display with icons:
     - 🧠 Diagnóstico Técnico
     - 🛠️ Causa Raiz Provável
     - ✅ Ações Corretivas (bullet list)
     - 🔄 Ações Preventivas (bullet list)
     - 📌 Responsável
     - ⏱️ Prazo
     - 🔗 Normas Referenciadas (badges)

## 🔧 Setup Instructions

### Prerequisites
- Supabase project configured
- OpenAI API key set in environment variables
- Database migrations applied

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Run the migration:
```bash
# Via Supabase CLI
supabase migration up

# Or run the SQL file directly in Supabase SQL Editor
```

2. Seed test data (optional):
```bash
# Run scripts/seed-dp-incidents.sql in Supabase SQL Editor
```

### Testing the Feature

1. Navigate to `/admin/dp-intelligence` (or your configured route)
2. You should see a list of DP incidents
3. Click the "Plano de Ação" button on any incident
4. Wait for the AI to generate the action plan (usually 5-10 seconds)
5. The plan will appear in a collapsible section below the incident
6. The incident status will update to "Analisado"

## 📊 Data Flow

```
User clicks "Plano de Ação"
    ↓
Component calls handleGenerateAction(id)
    ↓
POST /api/dp-incidents/action with { id }
    ↓
API fetches incident from Supabase
    ↓
API calls GPT-4 with specialized prompt
    ↓
API parses JSON response
    ↓
API updates dp_incidents table with plan_of_action
    ↓
API returns success
    ↓
Component refreshes incidents list
    ↓
UI displays action plan in collapsible section
```

## 🎨 UI/UX Features

- **Loading States**: Button shows "Gerando..." while processing
- **Disabled State**: Button disabled during generation to prevent duplicate requests
- **Auto-refresh**: Incident list refreshes after successful generation
- **Collapsible Display**: Action plan is hidden by default, expandable on click
- **Structured Layout**: Clear sections with emojis for visual hierarchy
- **Badge Display**: Regulatory standards shown as clickable badges
- **Responsive Design**: Works on mobile and desktop

## 🔒 Security Considerations

- API uses Supabase service role key for database access
- OpenAI API key stored securely in environment variables
- Row Level Security (RLS) policies apply to dp_incidents table
- API validates incident ID before processing

## 🚀 Future Enhancements

Potential improvements for the future:

1. **Export Functionality**: Export action plans to PDF
2. **Email Notifications**: Send action plans to stakeholders
3. **Approval Workflow**: Add approval/rejection for generated plans
4. **Historical Tracking**: Version control for action plan changes
5. **Template Customization**: Allow customization of AI prompt
6. **Multi-language Support**: Generate plans in different languages
7. **Integration with Task Management**: Create tasks from action items
8. **Analytics Dashboard**: Track action plan completion rates

## 📝 Code Quality

- ✅ TypeScript for type safety
- ✅ Proper error handling and user feedback
- ✅ Loading states for better UX
- ✅ Consistent with existing codebase patterns
- ✅ Build passes without errors
- ✅ Follows project linting rules

## 🧪 Testing Checklist

- [ ] Migration runs successfully
- [ ] API endpoint returns valid JSON
- [ ] GPT-4 generates structured responses
- [ ] UI displays action plan correctly
- [ ] Loading states work properly
- [ ] Error handling shows appropriate messages
- [ ] Refresh updates the UI with new data
- [ ] Works with different incident types
- [ ] Responsive on mobile devices

## 📚 Standards Referenced

The AI is prompted to analyze incidents based on:

- **IMCA M103** - Guidelines for DP Trials
- **IMCA M117** - DP Incident Reporting
- **IMCA M190** - DP Operations
- **IMCA M166** - DP Vessel Design Philosophy Guidelines
- **IMO MSC/Circ.645** - Guidelines for Vessels with Dynamic Positioning Systems

## 🤝 Contributing

When making changes to this feature:

1. Update this documentation
2. Test with multiple incident types
3. Verify AI responses are accurate
4. Check error handling edge cases
5. Update TypeScript types if data structure changes

## 📞 Support

For issues or questions about this feature:
- Check API logs in Vercel/deployment platform
- Verify environment variables are set correctly
- Check Supabase logs for database errors
- Review OpenAI API usage and quotas
