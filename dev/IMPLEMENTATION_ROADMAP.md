# 🚀 Nautilus One - Roadmap de Implementação Detalhado

**Base:** PATCH 94.0  
**Meta:** PATCH 102.0  
**Duração:** 10-12 semanas  

---

## 🎯 PATCH 94.2 - Database Critical Fixes

### Objetivos
- Criar tabela `logs`
- Criar tabela `document_templates`
- Criar tabela `ai_reports`
- Validar módulo logs-center funcional

### Passos de Implementação

#### 1. Criar Migration - Logs Table
```bash
cd supabase
supabase migration new create_logs_table
```

Arquivo: `supabase/migrations/XXXXXX_create_logs_table.sql`
```sql
-- Tabela principal de logs
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_module ON logs(module);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_organization_id ON logs(organization_id);

-- Índice composto para queries comuns
CREATE INDEX idx_logs_module_level_timestamp 
ON logs(module, level, timestamp DESC);

-- RLS Policies
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view logs from their organization
CREATE POLICY "users_view_org_logs"
ON logs FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_users 
    WHERE organization_id = logs.organization_id
  )
);

-- Policy: System can insert logs (service_role)
CREATE POLICY "system_insert_logs"
ON logs FOR INSERT
WITH CHECK (true);

-- Policy: Admins can delete old logs
CREATE POLICY "admin_delete_logs"
ON logs FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_users 
    WHERE organization_id = logs.organization_id 
    AND role = 'admin'
  )
  AND created_at < now() - INTERVAL '90 days'
);

-- Function: Auto-cleanup logs older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM logs WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs()');

COMMENT ON TABLE logs IS 'Centralized technical logs with AI-powered audit capabilities';
```

#### 2. Criar Migration - Document Templates
```bash
supabase migration new create_document_templates
```

Arquivo: `supabase/migrations/XXXXXX_create_document_templates.sql`
```sql
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- ["vessel_name", "captain_name", etc]
  file_type TEXT DEFAULT 'docx',
  is_active BOOLEAN DEFAULT true,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_category ON document_templates(category);
CREATE INDEX idx_templates_org ON document_templates(organization_id);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_org_templates"
ON document_templates FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "users_create_templates"
ON document_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON document_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 3. Criar Migration - AI Reports
```bash
supabase migration new create_ai_reports
```

Arquivo: `supabase/migrations/XXXXXX_create_ai_reports.sql`
```sql
CREATE TABLE public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'audit', 'analysis', 'recommendation', 'summary'
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  is_archived BOOLEAN DEFAULT false
);

CREATE INDEX idx_ai_reports_module ON ai_reports(module);
CREATE INDEX idx_ai_reports_type ON ai_reports(report_type);
CREATE INDEX idx_ai_reports_generated ON ai_reports(generated_at DESC);
CREATE INDEX idx_ai_reports_org ON ai_reports(organization_id);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_org_ai_reports"
ON ai_reports FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  )
);
```

#### 4. Deploy Migrations
```bash
# Aplicar migrations
supabase db push

# Validar
supabase db diff

# Se usar Lovable Cloud, aplicar via dashboard
```

#### 5. Atualizar Tipos Supabase
```bash
# Regenerar tipos
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Ou via Lovable
# Os tipos serão atualizados automaticamente
```

#### 6. Testar Logs Center
```typescript
// src/modules/logs-center/__tests__/integration.test.ts
import { supabase } from '@/integrations/supabase/client';

describe('Logs Center Integration', () => {
  it('should insert log successfully', async () => {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        level: 'info',
        module: 'test',
        message: 'Test log entry'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.message).toBe('Test log entry');
  });

  it('should query logs with filters', async () => {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('module', 'system-watchdog')
      .eq('level', 'error')
      .order('timestamp', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### Critérios de Aceitação
- [ ] Tabela `logs` criada com RLS
- [ ] Tabela `document_templates` criada
- [ ] Tabela `ai_reports` criada
- [ ] Migrations aplicadas sem erros
- [ ] Tipos TypeScript atualizados
- [ ] `/dashboard/logs-center` funcional
- [ ] Testes de integração passando
- [ ] Build sem erros

### Tempo Estimado: 2 dias

---

## 🧹 PATCH 94.3 - Registry Cleanup

### Objetivos
- Remover módulos auto-gerados incorretos
- Consolidar módulos deprecated
- Limpar rotas duplicadas
- Atualizar documentação

### Passos de Implementação

#### 1. Backup do Registry Atual
```bash
cp src/modules/registry.ts src/modules/registry.backup.ts
```

#### 2. Remover Entradas Auto-Geradas
Editar `src/modules/registry.ts`:

```typescript
// ❌ REMOVER estas linhas (669-967)
// Todas as entradas que começam com:
// '.home.runner.work.travel-hr-buddy...'

// ✅ MANTER apenas módulos válidos com paths relativos
```

#### 3. Consolidar Módulos Deprecated

```typescript
// src/modules/registry.ts

// ❌ REMOVER COMPLETAMENTE
delete MODULE_REGISTRY['core.shared'];
delete MODULE_REGISTRY['config.settings'];

// 🔄 ATUALIZAR STATUS
MODULE_REGISTRY['compliance.audit-center'] = {
  ...MODULE_REGISTRY['compliance.audit-center'],
  status: 'deprecated',
  description: 'DEPRECATED: Migrar para compliance.hub - Remoção em PATCH 96.0'
};

MODULE_REGISTRY['emergency.risk-management'] = {
  ...MODULE_REGISTRY['emergency.risk-management'],
  status: 'deprecated',
  description: 'DEPRECATED: Migrar para compliance.hub - Remoção em PATCH 96.0'
};

MODULE_REGISTRY['features.checklists'] = {
  ...MODULE_REGISTRY['features.checklists'],
  status: 'deprecated',
  description: 'DEPRECATED: Migrar para compliance.hub - Remoção em PATCH 96.0'
};
```

#### 4. Criar Helper de Validação
```typescript
// src/modules/validation.ts
import { MODULE_REGISTRY } from './registry';

export function validateModuleRegistry() {
  const issues: string[] = [];

  Object.entries(MODULE_REGISTRY).forEach(([id, module]) => {
    // Verificar path válido
    if (module.path.startsWith('/home/runner') || module.path.startsWith('.home')) {
      issues.push(`Invalid path for ${id}: ${module.path}`);
    }

    // Verificar status válido
    const validStatuses = ['active', 'deprecated', 'beta', 'experimental'];
    if (!validStatuses.includes(module.status)) {
      issues.push(`Invalid status for ${id}: ${module.status}`);
    }

    // Verificar rotas duplicadas
    if (module.route) {
      const duplicates = Object.values(MODULE_REGISTRY)
        .filter(m => m.route === module.route && m.id !== id);
      if (duplicates.length > 0) {
        issues.push(`Duplicate route ${module.route}: ${id} and ${duplicates[0].id}`);
      }
    }
  });

  return issues;
}

// Executar durante build
if (import.meta.env.DEV) {
  const issues = validateModuleRegistry();
  if (issues.length > 0) {
    console.warn('⚠️ Module Registry Issues:', issues);
  }
}
```

#### 5. Atualizar INDEX.md
```bash
# Regenerar índice
node scripts/update-module-index.js
```

#### 6. Validar
```bash
npm run type-check
npm run build
node -e "require('./src/modules/validation.ts').validateModuleRegistry()"
```

### Critérios de Aceitação
- [ ] 0 módulos auto-gerados com paths absolutos
- [ ] 0 módulos deprecated sem aviso
- [ ] 0 rotas duplicadas
- [ ] Validação passando
- [ ] INDEX.md atualizado
- [ ] Build sem warnings

### Tempo Estimado: 1 dia

---

## 🔧 PATCH 94.4 - TypeScript Fixes (Parte 1)

### Objetivos
- Remover @ts-nocheck de 5 arquivos críticos
- Criar tipos adequados
- Corrigir erros de tipagem
- Melhorar type safety

### Passos de Implementação

#### 1. Criar Tipos Base

```typescript
// src/types/crew.ts
export interface CrewBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CrewAchievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
}

export interface CrewDossierData {
  id: string;
  member_id: string;
  badges_earned: CrewBadge[];
  achievements: CrewAchievement[];
  total_points: number;
  level: number;
  next_level_points: number;
}
```

```typescript
// src/types/ai.ts
export interface AIRecommendation {
  id: string;
  type: 'crew_rotation' | 'training' | 'maintenance' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  suggested_at: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface AISkillGap {
  crew_member_id: string;
  skill: string;
  current_level: number;
  required_level: number;
  gap_severity: 'minor' | 'moderate' | 'critical';
  training_suggestions: string[];
}

export interface CrewRotationSuggestion {
  current_assignment: string;
  suggested_assignment: string;
  reason: string;
  impact_score: number;
  crew_member_ids: string[];
}
```

```typescript
// src/types/communication.ts
export interface MessageAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_ids: string[];
  channel_id?: string;
  attachments: MessageAttachment[];
  read_by: string[];
  sent_at: string;
  edited_at?: string;
}
```

```typescript
// src/types/logs.ts
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  module: string;
  message: string;
  metadata?: Record<string, unknown>;
  user_id?: string;
  organization_id?: string;
}

export interface AIContextLog {
  id: string;
  module: string;
  context: string;
  ai_response: string;
  tokens_used: number;
  response_time_ms: number;
  created_at: string;
}
```

#### 2. Fix smart-onboarding-wizard.tsx

```typescript
// src/components/automation/smart-onboarding-wizard.tsx
// ❌ ANTES: // @ts-nocheck

// ✅ DEPOIS:
import { useState } from 'react';
import { Button } from '@/components/ui/button';
// ... outros imports

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
}

export function SmartOnboardingWizard() {
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
    totalSteps: 5,
    completedSteps: []
  });

  const [steps] = useState<OnboardingStep[]>([
    // ... definição dos steps
  ]);

  // ... resto da implementação com tipos corretos
}
```

#### 3. Fix integrated-communication-system.tsx

```typescript
// src/components/communication/integrated-communication-system.tsx
import { Message, MessageAttachment } from '@/types/communication';

interface CommunicationSystemProps {
  initialChannel?: string;
}

export function IntegratedCommunicationSystem({ 
  initialChannel 
}: CommunicationSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  
  // ... resto com tipos corretos
}
```

#### 4. Fix ComplianceReporter.tsx

```typescript
// src/components/compliance/ComplianceReporter.tsx
import { LogEntry } from '@/types/logs';

interface ComplianceReport {
  id: string;
  title: string;
  type: 'audit' | 'inspection' | 'certification';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  findings: LogEntry[];
  created_at: string;
}

export function ComplianceReporter() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  
  // ... resto com tipos corretos
}
```

#### 5. Fix control-hub components (4 arquivos)

```typescript
// src/components/control-hub/AIInsightReporter.tsx
import { AIRecommendation } from '@/types/ai';

interface InsightReport {
  insights: AIRecommendation[];
  generated_at: string;
  confidence_score: number;
}

export function AIInsightReporter() {
  const [report, setReport] = useState<InsightReport | null>(null);
  // ...
}

// Aplicar padrão similar para:
// - ControlHubPanel.tsx
// - SystemAlerts.tsx
```

#### 6. Fix crew components

```typescript
// src/components/crew/advanced-crew-dossier-interaction.tsx
import { CrewDossierData } from '@/types/crew';

interface DossierProps {
  crewMemberId: string;
}

export function AdvancedCrewDossierInteraction({ crewMemberId }: DossierProps) {
  const [dossier, setDossier] = useState<CrewDossierData | null>(null);
  // ...
}
```

```typescript
// src/components/crew/crew-ai-insights.tsx
import { AIRecommendation, AISkillGap, CrewRotationSuggestion } from '@/types/ai';

export function CrewAIInsights() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [rotations, setRotations] = useState<CrewRotationSuggestion[]>([]);
  const [skillGaps, setSkillGaps] = useState<AISkillGap[]>([]);
  // ...
}
```

#### 7. Validar
```bash
# Type check
npm run type-check

# Build
npm run build

# Verificar que não há @ts-nocheck nos arquivos críticos
grep -r "@ts-nocheck" src/components/automation/smart-onboarding-wizard.tsx
# Deve retornar vazio
```

### Critérios de Aceitação
- [ ] 0 @ts-nocheck nos 5 arquivos críticos
- [ ] Todos os tipos criados e exportados
- [ ] Type check passando
- [ ] Build sem warnings de tipagem
- [ ] Código type-safe com autocomplete funcionando

### Tempo Estimado: 3 dias

---

## 📊 PATCH 95.0 - Logistics Hub Complete

### Objetivos
- Implementar módulo logistics completo
- Adicionar IA para otimização
- Criar UI funcional
- Integrar com dados reais

### Passos de Implementação

#### 1. Criar Migrations

```sql
-- fuel_optimization_history
CREATE TABLE fuel_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id),
  route_id UUID,
  optimization_type TEXT, -- 'route', 'speed', 'fuel_mix'
  estimated_savings DECIMAL(10,2),
  actual_savings DECIMAL(10,2),
  recommended_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  result JSONB
);

-- logistics_routes
CREATE TABLE logistics_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin_port_id UUID REFERENCES ports(id),
  destination_port_id UUID REFERENCES ports(id),
  waypoints JSONB DEFAULT '[]',
  distance_nm DECIMAL(10,2),
  estimated_duration_hours DECIMAL(8,2),
  fuel_consumption_mt DECIMAL(10,3),
  is_optimized BOOLEAN DEFAULT false,
  optimization_score DECIMAL(3,2)
);

-- supply_chain_events
CREATE TABLE supply_chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  port_id UUID REFERENCES ports(id),
  description TEXT,
  severity TEXT,
  occurred_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);
```

#### 2. Criar Estrutura do Módulo

```bash
mkdir -p src/modules/logistics/components
mkdir -p src/modules/logistics/hooks
mkdir -p src/modules/logistics/services
mkdir -p src/modules/logistics/types
```

#### 3. Implementar Serviço de IA

```typescript
// src/modules/logistics/services/fuelOptimizer.ts
import { runAIContext } from '@/ai/kernel';

export class FuelOptimizerService {
  async optimizeRoute(routeData: RouteData): Promise<OptimizationResult> {
    const context = `
      Route: ${routeData.origin} to ${routeData.destination}
      Distance: ${routeData.distance} nm
      Vessel: ${routeData.vesselType}
      Current fuel consumption: ${routeData.currentFuelConsumption} MT/day
      Weather conditions: ${routeData.weather}
    `;

    const aiResponse = await runAIContext('fuel-optimization', context);
    
    return {
      optimizedRoute: aiResponse.optimizedRoute,
      estimatedSavings: aiResponse.savings,
      recommendations: aiResponse.recommendations
    };
  }
}
```

#### 4. Adicionar Padrão IA no Kernel

```typescript
// src/ai/kernel.ts
case 'fuel-optimization':
  systemPrompt = `Você é um especialista em otimização de consumo de combustível marítimo.
  
Analise a rota fornecida e:
1. Identifique oportunidades de economia de combustível
2. Sugira ajustes de velocidade otimizados
3. Recomende rotas alternativas considerando correntes e ventos
4. Calcule economia estimada em toneladas e custo

Forneça resposta estruturada em JSON.`;
  break;
```

#### 5. Criar Componentes UI

```typescript
// src/modules/logistics/components/LogisticsHub.tsx
export function LogisticsHub() {
  return (
    <div className="space-y-6">
      <LogisticsOverview />
      <RouteOptimizer />
      <FuelConsumptionChart />
      <SupplyChainAlerts />
    </div>
  );
}
```

### Critérios de Aceitação
- [ ] Tabelas criadas e migradas
- [ ] IA funcionando com dados reais
- [ ] UI completa e responsiva
- [ ] Testes de integração passando
- [ ] Documentação atualizada

### Tempo Estimado: 1 semana

---

## 💰 PATCH 96.0 - Finance Hub Implementation

### Objetivos
- Criar módulo de finanças
- Implementar gestão de orçamento
- Integrar com expenses existente
- Adicionar relatórios financeiros

### Passos de Implementação

[Conteúdo similar ao PATCH 95.0]

---

## 🎤 PATCH 97.0 - Voice Assistant Complete

### Objetivos
- Implementar reconhecimento de voz
- Adicionar comandos de voz
- Criar UI de feedback
- Integrar com sistema existente

### Passos de Implementação

[Conteúdo similar aos patches anteriores]

---

## 🤝 PATCH 98.0 - Workspace Collaboration

### Objetivos
- Implementar CRDT com Y.js
- Adicionar co-editing
- Criar awareness system
- Chat em tempo real

### Passos de Implementação

[Conteúdo similar aos patches anteriores]

---

## 📈 Tracking Progress

Use este checklist para acompanhar o progresso:

```markdown
## PATCH 94.2 - Database Fixes
- [ ] Migration logs criada
- [ ] Migration templates criada
- [ ] Migration ai_reports criada
- [ ] Migrations aplicadas
- [ ] Tipos atualizados
- [ ] Testes passando

## PATCH 94.3 - Registry Cleanup
- [ ] Backup criado
- [ ] Entradas auto-geradas removidas
- [ ] Deprecated consolidados
- [ ] Validação implementada
- [ ] INDEX.md atualizado

## PATCH 94.4 - TypeScript Fixes
- [ ] Tipos base criados
- [ ] smart-onboarding-wizard.tsx fixed
- [ ] integrated-communication-system.tsx fixed
- [ ] ComplianceReporter.tsx fixed
- [ ] control-hub components fixed
- [ ] crew components fixed

[... continuar para cada patch]
```

---

**Última atualização:** 2025-10-24  
**Mantenedor:** Equipe Nautilus One  

🌊 _"Código limpo, sistema robusto"_
