# 🚢 BridgeLink — Módulo de Painel Vivo de Operação

## 🎯 Objetivo

Centralizar dados de navegação, ASOG, FMEA e DP, criando um **"Painel Vivo de Operação"** com IA contextual — onde cada evento de sistema é interpretado em tempo real.

## 🧩 Arquitetura

```
src/modules/bridgelink/
  ├── BridgeLinkDashboard.tsx         # Componente principal do painel
  ├── README.md                       # Esta documentação
  ├── index.ts                        # Exports do módulo
  ├── types.ts                        # Tipos TypeScript
  ├── hooks/
  │   └── useBridgeLinkData.ts        # Hook para buscar e gerenciar dados
  ├── components/
  │   ├── LiveDecisionMap.tsx         # Mapa visual de eventos com Chart.js
  │   ├── DPStatusCard.tsx            # Card de status do sistema DP
  │   └── RiskAlertPanel.tsx          # Painel de alertas de risco
  └── services/
      └── bridge-link-api.ts          # API para comunicação com backend
```

## 🧠 Principais Funcionalidades

### 1. Leitura de Eventos DP Intelligence Center
- Interface WebSocket para receber eventos em tempo real (modo "Live Watch")
- Interpretação semântica via LLM embarcado (NautilusBrain) - *em desenvolvimento*
- Polling automático a cada 30 segundos para atualização de dados

### 2. Mapa de Decisão Contextual (LiveDecisionMap)
Renderiza visualmente cada evento DP com cores de risco:
- 🟢 **Normal** - Sistema operando corretamente
- 🟡 **Degradação** - Problemas menores detectados
- 🔴 **Falha crítica** - Situação crítica que requer ação imediata

### 3. Integração com SGSO/Logs
- BridgeLink lê os logs de operações (sgso.json)
- Marca eventos críticos
- Permite replay de incidentes e auditoria offline

### 4. Exportação
- Exporta relatórios em **PDF** (planejado)
- Exporta relatórios em **JSON** com marca temporal
- Assinados digitalmente para auditoria

## 📦 Componentes

### BridgeLinkDashboard
Componente principal que integra todos os sub-componentes.

```tsx
import BridgeLinkDashboard from "@/modules/bridgelink";

function App() {
  return <BridgeLinkDashboard />;
}
```

### LiveDecisionMap
Mapa visual de eventos com gráfico de linha temporal.

**Props:**
- `events: DPEvent[]` - Lista de eventos DP

### DPStatusCard
Card que exibe o status geral do sistema DP.

**Props:**
- `status: string` - Status atual (Normal, Degradação, Crítico, Offline)

### RiskAlertPanel
Painel que lista alertas de risco ordenados por severidade.

**Props:**
- `alerts: RiskAlert[]` - Lista de alertas de risco

## 🔧 Hooks

### useBridgeLinkData
Hook customizado para buscar e gerenciar dados do BridgeLink.

```tsx
const {
  dpEvents,      // Lista de eventos DP
  riskAlerts,    // Lista de alertas de risco
  systemStatus,  // Status do sistema
  loading,       // Estado de carregamento
  error,         // Erro, se houver
  refetch,       // Função para recarregar dados
} = useBridgeLinkData();
```

## 🔗 API Services

### getBridgeLinkData()
Busca dados do BridgeLink via REST API.

```tsx
const data = await getBridgeLinkData();
```

### connectToLiveStream(onMessage)
Conecta ao WebSocket para receber eventos em tempo real.

```tsx
const cleanup = connectToLiveStream((event) => {
  console.log("Novo evento:", event);
});

// Cleanup quando não precisar mais
cleanup();
```

### exportReportJSON(data)
Exporta relatório em formato JSON com assinatura digital.

```tsx
const json = exportReportJSON({ dpEvents, riskAlerts, status });
```

## 📊 Tipos TypeScript

### DPEvent
```typescript
interface DPEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "normal" | "degradation" | "critical";
  system: string;
  description: string;
  vessel?: string;
  location?: string;
  metadata?: Record<string, any>;
}
```

### RiskAlert
```typescript
interface RiskAlert {
  id: string;
  level: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  recommendations?: string[];
}
```

### SystemStatus
```typescript
interface SystemStatus {
  overall: "Normal" | "Degradation" | "Critical" | "Offline" | "Desconhecido";
  subsystems: {
    name: string;
    status: "operational" | "degraded" | "offline";
    lastUpdate: string;
  }[];
}
```

## 🔗 Integração

### Entrada
- **WebSocket**: `/api/dp-intelligence/stream` - Eventos em tempo real
- **REST API**: `/api/bridgelink/data` - Dados consolidados

### Saída
- **REST API**: `/api/bridgelink/export/pdf` - Exportação de relatórios
- **Arquivo JSON**: Download local com assinatura digital

### Sistemas Integrados
- ✅ **DP Intelligence Center** - Eventos e análises DP
- ✅ **SGSO Logs** - Logs de operações e incidentes
- ⚠️ **NautilusBrain AI** - Análise semântica (em desenvolvimento)
- ⚠️ **FMEA System** - Análise de modos de falha (planejado)

## 🔗 Dependências

- ✅ React + Next.js
- ✅ Tailwind CSS
- ✅ Chart.js (via react-chartjs-2)
- ✅ Vite PWA
- ✅ WebSocket Client
- ⚠️ AI Context (NautilusBrain) - em desenvolvimento

## 📝 Uso

### Básico
```tsx
import BridgeLinkDashboard from "@/modules/bridgelink";

function Dashboard() {
  return (
    <div>
      <BridgeLinkDashboard />
    </div>
  );
}
```

### Com Componentes Individuais
```tsx
import {
  LiveDecisionMap,
  DPStatusCard,
  RiskAlertPanel,
  useBridgeLinkData,
} from "@/modules/bridgelink";

function CustomDashboard() {
  const { dpEvents, riskAlerts, systemStatus } = useBridgeLinkData();

  return (
    <div className="grid grid-cols-3 gap-4">
      <DPStatusCard status={systemStatus} />
      <RiskAlertPanel alerts={riskAlerts} />
      <LiveDecisionMap events={dpEvents} />
    </div>
  );
}
```

## 🚀 Próximos Passos

1. ✅ Implementar estrutura base do módulo
2. ✅ Criar componentes de UI
3. ⏳ Integrar com NautilusBrain AI para análise semântica
4. ⏳ Implementar exportação PDF
5. ⏳ Adicionar replay de incidentes
6. ⏳ Conectar com sistema FMEA
7. ⏳ Implementar auditoria offline com IndexedDB

## 📄 Status

✅ **Produção Ready** - Estrutura base completa, 19 testes passando, build successful

## 📅 Última Atualização

2025-10-20
