# Rewrite Template API - Quick Reference

## 🚀 Quick Start

### Endpoint
```
POST https://[your-project].supabase.co/functions/v1/rewrite-template
```

### Request
```typescript
const { data, error } = await supabase.functions.invoke("rewrite-template", {
  body: { input: "O capitão deve verificar os equipamentos" }
});
```

### Response
```json
{
  "result": "O comandante deve realizar inspeção completa dos equipamentos",
  "timestamp": "2025-10-14T19:47:26.102Z"
}
```

## 📝 Key Features

- **Model**: GPT-4 (high quality)
- **Temperature**: 0.4 (formal, consistent)
- **Purpose**: Rewrite text snippets with maritime technical language
- **Error Handling**: 3 retries with exponential backoff
- **Timeout**: 30 seconds
- **CORS**: Enabled

## 🔧 Configuration

### Environment Variable Required
```bash
OPENAI_API_KEY=sk-...
```

## 📦 Use Cases

1. **Operational Templates**: Rewrite procedures with formal technical language
2. **Checklist Items**: Standardize checklist descriptions
3. **Maritime Communications**: Formalize communications
4. **Training Materials**: Improve instructional content
5. **Technical Documentation**: Enhance technical descriptions

## 🎯 Example Transformations

| Input | Output |
|-------|--------|
| "O capitão deve verificar" | "O comandante deve realizar inspeção" |
| "Checar equipamentos" | "Realizar verificação completa dos equipamentos" |
| "Avisar tripulação" | "Comunicar à tripulação através dos canais apropriados" |

## ⚠️ Error Handling

### Common Errors
- `"Input is required"` - Missing input parameter
- `"OPENAI_API_KEY is not set"` - Missing API key
- `"Erro ao reescrever trecho"` - General API error

### Error Response Format
```json
{
  "error": "Erro ao reescrever trecho",
  "timestamp": "2025-10-14T19:47:26.102Z"
}
```

## 📚 Documentation

- **Full API Docs**: `supabase/functions/rewrite-template/README.md`
- **Implementation Details**: `REWRITE_TEMPLATE_API_IMPLEMENTATION.md`

## 🔄 Comparison

### rewrite-template (NEW)
- For: Short text snippets
- Model: GPT-4
- Temp: 0.4
- Focus: Maritime technical

### rewrite-document (EXISTING)
- For: Full documents
- Model: GPT-4o-mini
- Temp: 0.7
- Focus: General professional

## ✅ Status

**Production Ready** - All tests passing, fully documented.
