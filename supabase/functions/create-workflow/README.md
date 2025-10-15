# Create Workflow Supabase Edge Function

## Overview

This Supabase Edge Function provides an API endpoint for automated workflow creation with AI-powered suggestions.

## Features

- ✅ Creates a new workflow in the `smart_workflows` table
- 🧠 Automatically seeds AI-generated suggestions based on templates
- 📋 Provides initial action plan in the Kanban board
- 🔐 Validates required fields and handles errors gracefully
- 🌐 Supports CORS for web applications

## Endpoint

```
POST /functions/v1/create-workflow
```

## Request Body

```typescript
{
  "title": string,           // Required: Workflow title
  "created_by": string,      // Required: UUID of the user creating the workflow
  "description"?: string,    // Optional: Workflow description
  "category"?: string,       // Optional: Workflow category
  "tags"?: string[]          // Optional: Array of tags
}
```

## Response

### Success (200)

```typescript
{
  "success": true,
  "workflow": {
    "id": "uuid",
    "title": "Workflow Title",
    "description": "...",
    "status": "draft",
    "created_at": "2025-10-15T...",
    "updated_at": "2025-10-15T...",
    "created_by": "uuid",
    "category": "...",
    "tags": [...]
  },
  "message": "Workflow automático criado com sucesso!"
}
```

### Error (400/500)

```typescript
{
  "error": "Error message",
  "details"?: "Additional error details",
  "timestamp": "2025-10-15T..."
}
```

## Usage Example

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/create-workflow`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      title: 'Onboarding Process',
      created_by: 'user-uuid',
      description: 'Standard onboarding workflow for new crew members',
      category: 'HR',
      tags: ['onboarding', 'hr', 'automation']
    })
  }
);

const data = await response.json();
console.log('Created workflow:', data.workflow);
```

## What Happens After Creation

1. **Workflow is created** in the `smart_workflows` table with status "draft"
2. **AI suggestions are generated** and saved in `workflow_ai_suggestions` table
3. **Initial action plan** is available for the user to view in the Kanban board

## AI Suggestions

The function automatically creates intelligent suggestions for the workflow:

- **Planejamento**: Define scope and objectives
- **Execução**: Review and approve necessary documentation  
- **Validação**: Validate results and KPIs

These suggestions help users start with a structured plan based on best practices.

## Environment Variables

Required environment variables (set in Supabase Dashboard):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## Database Tables

### smart_workflows

The main workflow table with columns:
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `status` (TEXT: draft/active/inactive)
- `created_at`, `updated_at` (TIMESTAMP)
- `created_by` (UUID, FK to auth.users)
- `category` (TEXT)
- `tags` (TEXT[])
- `config` (JSONB)

### workflow_ai_suggestions

AI-generated suggestions with columns:
- `id` (UUID, PK)
- `workflow_id` (UUID, FK to smart_workflows)
- `etapa` (TEXT)
- `tipo_sugestao` (TEXT)
- `conteudo` (TEXT)
- `criticidade` (TEXT: low/medium/high/urgent)
- `responsavel_sugerido` (TEXT)
- `origem` (TEXT)
- `status` (TEXT: pending/accepted/rejected)
- `created_at`, `updated_at` (TIMESTAMP)
- `created_by` (UUID, FK to auth.users)
- `metadata` (JSONB)

## Testing

You can test this function using:

1. **Supabase Dashboard**: Functions > create-workflow > Invoke function
2. **API Client**: Use curl, Postman, or any HTTP client
3. **Frontend**: Call from your React/TypeScript application

## Error Handling

The function handles various error cases:

- Missing required fields (400)
- Database errors (500)
- Missing environment variables (500)
- Invalid JSON in request body (400)

All errors are logged to the console and returned in a structured format.
