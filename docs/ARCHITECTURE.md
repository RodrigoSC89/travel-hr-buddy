# 🏗️ ARQUITETURA NAUTI ONE

**Data:** 31/01/2026  
**Versão:** v4.0  
**Status:** PRODUÇÃO

---

## 📋 VISÃO GERAL

NAUTI ONE é uma plataforma completa de gestão marítima que integra:
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **IA:** 11 Edge Functions de IA com OpenAI GPT-4o
- **Real-time:** Supabase Realtime + WebSocket

---

## 🏛️ ESTRUTURA DO PROJETO

```
travel-hr-buddy/
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── ui/          # shadcn/ui components
│   │   ├── v2/          # Componentes V2 (Cards, Tables, etc)
│   │   ├── fleet/       # Componentes de frota
│   │   ├── ai/          # Componentes de IA
│   │   └── ...
│   ├── pages/           # Páginas/Rotas da aplicação
│   ├── hooks/           # React hooks customizados
│   │   ├── useVessels*.ts
│   │   ├── useCrew*.ts
│   │   ├── useMaintenance*.ts
│   │   └── ...
│   ├── modules/         # Módulos de negócio
│   │   ├── compliance-hub/
│   │   ├── medical-infirmary/
│   │   ├── nauti-people/
│   │   └── ...
│   ├── lib/             # Utilitários e bibliotecas
│   │   ├── logger.ts    # Logger centralizado
│   │   ├── db/          # IndexedDB para offline
│   │   └── ...
│   ├── integrations/    # Integrações externas
│   │   └── supabase/    # Cliente Supabase
│   └── config/          # Configurações
│       └── sidebar-routes.ts
├── supabase/
│   ├── migrations/      # 420+ SQL migrations
│   └── functions/       # 11 Edge Functions de IA
├── docs/                # Documentação
└── scripts/             # Scripts de CI/Gates
```

---

## 🔌 INTEGRAÇÃO FRONTEND-BACKEND

### Padrão de Hooks

Todos os hooks seguem o padrão:

```typescript
// src/hooks/useVesselsRealData.ts
export function useVessels() {
  return useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*");
      
      if (error) throw error;
      return data;
    }
  });
}
```

### Edge Functions de IA

| Edge Function | Descrição | Módulos |
|---------------|-----------|---------|
| `ai-hub-chat` | Chat central de IA | RAG, Copilot |
| `ai-maintenance` | Manutenção preditiva | Maintenance |
| `ai-compliance` | Verificação regulatória | Compliance |
| `ai-safety` | Análise de segurança | Safety, SGSO |
| `ai-crew` | Gestão de tripulação | Crew, HR |
| `ai-voyage` | Otimização de viagens | Voyages |
| `ai-document` | Análise documental | Documents |
| `ai-training` | Treinamento IA | Academy |
| `ai-audit` | Auditoria IA | Audit |
| `safety-incident-ai` | Incidentes de segurança | Safety |
| `inventory-spares-ai` | Inventário e peças | Inventory |

---

## 📊 BANCO DE DADOS

### Tabelas Principais

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `vessels` | Embarcações | ✅ |
| `crew_members` | Tripulação | ✅ |
| `maintenance_records` | Manutenções | ✅ |
| `compliance_records` | Conformidade | ✅ |
| `voyages` | Viagens | ✅ |
| `maritime_certificates` | Certificados | ✅ |
| `soc_alerts` | Alertas de segurança | ✅ |
| `ai_chat_messages` | Mensagens de IA | ✅ |
| `audit_logs` | Logs de auditoria | ✅ |

### Políticas RLS

- **2.395+ políticas** implementadas
- Todas tabelas protegidas por organização
- Segregação por `organization_id` ou `user_id`

---

## 🧪 QUALIDADE DE CÓDIGO

### CI/CD Gates

```bash
# Verificar console.log
npm run gate:no-console

# Verificar mocks
npm run gate:no-mock

# Verificar @ts-ignore
npm run gate:no-ts-ignore
```

### Métricas Atuais

| Métrica | Valor |
|---------|-------|
| `console.log` em prod | 0 (via logger) |
| `@ts-ignore` em prod | 0 |
| Mock data em hooks | 0 |
| Cobertura de testes | ~60% |

---

## 🔐 SEGURANÇA

### Autenticação

- Supabase Auth (email/senha + OAuth)
- MFA disponível
- Session refresh automático

### Autorização

- RLS em todas tabelas
- RBAC por organização
- Audit logging em operações críticas

---

## 📱 FUNCIONALIDADES OFFLINE

- **IndexedDB** para cache local
- **Service Worker** para PWA
- **Sync Engine** para sincronização
- **Delta Sync** para eficiência

---

## 🚀 DEPLOY

### Ambientes

| Ambiente | URL | Status |
|----------|-----|--------|
| Produção | Lovable.dev | ✅ |
| Staging | - | Em configuração |

### Build

```bash
npm run build
# Output: dist/
# Tamanho: ~25MB (inclui WASM para OCR)
```

---

## 📈 PRÓXIMOS PASSOS

1. **Testes E2E** - Expandir cobertura Playwright
2. **Documentação API** - Swagger/OpenAPI
3. **Monitoramento** - Sentry/DataDog
4. **Performance** - Otimização de bundles

---

**Última atualização:** 31/01/2026
