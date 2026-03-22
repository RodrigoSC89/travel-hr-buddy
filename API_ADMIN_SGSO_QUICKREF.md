# API Admin SGSO - Quick Reference

## 🚀 Endpoint Quick Info

**URL**: `/api/admin/sgso`  
**Method**: `GET`  
**Auth**: Service Role Key required

## 📋 Response Format

```json
[
  {
    "embarcacao": "string",
    "total": number,
    "por_mes": {
      "YYYY-MM": number
    }
  }
]
```

## 🔧 Implementation Files

- **API**: `pages/api/admin/sgso.ts`
- **Tests**: `src/tests/admin-sgso-api.test.ts`
- **Docs**: `API_ADMIN_SGSO_IMPLEMENTATION.md`

## ✅ Features

- 🚢 **Lista de embarcações** com métricas de risco
- 📊 **Risco total** acumulado por embarcação
- 📆 **Histórico mensal** de falhas críticas
- 🔍 **Dados SGSO** prontos para painéis

## 💡 Quick Usage

```typescript
// Frontend fetch example
const response = await fetch('/api/admin/sgso');
const data = await response.json();

// data structure:
// [
//   {
//     embarcacao: "Navio A",
//     total: 10,
//     por_mes: { "2025-01": 4, "2025-02": 6 }
//   }
// ]
```

## 🎯 Use Cases

1. **SGSO Dashboard** - Métricas de segurança operacional
2. **ANP Compliance** - Dados para relatórios ANP
3. **Risk Analysis** - Análise de tendências de risco

## 🧪 Testing

```bash
npm test -- src/tests/admin-sgso-api.test.ts
```

**46 tests** ✅ All passing

## 📊 Data Flow

```
1. Client → GET /api/admin/sgso
2. API → RPC auditoria_metricas_risco()
3. API → Aggregate by embarcacao
4. API → Return grouped data
5. Client ← JSON response
```

## 🔐 Security

- Service role key authentication
- Method validation (GET only)
- Error handling & logging
- Portuguese error messages

## ⚡ Key Features

✅ TypeScript typed  
✅ Lint-free code  
✅ Comprehensive tests  
✅ Error handling  
✅ Documentation in PT-BR  

---

**Created**: 2025-10-16  
**Status**: ✅ Production Ready
