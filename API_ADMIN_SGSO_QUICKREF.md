# API Admin SGSO - Quick Reference

## 🚀 Endpoint
```
GET /api/admin/sgso
```

## 📊 Classificação de Risco Automática

```
🔴 Alto:     5+ falhas críticas
🟠 Moderado: 3–4 falhas
🟢 Baixo:    <3 falhas
```

## 📝 Response Format
```typescript
[
  {
    embarcacao: "Nome do Navio",
    total: 7,
    por_mes: {
      "2025-10": 3,
      "2025-09": 2,
      "2025-08": 2
    },
    risco: "alto" | "moderado" | "baixo"
  }
]
```

## ✅ Status da Implementação

- ✅ Função RPC `auditoria_metricas_risco` criada
- ✅ Endpoint `/api/admin/sgso` implementado
- ✅ 45 testes unitários (100% passing)
- ✅ Documentação completa
- ✅ Build verificado
- ✅ TypeScript types definidos

## 🔍 Arquivos Criados

1. **Database Migration**: `supabase/migrations/20251016200000_create_auditoria_metricas_risco.sql`
2. **API Endpoint**: `pages/api/admin/sgso.ts`
3. **Tests**: `src/tests/admin-sgso-api.test.ts` (45 tests)
4. **Documentation**: `API_ADMIN_SGSO.md`

## 🎯 Funcionalidade

A API agora:
- ✅ Agrega automaticamente incidentes de segurança por embarcação
- ✅ Calcula total de falhas críticas nos últimos 12 meses
- ✅ Classifica risco automaticamente (baixo/moderado/alto)
- ✅ Retorna dados prontos para painéis interativos SGSO

## 💡 Uso em Dashboard

```typescript
// React Example
fetch('/api/admin/sgso')
  .then(res => res.json())
  .then(data => {
    data.forEach(vessel => {
      console.log(`${vessel.embarcacao}: ${vessel.risco} risco`);
    });
  });
```

## 📌 Notas Técnicas

- Usa função RPC do Supabase para performance
- Agrega dados de `safety_incidents` com severidade crítica/alta
- Classifica risco baseado em lógica de negócio ANP
- Pronto para uso em Painel Interativo SGSO

---

**Status**: ✅ Pronto para Produção  
**Versão**: 1.0.0  
**Data**: 2025-10-16
