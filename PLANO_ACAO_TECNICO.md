# 🛠️ PLANO DE AÇÃO TÉCNICO - NAUTILUS ONE
**Para:** Equipe de Desenvolvimento  
**Data:** 2025-10-23

---

## 🎯 OBJETIVOS

1. Eliminar 204 arquivos com `@ts-nocheck`
2. Completar 13 módulos incompletos
3. Remover 550+ `console.log` do código
4. Atingir 80%+ de cobertura de testes
5. Implementar qualidade enterprise-grade

---

## 📅 CRONOGRAMA DETALHADO

### SEMANA 1-2: TypeScript Strict Mode
**Objetivo:** Remover @ts-nocheck dos arquivos core

#### Dia 1-3: Setup
```bash
# 1. Criar branch de trabalho
git checkout -b fix/typescript-strict-mode

# 2. Atualizar tsconfig.json gradualmente
# Habilitar strict: true em módulos específicos
```

#### Dia 4-10: Refatoração Gradual
**Prioridade 1 - Core do sistema:**
- [ ] `src/App.tsx`
- [ ] `src/AppRouter.tsx`
- [ ] `src/contexts/AuthContext.tsx`
- [ ] `src/contexts/OrganizationContext.tsx`
- [ ] `src/contexts/TenantContext.tsx`

**Prioridade 2 - Módulos críticos:**
- [ ] `src/components/fleet/vessel-management-system.tsx`
- [ ] `src/components/reports/AIReportGenerator.tsx`
- [ ] `src/pages/DPIntelligencePage.tsx`

**Ações por arquivo:**
1. Remover `// @ts-nocheck`
2. Executar `npm run type-check`
3. Criar interfaces para tipos ausentes
4. Corrigir erros um por um
5. Testar funcionalidade
6. Commit

**Exemplo de refatoração:**
```typescript
// ❌ ANTES
// @ts-nocheck
const [vessels, setVessels] = useState<any[]>([]);

// ✅ DEPOIS
interface Vessel {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  location: {
    lat: number;
    lng: number;
  };
}

const [vessels, setVessels] = useState<Vessel[]>([]);
```

---

### SEMANA 3: Centralização de Logging

#### Dia 1-2: Setup Logger
```typescript
// src/lib/logger.ts (já existe - apenas padronizar uso)

// ❌ REMOVER TODOS OS CASOS DE:
console.log("User logged in");
console.error("Failed to fetch data");
console.warn("Deprecated API");

// ✅ SUBSTITUIR POR:
import { logger } from "@/lib/logger";

logger.info("User logged in", { userId: user.id });
logger.error("Failed to fetch data", { error, endpoint: "/api/vessels" });
logger.warn("Deprecated API", { apiName: "v1/old-endpoint" });
```

#### Dia 3-5: Busca e Substituição
```bash
# Script automatizado para encontrar e substituir
npm run clean:logs

# Revisar manualmente casos complexos
grep -r "console\." src/ | wc -l  # Deve tender a 0
```

#### Checklist por módulo:
- [ ] Substituir console.log → logger.info
- [ ] Substituir console.error → logger.error
- [ ] Substituir console.warn → logger.warn
- [ ] Adicionar contexto nos logs (ids, timestamps)
- [ ] Testar que logs aparecem no ambiente dev
- [ ] Verificar que logs NÃO aparecem em prod

---

### SEMANA 4: Limpeza de Código

#### TODOs e FIXMEs
```bash
# Encontrar todos os TODOs críticos
grep -r "TODO\|FIXME" src/ > todos.txt

# Priorizar por criticidade
# 1. TODOs em arquivos core
# 2. FIXMEs em edge functions
# 3. TODOs em features novas
```

#### Código Morto
```bash
# Encontrar imports não usados
npm run lint -- --fix

# Remover componentes órfãos
find src/components -name "*.tsx" -type f | while read file; do
  grep -r "$(basename $file .tsx)" src/ | grep -v "$file" || echo "Orphan: $file"
done
```

---

### SEMANA 5: PATCH 51.0 - Real-Time Workspace

#### Estrutura
```
src/modules/real-time-workspace/
├── index.tsx              # Entry point
├── components/
│   ├── CollabEditor.tsx   # Editor colaborativo
│   ├── UsersList.tsx      # Lista de usuários online
│   ├── ChatPanel.tsx      # Chat em tempo real
│   └── StatusBar.tsx      # Barra de status
├── hooks/
│   ├── useRealtimeSync.ts # Hook para Supabase Realtime
│   └── usePresence.ts     # Hook para presença online
└── types.ts               # Tipos TypeScript
```

#### Implementação
```typescript
// src/modules/real-time-workspace/hooks/useRealtimeSync.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeSync(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`workspace:${channelId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'workspace_messages',
          filter: `channel_id=eq.${channelId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);
  
  return { messages };
}
```

#### Banco de Dados (Migration)
```sql
-- Tabela de workspaces
CREATE TABLE workspace_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE workspace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES workspace_channels(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message', -- 'message', 'file', 'status'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE workspace_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users in org can view channels"
  ON workspace_channels FOR SELECT
  USING (user_belongs_to_organization(organization_id));

CREATE POLICY "Users can send messages"
  ON workspace_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Testes
```typescript
// src/modules/real-time-workspace/__tests__/useRealtimeSync.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useRealtimeSync } from "../hooks/useRealtimeSync";

describe("useRealtimeSync", () => {
  it("should sync messages in real-time", async () => {
    const { result } = renderHook(() => useRealtimeSync("test-channel"));
    
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(0);
    });
    
    // Simulate new message
    // ...
  });
});
```

---

### SEMANA 6: PATCH 52.0 - Voice Assistant

#### Estrutura
```
src/modules/voice-assistant/
├── index.tsx
├── components/
│   ├── VoiceRecorder.tsx    # Botão de gravação
│   ├── TranscriptDisplay.tsx # Exibição de transcrição
│   ├── ResponsePlayer.tsx    # Player de áudio de resposta
│   └── CommandList.tsx       # Lista de comandos disponíveis
├── hooks/
│   ├── useSpeechRecognition.ts # Web Speech API
│   └── useTextToSpeech.ts      # Síntese de voz
├── lib/
│   └── commandParser.ts        # Parser de comandos
└── types.ts
```

#### Implementação
```typescript
// src/modules/voice-assistant/hooks/useSpeechRecognition.ts
import { useState, useEffect } from "react";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };
    
    if (isListening) {
      recognition.start();
    }
    
    return () => recognition.stop();
  }, [isListening]);
  
  return { transcript, isListening, setIsListening };
}
```

#### Comandos de Voz Suportados
```typescript
// src/modules/voice-assistant/lib/commandParser.ts
export const VOICE_COMMANDS = {
  navigation: [
    "ir para dashboard",
    "abrir relatórios",
    "mostrar frota",
  ],
  actions: [
    "gerar relatório",
    "enviar email",
    "criar checklist",
  ],
  queries: [
    "qual o status do navio X",
    "quantos tripulantes embarcados",
    "próxima manutenção",
  ],
};

export function parseCommand(transcript: string): {
  type: 'navigation' | 'action' | 'query';
  command: string;
  params: Record<string, string>;
} {
  // Implementar lógica de parsing
  // Usar IA (nautilusLLM) para interpretar comandos naturais
}
```

---

### SEMANA 7-8: PATCH 53.0 - Audit Center

#### Estrutura Completa
```
src/modules/audit-center/
├── index.tsx
├── components/
│   ├── AuditDashboard.tsx      # Dashboard principal
│   ├── AuditList.tsx           # Lista de auditorias
│   ├── AuditDetail.tsx         # Detalhes de auditoria
│   ├── AuditForm.tsx           # Formulário de criação
│   ├── FindingsList.tsx        # Lista de findings
│   ├── ActionPlanTracker.tsx   # Rastreamento de ações
│   └── ComplianceScore.tsx     # Score de compliance
├── hooks/
│   ├── useAudits.ts
│   ├── useFindings.ts
│   └── useActionPlans.ts
└── types.ts
```

#### Schema do Banco
```sql
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  audit_type TEXT NOT NULL, -- 'internal', 'external', 'surprise'
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  auditor_name TEXT,
  scope TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  category TEXT, -- 'safety', 'compliance', 'operational', 'financial'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'dismissed'
  evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  responsible_user_id UUID REFERENCES auth.users(id),
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'overdue'
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### SEMANA 9-10: PATCH 54.0 - Emergency Response

#### Funcionalidades Principais
1. **Protocolos de Emergência**
   - Templates pré-definidos (incêndio, homem ao mar, etc.)
   - Checklist automático de ações
   - Escalação hierárquica

2. **Notificações em Tempo Real**
   - SMS via Twilio/Resend
   - Push notifications (PWA)
   - Email urgente

3. **Rastreamento de Resposta**
   - Timeline de ações tomadas
   - Status de equipes de resposta
   - Logs auditáveis

#### Edge Function de Emergência
```typescript
// supabase/functions/emergency-response/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { emergencyType, vesselId, location, description } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  // 1. Criar registro de emergência
  const { data: emergency } = await supabase
    .from("emergencies")
    .insert({
      type: emergencyType,
      vessel_id: vesselId,
      location,
      description,
      status: "active",
    })
    .select()
    .single();
  
  // 2. Buscar protocolo adequado
  const { data: protocol } = await supabase
    .from("emergency_protocols")
    .select("*")
    .eq("emergency_type", emergencyType)
    .single();
  
  // 3. Notificar equipe de resposta
  const { data: responders } = await supabase
    .from("emergency_responders")
    .select("user_id, notification_preference")
    .eq("vessel_id", vesselId);
  
  // 4. Enviar notificações (SMS, Email, Push)
  for (const responder of responders) {
    // Implementar lógica de notificação
  }
  
  // 5. Criar checklist automático
  await supabase.from("emergency_checklists").insert({
    emergency_id: emergency.id,
    items: protocol.checklist_items,
  });
  
  return new Response(JSON.stringify({ success: true, emergency }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

### SEMANA 11-12: PATCH 55.0 - Training Academy

#### Funcionalidades
1. **Catálogo de Cursos**
   - Cursos obrigatórios (STCW, etc.)
   - Cursos opcionais (soft skills, especialização)
   - Tags e categorização

2. **Progresso de Treinamento**
   - Dashboard individual
   - Tracking de conclusão
   - Certificados digitais

3. **Gamificação**
   - Pontos por curso concluído
   - Badges e conquistas
   - Ranking de aprendizado

#### Schema
```sql
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INT,
  category TEXT, -- 'safety', 'technical', 'leadership', 'compliance'
  is_mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES training_courses(id),
  status TEXT DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'failed'
  progress_percentage INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### SEMANA 13-14: Testes Automatizados

#### Estrutura de Testes
```
src/
├── __tests__/           # Testes unitários globais
├── modules/
│   └── [module]/
│       └── __tests__/   # Testes do módulo
└── e2e/                 # Testes E2E com Playwright
```

#### Checklist de Cobertura
- [ ] Componentes críticos: 100%
- [ ] Hooks customizados: 100%
- [ ] Edge functions: 80%+
- [ ] Fluxos E2E principais: 100%

#### Exemplo de Teste
```typescript
// src/modules/audit-center/__tests__/AuditDashboard.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { AuditDashboard } from "../components/AuditDashboard";

describe("AuditDashboard", () => {
  it("should display list of audits", async () => {
    render(<AuditDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText("Auditorias")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Auditoria SGSO 2024")).toBeInTheDocument();
  });
  
  it("should filter audits by status", async () => {
    const { user } = render(<AuditDashboard />);
    
    await user.click(screen.getByRole("button", { name: /filtrar/i }));
    await user.click(screen.getByText("Concluídas"));
    
    await waitFor(() => {
      expect(screen.queryByText("Auditoria Pendente")).not.toBeInTheDocument();
    });
  });
});
```

---

### SEMANA 15-16: Otimização de Performance

#### Checklist de Otimizações
- [ ] Lazy loading de componentes pesados
- [ ] Virtualização de listas longas (react-window)
- [ ] Memoization com React.memo e useMemo
- [ ] Debouncing em inputs de busca
- [ ] Code splitting por rota
- [ ] Compressão de imagens (WebP)
- [ ] Service Worker para cache

#### Exemplo de Otimização
```typescript
// ❌ ANTES - Lista lenta com 1000+ itens
function VesselList({ vessels }) {
  return (
    <div>
      {vessels.map(vessel => (
        <VesselCard key={vessel.id} vessel={vessel} />
      ))}
    </div>
  );
}

// ✅ DEPOIS - Virtualização
import { FixedSizeList } from "react-window";

function VesselList({ vessels }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <VesselCard vessel={vessels[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={vessels.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## 📊 TRACKING DE PROGRESSO

### Daily Standup Questions
1. O que fiz ontem?
2. O que farei hoje?
3. Tenho algum bloqueio?

### Weekly Review
- Revisar PRs da semana
- Atualizar métricas de progresso
- Ajustar prioridades se necessário

### Métricas Semanais
```bash
# Executar toda sexta-feira
npm run type-check             # Erros TypeScript
npm run test:coverage          # Cobertura de testes
npm run lint                   # Erros de linting
grep -r "console\." src/ | wc -l  # Console.logs restantes
grep -r "@ts-nocheck" src/ | wc -l # @ts-nocheck restantes
```

---

## 🚀 DEPLOYMENT

### Checklist Pré-Deploy
- [ ] Todos os testes passando
- [ ] Coverage >= 80%
- [ ] Lint sem erros
- [ ] TypeScript sem erros
- [ ] Build de produção OK
- [ ] Performance >= 85 (Lighthouse)

### Deploy Process
```bash
# 1. Merge para main
git checkout main
git merge develop

# 2. Tag de release
git tag -a v1.0.0 -m "Release 1.0.0 - 39 Módulos Completos"
git push origin v1.0.0

# 3. Deploy automático (CI/CD)
# Vercel/Netlify/Railway detecta tag e faz deploy
```

---

## 📚 DOCUMENTAÇÃO

### Criar durante o desenvolvimento:
- [ ] `ARCHITECTURE.md` - Arquitetura geral
- [ ] `API.md` - Documentação de APIs
- [ ] `MODULES.md` - Guia de cada módulo
- [ ] `CONTRIBUTING.md` - Guia para contribuidores
- [ ] `CHANGELOG.md` - Histórico de mudanças

---

**Última Atualização:** 2025-10-23  
**Responsável:** Tech Lead  
**Próxima Revisão:** Toda sexta-feira
