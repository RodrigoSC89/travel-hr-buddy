# 🧑‍✈️ PATCH_CM – Crew Management Validation Checklist

**Module:** `crew-management`  
**Generated:** 2025-10-27  
**Status:** 🔶 Partial Implementation

---

## 📋 Validation Checklist

### 1. ✅ Interface de Escala de Tripulação Funcional

**Status:** 🔶 Partial

**Verificações:**
- [ ] UI de escala de tripulação renderiza sem erros
- [ ] Filtros por período/embarcação funcionam
- [ ] Drag-and-drop de escala funcional (se aplicável)
- [ ] Visualização em calendário/grid disponível
- [ ] Responsivo em mobile e desktop

**Dados Necessários:**
```sql
-- Verificar tabelas existentes
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('crew_members', 'crew_schedules', 'crew_assignments');
```

**Implementação Atual:**
- ⚠️ Módulo `crew-app` existe mas não validado
- ⚠️ Módulo unificado `crew-management` não encontrado
- ✅ Tabelas base existem (crew_members, crew_assignments)

**Ações Necessárias:**
1. Consolidar `crew-app` em módulo unificado `crew-management`
2. Criar componente `CrewScheduleCalendar.tsx`
3. Implementar hook `useCrewSchedule.ts` com React Query
4. Criar tabela `crew_schedules` se não existir

---

### 2. ✅ Registro de Embarque/Desembarque Persistido no Banco

**Status:** 🔶 Partial

**Verificações:**
- [ ] Formulário de embarque salva dados no banco
- [ ] Formulário de desembarque salva dados no banco
- [ ] Histórico de embarques acessível
- [ ] Dados validados (datas, documentos, etc.)
- [ ] Logs de auditoria criados

**Schema Necessário:**
```sql
CREATE TABLE IF NOT EXISTS public.crew_embarkations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  embark_date TIMESTAMPTZ NOT NULL,
  disembark_date TIMESTAMPTZ,
  position TEXT NOT NULL,
  contract_type TEXT,
  documents_verified BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crew_embarkations_crew_member ON public.crew_embarkations(crew_member_id);
CREATE INDEX idx_crew_embarkations_vessel ON public.crew_embarkations(vessel_id);
CREATE INDEX idx_crew_embarkations_status ON public.crew_embarkations(status);
```

**RLS Policies:**
```sql
ALTER TABLE public.crew_embarkations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view embarkations for their org"
  ON public.crew_embarkations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crew_members cm
      WHERE cm.id = crew_embarkations.crew_member_id
      AND cm.organization_id = public.get_current_organization_id()
    )
  );
```

**Implementação Atual:**
- ⚠️ Tabela `crew_embarkations` pode não existir
- ✅ Base de `crew_members` existe
- ❌ Componente de embarque/desembarque não validado

**Ações Necessárias:**
1. Verificar se tabela `crew_embarkations` existe
2. Criar migrations se necessário
3. Implementar `EmbarkationForm.tsx`
4. Criar service `crew-embarkation-service.ts`

---

### 3. ✅ Notificações Push/SMS Enviadas e Recebidas

**Status:** ❌ Not Implemented

**Verificações:**
- [ ] Integração com serviço de notificações ativa
- [ ] Notificações push funcionam em mobile (PWA/Capacitor)
- [ ] SMS enviados para tripulantes (se aplicável)
- [ ] Email notifications funcionam
- [ ] Preferências de notificação por usuário

**Integrações Necessárias:**
- **Push:** Capacitor Local Notifications (já instalado)
- **SMS:** Twilio / AWS SNS (requer configuração)
- **Email:** Supabase Auth Email / Resend (já instalado)

**Schema Necessário:**
```sql
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT true,
  phone_number TEXT,
  notification_types JSONB DEFAULT '{"embarkation": true, "schedule_change": true, "documents": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

**Implementação Atual:**
- ❌ Integração de notificações não configurada
- ✅ Capacitor instalado (push local possível)
- ❌ SMS provider não configurado

**Ações Necessárias:**
1. Configurar Capacitor Push Notifications
2. Criar Edge Function para envio de notificações
3. Implementar `notification-service.ts`
4. Adicionar SMS provider (opcional)
5. Criar UI de preferências de notificações

---

### 4. ✅ Dados Reais (Não Mocks) Exibidos no UI

**Status:** 🔶 Partial

**Verificações:**
- [ ] Zero hardcoded data no componente principal
- [ ] Todos os dados vêm de queries Supabase
- [ ] Loading states corretos
- [ ] Error handling implementado
- [ ] Skeleton loaders enquanto carrega

**Implementação Atual:**
- ✅ `src/modules/fleet/index.tsx` usa Supabase queries
- ⚠️ Alguns módulos ainda podem ter mocks
- ❌ Módulo crew-management específico não validado

**Query Example:**
```typescript
// useCrewMembers.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCrewMembers() {
  return useQuery({
    queryKey: ['crew-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*, crew_certifications(*), crew_embarkations(*)')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });
}
```

**Ações Necessárias:**
1. Criar hooks React Query para crew data
2. Remover qualquer mock data de componentes
3. Implementar error boundaries
4. Adicionar skeleton loaders

---

## 🎯 Métricas de Sucesso

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| CRUD Operations | 5/5 sem erros | 0/5 | ❌ |
| Real-time Updates | 100% funcional | 0% | ❌ |
| Mobile Push | Funcional | Não impl. | ❌ |
| Data Coverage | 100% real data | ~30% | 🔶 |
| Response Time | < 2s | N/A | ⏳ |

---

## 📊 Status Geral do Módulo

**Cobertura:** 25%  
**Prioridade:** 🔴 Alta  
**Estimativa:** 32 horas

### Implementado ✅
- Tabela `crew_members` base
- Tabela `crew_assignments` base
- Módulo `crew-app` (parcial)

### Não Implementado ❌
- Interface unificada de crew management
- Sistema de embarque/desembarque completo
- Notificações push/SMS
- Escala visual de tripulação
- Documentos e certificações integradas

### Bloqueadores 🚧
1. Tabela `crew_embarkations` pode não existir
2. Sistema de notificações não configurado
3. Módulo crew-management não consolidado
4. Falta integração com crew-app

---

## 🔧 Próximos Passos

### Fase 1: Database (4h)
1. ✅ Validar schema crew_members
2. 🔲 Criar tabela crew_embarkations
3. 🔲 Criar tabela notification_preferences
4. 🔲 Configurar RLS policies

### Fase 2: Backend (8h)
1. 🔲 Criar Edge Function: send-crew-notification
2. 🔲 Criar service: crew-embarkation-service.ts
3. 🔲 Implementar notification-service.ts
4. 🔲 Configurar Capacitor Push

### Fase 3: Frontend (16h)
1. 🔲 Consolidar módulo crew-management
2. 🔲 Criar CrewScheduleCalendar.tsx
3. 🔲 Criar EmbarkationForm.tsx
4. 🔲 Implementar hooks React Query
5. 🔲 Adicionar real-time subscriptions
6. 🔲 UI de notificações

### Fase 4: Testing (4h)
1. 🔲 Testes unitários dos services
2. 🔲 Testes de integração E2E
3. 🔲 Teste de notificações
4. 🔲 Validação mobile

---

## 📝 Notas de Implementação

### Considerações Técnicas
- Usar React Query para cache e sync
- Implementar Supabase Realtime para updates ao vivo
- Capacitor para notificações mobile
- RLS policies para segurança

### Dependências
- `@tanstack/react-query` ✅ Instalado
- `@capacitor/push-notifications` ✅ Instalado
- `@capacitor/local-notifications` ✅ Instalado

### Referências
- [Crew Management Design Doc](../design/crew-management-spec.md)
- [Notification System Spec](../design/notification-system-spec.md)
- [Capacitor Push Docs](https://capacitorjs.com/docs/apis/push-notifications)

---

**Última Atualização:** 2025-10-27  
**Validado por:** AI System  
**Próxima Revisão:** Após implementação Fase 1
