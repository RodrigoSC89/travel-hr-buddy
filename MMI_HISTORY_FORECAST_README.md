# MMI - Painel de Histórico e Forecast com IA

## 📋 Resumo das Implementações

Este documento descreve as novas funcionalidades implementadas no Módulo MMI (Manutenção Inteligente), incluindo:

1. **Painel de Histórico Completo** - Visualização e gestão de manutenções realizadas
2. **Forecast de IA Real com GPT-4** - Previsões técnicas baseadas em horímetro e histórico
3. **Criação Automática de Ordens de Serviço** - Geração automática de tarefas e OS a partir dos forecasts

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `mmi_history`

Armazena o histórico de manutenções realizadas com status de execução.

```sql
CREATE TABLE mmi_history (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  system_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  executed_at TIMESTAMP,
  status TEXT CHECK (status IN ('executado', 'pendente', 'atrasado')),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos principais:**
- `system_name`: Nome do sistema (ex: "Sistema Hidráulico")
- `task_description`: Descrição da tarefa executada
- `status`: Estado da manutenção (executado, pendente, atrasado)
- `pdf_url`: Link para relatório PDF exportado

### Tabela: `mmi_tasks`

Armazena tarefas de manutenção criadas automaticamente pelos forecasts de IA.

```sql
CREATE TABLE mmi_tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forecast_date DATE,
  vessel_id UUID REFERENCES vessels(id),
  system_name TEXT,
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ai_reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos principais:**
- `title`: Título da tarefa
- `description`: Descrição completa com detalhes técnicos
- `forecast_date`: Data prevista para execução
- `priority`: Prioridade (low, medium, high, critical)
- `ai_reasoning`: Justificativa técnica gerada pela IA

---

## 🎨 Componentes de Interface

### 1. HistoryPanel

**Localização:** `src/components/mmi/HistoryPanel.tsx`

Painel para visualização e gestão do histórico de manutenções.

**Funcionalidades:**
- ✅ Listagem de manutenções com filtros por status
- ✅ Filtros: "Todos", "Executado", "Pendente", "Atrasado"
- ✅ Exportação individual em PDF
- ✅ Exportação em lote (múltiplos registros)
- ✅ Visualização de embarcação e sistema
- ✅ Badge colorido por status

**Uso:**
```tsx
import HistoryPanel from "@/components/mmi/HistoryPanel";

<HistoryPanel />
```

### 2. ForecastGenerator

**Localização:** `src/components/mmi/ForecastGenerator.tsx`

Gerador de forecasts com integração GPT-4.

**Funcionalidades:**
- ✅ Exibição do status do componente (horímetro atual, intervalo, progresso)
- ✅ Geração de forecast com GPT-4 em tempo real
- ✅ Análise técnica baseada em histórico
- ✅ Criação automática de tarefa após forecast
- ✅ Indicadores visuais de prioridade

**Props:**
```tsx
interface ForecastGeneratorProps {
  component: MMIComponent;
  systemName: string;
  vesselId?: string;
  maintenanceHistory: MMIHistory[];
  onForecastGenerated?: () => void;
}
```

**Uso:**
```tsx
import ForecastGenerator from "@/components/mmi/ForecastGenerator";

<ForecastGenerator
  component={componentData}
  systemName="Sistema Hidráulico"
  vesselId="vessel-uuid"
  maintenanceHistory={history}
  onForecastGenerated={() => console.log("Forecast generated!")}
/>
```

---

## 📄 Páginas

### 1. MMIHistory

**Rota:** `/mmi/history`

**Localização:** `src/pages/MMIHistory.tsx`

Página dedicada ao painel de histórico de manutenções.

### 2. MMITasks

**Rota:** `/mmi/tasks`

**Localização:** `src/pages/MMITasks.tsx`

Página para visualização e gestão de tarefas criadas automaticamente.

**Funcionalidades:**
- ✅ Listagem de tarefas com filtros
- ✅ Visualização de detalhes completos
- ✅ Botões para iniciar, concluir ou criar OS
- ✅ Modal com informações técnicas da IA
- ✅ Badges de prioridade e status

---

## 🔧 Serviços

### 1. forecastService

**Localização:** `src/services/mmi/forecastService.ts`

Serviço para geração de forecasts usando GPT-4.

**Função principal:**
```typescript
async function generateForecast(input: ForecastInput): Promise<AIForecast>
```

**Características:**
- ✅ Integração real com GPT-4o
- ✅ Análise baseada em horímetro atual
- ✅ Considera histórico de manutenções
- ✅ Gera justificativa técnica
- ✅ Determina prioridade automaticamente
- ✅ Calcula data sugerida

**Prompt de IA:**
O serviço usa um prompt especializado que considera:
- Sistema e componente
- Horímetro atual vs intervalo de manutenção
- Histórico de manutenções anteriores
- Fabricante e modelo
- Progresso percentual

**Resposta:**
```typescript
interface AIForecast {
  next_intervention: string;    // Descrição da intervenção
  reasoning: string;            // Justificativa técnica
  impact: string;               // Impacto de não executar
  priority: "low" | "medium" | "high" | "critical";
  suggested_date: string;       // Data sugerida (YYYY-MM-DD)
  hourometer_current: number;   // Horímetro atual
  maintenance_history: Array<{
    date: string;
    action: string;
  }>;
}
```

### 2. taskService

**Localização:** `src/services/mmi/taskService.ts`

Serviço para gestão de tarefas e criação automática de OS.

**Funções principais:**

```typescript
// Criar tarefa a partir de forecast
async function createTaskFromForecast(input: CreateTaskFromForecastInput): Promise<MMITask>

// Buscar tarefas com filtros
async function fetchTasks(filters?: {...}): Promise<MMITask[]>

// Atualizar status da tarefa
async function updateTaskStatus(taskId: string, status: string): Promise<boolean>

// Criar Ordem de Serviço a partir da tarefa
async function createWorkOrderFromTask(taskId: string): Promise<{os_number: string; id: string}>
```

**Fluxo de criação de OS:**
1. Busca ou cria um `mmi_job` correspondente
2. Gera número de OS sequencial (formato: OS-YYYYNNNN)
3. Cria registro em `mmi_os`
4. Atualiza status da tarefa para "em_andamento"
5. Retorna número da OS gerada

---

## 🚀 Fluxo de Uso

### Cenário 1: Gerar Forecast e Criar Tarefa

1. Usuário acessa um componente com horímetro próximo ao intervalo
2. Clica em "Gerar Forecast com GPT-4"
3. IA analisa o componente e histórico
4. Sistema exibe:
   - Próxima intervenção necessária
   - Justificativa técnica
   - Impacto de não executar
   - Prioridade sugerida
   - Data recomendada
5. Usuário clica em "Criar Tarefa e OS Automaticamente"
6. Sistema cria tarefa em `mmi_tasks`
7. Tarefa fica disponível na página `/mmi/tasks`

### Cenário 2: Gerenciar Tarefas e Criar OS

1. Usuário acessa `/mmi/tasks`
2. Visualiza tarefas pendentes ordenadas por prioridade
3. Clica em "Ver Detalhes" para análise completa
4. Clica em "Criar OS" para gerar Ordem de Serviço
5. Sistema:
   - Cria job em `mmi_jobs` (se não existir)
   - Gera OS com numeração automática
   - Atualiza status da tarefa
6. OS criada e registrada em `mmi_os`

### Cenário 3: Consultar Histórico e Exportar PDF

1. Usuário acessa `/mmi/history`
2. Filtra por status (executado, pendente, atrasado)
3. Seleciona um ou mais registros
4. Clica em "Exportar PDF" (individual) ou "Exportar Selecionados" (lote)
5. Sistema gera PDF com:
   - Informações do sistema e embarcação
   - Descrição da manutenção
   - Status e data de execução
   - Rodapé com data de geração

---

## 🧪 Testes

**Localização:** `src/tests/mmi-types.test.ts`

Testes de tipo para validar as interfaces TypeScript:

```bash
npm run test
```

**Cobertura:**
- ✅ Validação de tipos `MMIHistory`
- ✅ Validação de tipos `MMITask`
- ✅ Validação de tipos `AIForecast`
- ✅ Verificação de valores válidos para status
- ✅ Verificação de valores válidos para prioridade

---

## 📝 Tipos TypeScript

**Localização:** `src/types/mmi.ts`

### MMIHistory
```typescript
interface MMIHistory {
  id: string;
  vessel_id?: string;
  system_name: string;
  task_description: string;
  executed_at?: string;
  status: "executado" | "pendente" | "atrasado";
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
  vessel?: { id: string; name: string };
}
```

### MMITask
```typescript
interface MMITask {
  id: string;
  title: string;
  description: string;
  forecast_date?: string;
  vessel_id?: string;
  system_name?: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  assigned_to?: string;
  created_by?: string;
  priority: "low" | "medium" | "high" | "critical";
  ai_reasoning?: string;
  created_at?: string;
  updated_at?: string;
}
```

### AIForecast
```typescript
interface AIForecast {
  next_intervention: string;
  reasoning: string;
  impact: string;
  priority: "low" | "medium" | "high" | "critical";
  suggested_date: string;
  hourometer_current: number;
  maintenance_history: Array<{
    date: string;
    action: string;
  }>;
}
```

---

## 🔐 Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-...
```

**⚠️ Importante:** Em produção, mova a chamada da API OpenAI para o backend (edge functions) para proteger a chave da API.

---

## 🎯 Melhorias Futuras

### Curto Prazo
- [ ] Mover integração OpenAI para edge functions
- [ ] Adicionar filtros por embarcação no histórico
- [ ] Implementar paginação nas listagens
- [ ] Adicionar busca por texto no histórico

### Médio Prazo
- [ ] Dashboard com estatísticas do histórico
- [ ] Notificações push para tarefas críticas
- [ ] Integração com sistema de estoque de peças
- [ ] Relatório consolidado mensal

### Longo Prazo
- [ ] Machine learning para previsão de falhas
- [ ] Integração com sensores IoT
- [ ] Aplicativo móvel para técnicos em campo
- [ ] Sistema de aprovação de OS

---

## 📞 Suporte

Para dúvidas ou problemas:
- **Documentação completa:** `/mmi_readme.md`
- **Issues:** GitHub Issues
- **Testes:** `npm run test`
- **Build:** `npm run build`

---

**Versão:** 1.0.0  
**Data:** 19 de Outubro de 2025  
**Autor:** Equipe MMI - Nautilus AI
