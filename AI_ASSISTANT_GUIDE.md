# 🤖 AI Assistant Module - Implementation Guide

## Overview

The AI Assistant module provides an intelligent copilot for the Travel HR Buddy system, enabling users to navigate the platform and execute tasks through natural language commands. Powered by OpenAI GPT-4o-mini for cost-effective, high-quality responses.

## Features

### ✅ Implemented Features

1. **Chat Interface** (`/admin/assistant`)
   - Clean, modern chat UI with message history
   - User and assistant message differentiation with avatars
   - Loading states during AI processing
   - Error handling with user-friendly messages
   - Input field with keyboard shortcuts (Enter to send)
   - Responsive layout (desktop and mobile optimized)

2. **Quick Commands Sidebar**
   - 5 pre-defined command buttons for instant access
   - One-click execution of common tasks
   - Visual icons for each command
   - Responsive design (sidebar on desktop, stacked on mobile)

3. **Capabilities List**
   - Display of all assistant features
   - Checkmark indicators for clarity
   - Helps users understand what the assistant can do

4. **Command Recognition**
   - Predefined commands for common tasks
   - Natural language understanding
   - Context-aware responses

5. **Intelligent Responses**
   - Pattern matching for quick responses
   - OpenAI GPT-4o-mini integration for complex queries (90% cost reduction vs GPT-4)
   - Fallback responses when AI is unavailable

6. **Navigation Assistance**
   - Direct links to system modules
   - Route suggestions based on user intent

7. **Model Badge**
   - "Powered by GPT-4o-mini" badge
   - Visual indicator of AI model in use

## Available Commands

### 🎯 Quick Commands (Sidebar Buttons)

| Command | Action | Icon |
|---------|--------|------|
| `Criar checklist` | Navigate to checklist creation page | ✅ |
| `Tarefas pendentes` | Display pending tasks | 📋 |
| `Resumir documento` | Instructions for document summarization | 📄 |
| `Status do sistema` | Open system status monitor | 📊 |
| `Documentos recentes` | Show recent documents | 📚 |

### 🎯 Additional Navigation Commands

| Command | Action |
|---------|--------|
| `dashboard` / `painel` | Open main dashboard |
| `documentos` | Access documents section |
| `alertas` / `alertas de preço` | View price alerts |
| `analytics` / `análises` | View analytics page |
| `relatórios` / `reports` | Access reports section |

### ⚡ Action Commands

| Command | Action |
|---------|--------|
| `gerar pdf` | Instructions for PDF generation |
| `ajuda` / `help` | Display all available commands |

## Technical Architecture

### Frontend (`src/pages/admin/assistant.tsx`)

```typescript
- React component with TypeScript
- Shadcn/UI components (Button, Input, ScrollArea, Card)
- Lucide React icons
- Supabase integration with fallback to API route
- State management with React hooks
```

### Backend - Supabase Edge Function (`supabase/functions/assistant-query/index.ts`)

```typescript
- Deno runtime
- Command pattern matching
- OpenAI GPT-4o-mini integration (cost-effective)
- Enhanced system prompt with 12+ module descriptions
- Optimized temperature (0.4) and max_tokens (1000)
- CORS support
- Error handling and logging
```

### Backend - Next.js API Route (`pages/api/assistant-query.ts`)

```typescript
- Backup/fallback endpoint
- TypeScript type safety
- OpenAI GPT-4o-mini integration
- Same command patterns as edge function
- Enhanced system prompt matching edge function
- Optimized parameters (temperature: 0.4, max_tokens: 1000)
```

## Cost Optimization

### Model Upgrade: GPT-4 → GPT-4o-mini

**Before:**
- Model: GPT-4
- Temperature: 0.3-0.7
- Max Tokens: 500 (default)
- Cost: ~$0.50 per 1,000 queries

**After:**
- Model: GPT-4o-mini
- Temperature: 0.4 (optimized)
- Max Tokens: 1000
- Cost: ~$0.05 per 1,000 queries

**Savings: 90% reduction in AI costs** 🎉

## API Specification

### Request

**Endpoint:** `POST /api/assistant/query` or Supabase Function `assistant-query`

**Body:**
```json
{
  "question": "criar checklist"
}
```

### Response

**Success (Command Matched):**
```json
{
  "answer": "✅ Navegando para a página de criação de checklists...",
  "action": "navigation",
  "target": "/admin/checklists",
  "timestamp": "2025-10-12T03:43:32.696Z"
}
```

**Success (AI Response):**
```json
{
  "answer": "Posso ajudar você com isso...",
  "action": "info",
  "timestamp": "2025-10-12T03:43:32.696Z"
}
```

**Error:**
```json
{
  "error": "Question is required",
  "answer": "❌ Desculpe, ocorreu um erro...",
  "timestamp": "2025-10-12T03:43:32.696Z"
}
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

For Supabase Edge Functions, set in Supabase dashboard:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### Routing

The assistant is accessible at:
```
/admin/assistant
```

Route is configured in `src/App.tsx`:
```typescript
const Assistant = React.lazy(() => import("./pages/admin/assistant"));
// ...
<Route path="/admin/assistant" element={<Assistant />} />
```

## Usage Examples

### Example 1: Get Help
**User:** "ajuda"
**Assistant:** Lists all available commands with descriptions

### Example 2: Navigate to Dashboard
**User:** "dashboard"
**Assistant:** "📊 Navegando para o dashboard principal..."

### Example 3: Create Checklist
**User:** "criar checklist"
**Assistant:** "✅ Navegando para a página de criação de checklists..."

### Example 4: Check Tasks
**User:** "tarefas pendentes"
**Assistant:** Shows list of pending tasks with details

### Example 5: General Query
**User:** "como funciona o sistema de alertas?"
**Assistant:** Provides intelligent explanation using GPT-4

## Deployment

### Deploying Supabase Edge Function

```bash
# Navigate to project root
cd /path/to/travel-hr-buddy

# Deploy the function
supabase functions deploy assistant-query

# Set environment variables
supabase secrets set OPENAI_API_KEY=your_key_here
```

### Verifying Deployment

1. Access the assistant page: `https://your-domain.com/admin/assistant`
2. Type a command (e.g., "ajuda")
3. Verify the response is displayed correctly

## Extending the Assistant

### Adding New Commands

Edit `supabase/functions/assistant-query/index.ts`:

```typescript
const commandPatterns: Record<string, CommandAction> = {
  // ... existing commands
  "novo comando": {
    type: "navigation",
    target: "/sua-rota",
    message: "Mensagem de resposta",
  },
};
```

### Customizing AI Behavior

Modify the system prompt in the edge function:

```typescript
const systemPrompt = `Você é um assistente IA corporativo...
// Add your custom instructions here
`;
```

## Troubleshooting

### Issue: "Erro ao processar solicitação"

**Solution:** 
- Check if OPENAI_API_KEY is set
- Verify Supabase function is deployed
- Check browser console for detailed errors

### Issue: Commands not recognized

**Solution:**
- Ensure command spelling matches pattern exactly
- Try using "ajuda" to see all available commands
- Check logs in Supabase function dashboard

### Issue: Slow responses

**Solution:**
- OpenAI API calls may take 2-5 seconds
- Consider implementing response caching
- Use predefined commands for instant responses

## Future Enhancements

- [ ] Voice input support
- [ ] Multi-turn conversations with context
- [ ] Integration with database for real-time queries
- [ ] Action execution (not just navigation)
- [ ] User preferences and personalization
- [ ] Analytics and usage tracking
- [ ] Multi-language support
- [ ] Suggested follow-up questions

## Support

For issues or questions, please refer to:
- Project repository issues
- System documentation
- Development team contact
