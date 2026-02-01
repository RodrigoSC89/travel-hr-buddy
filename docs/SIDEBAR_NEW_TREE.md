# 🌳 SIDEBAR NEW TREE - NAUTI ONE

> **Nova Estrutura do Sidebar Pós-Fusão**
> Data: Janeiro 2026

---

## 📋 ÁRVORE FINAL DO SIDEBAR

```
🧠 Central de Comando (mantido)
├── Visão Geral
├── Operações
├── Executivo
├── IA Central
├── Resiliência
├── Alertas
├── NOC 24/7
├── NOC Monitoring
└── SOC Dashboard

🚀 Operations Command (NOVO HUB)
├── ⚓ Maritime (+ Bridge Link, + seções internas)
├── 🚢 Fleet (+ Drydock, + Histórico, + Digital Twin)
├── 🗺️ Voyage (+ Otimização Rotas)
├── 🎯 Mission
└── 📦 Logistics

📦 Cargo & Port Operations (NOVO HUB)
├── Cargo
├── Port Call
└── Visão Integrada

📝 Vessel Contracts (NOVO HUB)
├── Contratos
├── Charter Party
└── Compliance

👥 Crew Operations (NOVO HUB)
├── Gestão
├── CTS
├── MLC
├── Certificações
└── Horas

🔧 Manutenção (mantido)
├── Central de Manutenção
├── Manutenção Preditiva ML
├── Saúde da Frota
├── IA Copilot
├── Jobs & Ordens
├── Forecast IA
└── Digital Twin 3D

🤖 AI Control Tower (NOVO HUB)
├── Hub
├── Chat & Assistants
├── Agentes
├── Workflows
├── Analytics
├── Observabilidade
├── Auditoria
└── Journaling

🎙️ Voice & Assistant (NOVO HUB)
├── Assistente
├── Comandos
└── Integração

📡 Tracking & Telemetry (NOVO HUB)
├── Visão Geral
├── Tempo Real
├── Preditiva
├── Alertas
└── Histórico

📄 Document Center (NOVO HUB)
├── Documentos
├── Templates
├── Checklists
├── Relatórios
├── Workflow
├── Exportar
└── Busca

📢 Comms & Alerts (NOVO HUB)
├── Comunicação
├── Alertas
├── Workspace
└── Conectividade

👥 People Hub (NOVO HUB)
├── Visão Geral
├── Talent Intelligence
├── Performance
├── Bem-estar
├── Treinamento
├── Compliance
└── Analytics

🤖 AI Enterprise Engines (mantido)
├── (12 módulos de IA especializados)

🔬 Inteligência Avançada (mantido)
├── (7 módulos)

🏢 Enterprise Intelligence (mantido)
├── (16 módulos)

🚀 Módulos Avançados (mantido)
├── (12 módulos)

🌐 APIs & Integrações (mantido)
├── (11 módulos)

🔍 Auditorias (mantido)
├── (29 módulos)

🎓 Treinamentos (mantido)
├── (4 módulos)

💰 Finanças & Procurement (mantido)
├── (9 módulos)

🌱 ESG & Sustentabilidade (mantido)
├── (3 módulos)

✈️ Viagens & Logística (mantido)
├── (2 módulos)

⚙️ Sistema & Configurações (mantido)
├── (14 módulos)
```

---

## 📊 COMPARATIVO

| Métrica | Antes | Depois | Mudança |
|---------|-------|--------|---------|
| **Grupos no Sidebar** | 16 | 16 | 0% |
| **Total de Items** | 134+ | ~90 | -33% |
| **Módulos Duplicados** | 15+ | 0 | -100% |
| **Itens por Grupo (média)** | 8.4 | 5.6 | -33% |

---

## 🎨 VISUAL DO NOVO SIDEBAR

```typescript
// src/config/sidebar-routes-new.ts

export const SIDEBAR_ROUTES_NEW: SidebarGroup[] = [
  // === COMANDO CENTRAL ===
  {
    title: "🧠 Central de Comando",
    defaultOpen: true,
    items: [/* mantido */]
  },
  
  // === OPERAÇÕES (HUBS UNIFICADOS) ===
  {
    title: "🚀 Operações",
    defaultOpen: true,
    items: [
      { label: "Operations Command", path: "/operations-command", icon: Ship, badge: "HUB" },
      { label: "Cargo & Port", path: "/cargo-port-operations", icon: Package, badge: "HUB" },
      { label: "Vessel Contracts", path: "/vessel-contracts-hub", icon: FileText, badge: "HUB" },
      { label: "Crew Operations", path: "/crew-operations", icon: Users, badge: "HUB" },
    ]
  },
  
  // === MANUTENÇÃO ===
  {
    title: "🔧 Manutenção",
    defaultOpen: false,
    items: [/* mantido */]
  },
  
  // === INTELIGÊNCIA ARTIFICIAL ===
  {
    title: "🤖 Inteligência Artificial",
    defaultOpen: false,
    items: [
      { label: "AI Control Tower", path: "/ai-control-tower", icon: Brain, badge: "HUB" },
      { label: "Voice & Assistant", path: "/voice-assistant-hub", icon: Mic, badge: "HUB" },
      // AI Enterprise Engines...
    ]
  },
  
  // === MONITORAMENTO ===
  {
    title: "📊 Monitoramento",
    defaultOpen: false,
    items: [
      { label: "Tracking & Telemetry", path: "/tracking-telemetry", icon: Satellite, badge: "HUB" },
      // APIs & Integrações...
    ]
  },
  
  // === DOCUMENTOS & COMUNICAÇÃO ===
  {
    title: "📁 Docs & Comms",
    defaultOpen: false,
    items: [
      { label: "Document Center", path: "/document-center", icon: FileText, badge: "HUB" },
      { label: "Comms & Alerts", path: "/comms-alerts", icon: Bell, badge: "HUB" },
    ]
  },
  
  // === PESSOAS ===
  {
    title: "👥 Pessoas",
    defaultOpen: false,
    items: [
      { label: "People Hub", path: "/people-hub", icon: Users, badge: "HUB" },
      // Treinamentos...
    ]
  },
  
  // === OUTROS (mantidos) ===
  // Auditorias, Finanças, ESG, Viagens, Sistema...
];
```

---

## 🔄 MIGRAÇÃO GRADUAL

### Semana 1: Feature Flag
```typescript
// Sidebar mostra AMBOS: antigo + novo hub
const showNewHubs = useFeatureFlag('new-sidebar-hubs');

// Usuário pode alternar
<Button onClick={() => setShowNewHubs(!showNewHubs)}>
  {showNewHubs ? '🔙 Voltar ao Antigo' : '🚀 Experimentar Novo'}
</Button>
```

### Semana 2: Rollout 25%
### Semana 3: Rollout 50%
### Semana 4: Rollout 100% + Deprecar Antigo

---

*Documento gerado em Janeiro 2026*
