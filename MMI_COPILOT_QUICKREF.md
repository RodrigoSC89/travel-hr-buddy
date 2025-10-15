# MMI Copilot - Quick Reference

## 🚀 Quick Start

### Endpoint
```
POST https://[project].supabase.co/functions/v1/mmi-copilot
```

### Basic Request
```json
{
  "messages": [
    { "role": "user", "content": "Criar job para troca de válvula" }
  ]
}
```

### Basic Response
```json
{
  "reply": "Job técnico criado...",
  "timestamp": "2025-10-15T00:05:14.143Z"
}
```

## 🧪 Example Queries

### Create Job
```
"Criar job para troca de válvula na bomba 603.0004.02"
```

### Check Postponement
```
"Postergar o job 2333 é seguro?"
```

### Query Work Orders
```
"Quais OS estão pendentes na embarcação Poseidon?"
```

### Failure History
```
"Qual o histórico de falhas no motor STBD?"
```

## ⚙️ Configuration

- **Model**: GPT-4
- **Temperature**: 0.3 (precise)
- **Language**: Portuguese (BR)
- **Style**: Technical, action-oriented

## 📋 Capabilities

✅ Create technical maintenance jobs  
✅ Analyze maintenance postponement safety  
✅ Generate work orders automatically  
✅ Query asset, job, and work order status  
✅ Retrieve failure history  

## 🔧 Setup

1. Deploy function:
   ```bash
   supabase functions deploy mmi-copilot
   ```

2. Set API key:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_key
   ```

3. Test:
   ```bash
   npm test -- src/tests/mmi-copilot.test.ts
   ```

## 📁 Files

- `/supabase/functions/mmi-copilot/index.ts` - Implementation
- `/src/tests/mmi-copilot.test.ts` - Tests (19 tests ✅)
- `MMI_COPILOT_IMPLEMENTATION_GUIDE.md` - Full docs

## ✅ Status

**All 19 tests passing**  
**Ready for production use**  
**No linting issues**  
