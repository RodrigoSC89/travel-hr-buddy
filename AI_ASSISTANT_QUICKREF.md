# 🤖 AI Assistant - Quick Reference

## Access
**URL**: `/admin/assistant`

## Quick Commands

| Icon | Command | Description |
|------|---------|-------------|
| 📝 | "Crie um checklist para inspeção técnica" | Creates a technical inspection checklist |
| ✅ | "Quantas tarefas pendentes tenho hoje?" | Lists today's pending tasks |
| 📄 | "Resuma o último documento gerado" | Summarizes the most recent document |
| 📊 | "Qual o status do sistema?" | Shows current system status |
| 📁 | "Liste os documentos recentes" | Lists recently created documents |

## Capabilities

✅ **Criar checklists** - Generate task lists  
📄 **Resumir documentos** - Create document summaries  
📊 **Mostrar status** - Check system status  
📋 **Listar tarefas** - Find pending tasks  
📁 **Listar documentos** - Search documents  
📑 **Gerar PDF** - Create PDF reports  
🔗 **Navegação interna** - System navigation help  

## Configuration

### Environment Variable
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### Supabase Secret
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-your-key-here
```

## API Details

**Endpoint**: `supabase/functions/ai-chat`  
**Model**: GPT-4o-mini  
**Temperature**: 0.4  
**Language**: Portuguese (pt-BR)  

## Example Queries

- "Como posso criar um novo usuário?"
- "Preciso de ajuda com o módulo de viagens"
- "Gere um relatório de atividades da última semana"
- "Quais são as certificações que vencem este mês?"
- "Me mostre os KPIs principais do dashboard"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to send request" | Deploy function: `supabase functions deploy ai-chat` |
| "OpenAI API error" | Check OPENAI_API_KEY in Supabase secrets |
| Slow responses | Using gpt-4o-mini (fast model) |
| Rate limit | Check OpenAI usage quota |

## Cost Estimate (gpt-4o-mini)

- 1,000 queries/month: ~$0.50
- 10,000 queries/month: ~$5
- 100,000 queries/month: ~$50

## Documentation

📖 **Full Guide**: `AI_ASSISTANT_IMPLEMENTATION.md`  
🔧 **API Reference**: `app/api/assistant/query/README.md`  

---

**Version**: 1.0.0  
**Last Updated**: October 2025
