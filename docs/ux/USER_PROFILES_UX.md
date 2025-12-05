# 👥 Perfis de Usuário e Análise UX

## Perfis Identificados

### 1. 🔧 Técnico Embarcado

**Contexto de Uso:**
- Local: A bordo da embarcação
- Dispositivo: Tablet robusto ou smartphone
- Conectividade: Frequentemente offline ou 2G/satelital
- Ambiente: Ruidoso, vibração, baixa luz
- Tempo disponível: Limitado, entre tarefas operacionais

**Tarefas Principais:**
```
□ Registrar ordens de serviço
□ Consultar manuais técnicos
□ Fotografar e documentar reparos
□ Verificar estoque de peças
□ Consultar histórico de manutenção
□ Registrar horas trabalhadas
```

**Dificuldades Identificadas:**
| Problema | Impacto | Solução UX |
|----------|---------|------------|
| Teclado pequeno em tablet | Alto | Inputs maiores, voz para texto |
| Tela difícil de ver no sol | Alto | Alto contraste, modo claro adaptativo |
| Conexão instável | Crítico | Queue offline, feedback visual claro |
| Muitos passos para registrar OS | Médio | Wizard simplificado, templates |
| Fotos não sincronizam | Alto | Compressão automática, retry |

**Melhorias UX Propostas:**
```tsx
// 1. Botões maiores para uso com luvas
<Button 
  size="xl" 
  className="min-h-[56px] min-w-[56px] touch-manipulation"
>
  <WrenchIcon className="h-6 w-6" />
  Nova OS
</Button>

// 2. Quick actions flutuante
<FloatingActionButton
  actions={[
    { icon: Camera, label: 'Foto', action: 'capture' },
    { icon: Mic, label: 'Nota de voz', action: 'record' },
    { icon: Plus, label: 'Nova OS', action: 'create' }
  ]}
/>

// 3. Input por voz
<VoiceInput
  onTranscript={(text) => setDescription(text)}
  placeholder="Toque para falar..."
/>
```

---

### 2. 📊 Gestor Logístico

**Contexto de Uso:**
- Local: Escritório portuário ou home office
- Dispositivo: Desktop/Laptop
- Conectividade: Boa (fibra/4G)
- Ambiente: Escritório tradicional
- Tempo disponível: Dedicado, mas com múltiplas demandas

**Tarefas Principais:**
```
□ Visualizar dashboard de frota
□ Planejar manutenções
□ Aprovar requisições
□ Gerar relatórios
□ Coordenar embarques/desembarques
□ Monitorar KPIs
```

**Dificuldades Identificadas:**
| Problema | Impacto | Solução UX |
|----------|---------|------------|
| Muitas abas/módulos abertos | Médio | Dashboard consolidado |
| Informações fragmentadas | Alto | Vista unificada de embarcação |
| Dificuldade em priorizar | Alto | Alertas inteligentes, AI insights |
| Relatórios manuais demorados | Médio | Geração automática por IA |
| Comparar dados de múltiplas embarcações | Alto | Tabelas comparativas, filtros avançados |

**Melhorias UX Propostas:**
```tsx
// 1. Dashboard consolidado com KPIs
<DashboardGrid>
  <KPICard 
    title="Frota Ativa" 
    value={45} 
    trend="+2"
    sparkline={data}
  />
  <KPICard 
    title="Manutenções Pendentes" 
    value={12} 
    alert={true}
  />
  <AlertsList priority="high" limit={5} />
</DashboardGrid>

// 2. Filtros persistentes
<SmartFilters
  presets={['Minha frota', 'Críticos', 'Esta semana']}
  onSave={(filters) => saveUserPreset(filters)}
/>

// 3. Geração de relatório por IA
<AIReportGenerator
  prompt="Gere um relatório semanal de manutenção"
  format={['pdf', 'excel']}
/>
```

---

### 3. 👷 Tripulante

**Contexto de Uso:**
- Local: A bordo, em trânsito
- Dispositivo: Smartphone pessoal
- Conectividade: Muito limitada (satelital caro)
- Ambiente: Variado (cabine, convés, praça de máquinas)
- Tempo disponível: Horários de folga ou breves intervalos

**Tarefas Principais:**
```
□ Registrar ponto/horas
□ Consultar escala de trabalho
□ Ver certificados e vencimentos
□ Enviar mensagens para RH
□ Acessar treinamentos
□ Reportar incidentes
```

**Dificuldades Identificadas:**
| Problema | Impacto | Solução UX |
|----------|---------|------------|
| Dados móveis caros | Crítico | Modo ultra-economia |
| Tela pequena | Médio | Design mobile-first |
| Não técnico em tecnologia | Alto | Interface intuitiva, poucos cliques |
| Idiomas variados | Médio | i18n completo |
| Precisa funcionar rápido | Alto | Cache agressivo, instant load |

**Melhorias UX Propostas:**
```tsx
// 1. Home simplificada para tripulante
<CrewHome>
  <QuickAction icon={Clock} label="Registrar Ponto" />
  <QuickAction icon={Calendar} label="Minha Escala" />
  <QuickAction icon={FileText} label="Meus Documentos" />
  <QuickAction icon={AlertTriangle} label="Reportar" />
</CrewHome>

// 2. Modo economia extrema
<UltraLightMode
  enabled={connection === 'slow'}
  features={{
    noImages: true,
    textOnly: true,
    reducedAnimations: true,
    compressedSync: true
  }}
/>

// 3. Suporte multilíngue
<LanguageSelector
  languages={['pt-BR', 'en', 'es', 'fil', 'id']}
  autoDetect={true}
/>
```

---

### 4. 🏢 Gerente Administrativo

**Contexto de Uso:**
- Local: Sede da empresa
- Dispositivo: Desktop com múltiplos monitores
- Conectividade: Excelente
- Ambiente: Corporativo
- Tempo disponível: Agenda lotada, precisa de eficiência

**Tarefas Principais:**
```
□ Aprovar orçamentos
□ Revisar relatórios de compliance
□ Acompanhar custos operacionais
□ Tomar decisões estratégicas
□ Preparar para auditorias
□ Analisar performance geral
```

**Dificuldades Identificadas:**
| Problema | Impacto | Solução UX |
|----------|---------|------------|
| Excesso de informação | Alto | Executive summary, AI insights |
| Precisa de visão consolidada | Crítico | Dashboards estratégicos |
| Pouco tempo para detalhes | Alto | Drill-down sob demanda |
| Preparação de auditorias manual | Médio | Geração automática de evidências |
| Comparar períodos | Médio | Analytics temporais |

**Melhorias UX Propostas:**
```tsx
// 1. Executive Dashboard
<ExecutiveDashboard>
  <AIInsightCard
    title="Insights da Semana"
    insights={[
      "Custo de combustível 12% acima do previsto",
      "3 certificações vencem nos próximos 30 dias",
      "Navio XYZ com performance abaixo da média"
    ]}
  />
  <CostTrendChart period="12months" />
  <ComplianceScore score={94} trend="up" />
</ExecutiveDashboard>

// 2. Alertas prioritários
<PriorityAlerts
  filter="executive"
  maxItems={3}
  actions={['aprovar', 'delegar', 'agendar']}
/>

// 3. Drill-down contextual
<DataCard 
  title="Custos de Manutenção"
  value="R$ 2.4M"
  onClick={() => drillDown('maintenance-costs')}
  aiExplain={true}
/>
```

---

## Diretrizes Gerais de UX

### Para Ambientes de Baixa Luz
```css
/* Tema escuro otimizado */
:root[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 8%;
  
  /* Reduzir brilho de elementos brancos */
  --white-reduced: 210 40% 90%;
  
  /* Aumentar contraste de textos */
  --text-primary: 0 0% 100%;
  --text-secondary: 210 20% 80%;
}

/* Modo noturno (ainda mais escuro) */
:root[data-theme="night"] {
  --background: 0 0% 5%;
  --foreground: 0 0% 85%;
  /* Reduzir azuis que afetam visão noturna */
  --primary: 0 70% 50%; /* vermelho em vez de azul */
}
```

### Para Estresse Operacional
```tsx
// Confirmações claras e não-intrusivas
<Toast 
  variant="success"
  duration={3000}
  position="bottom-center"
>
  ✓ OS registrada com sucesso
</Toast>

// Ações reversíveis
<UndoableAction
  action={deleteItem}
  undoDuration={5000}
  message="Item excluído. Desfazer?"
/>

// Feedback tátil (mobile)
<HapticButton
  onClick={submitForm}
  hapticPattern="success"
>
  Confirmar
</HapticButton>
```

### Para Uso Não-Técnico
```tsx
// Linguagem simples
const labels = {
  // ❌ Técnico
  'Sincronizar dados com servidor remoto',
  // ✅ Simples
  'Atualizar informações'
};

// Ícones claros + texto
<NavItem>
  <HomeIcon /> Início
</NavItem>

// Ajuda contextual
<HelpTooltip>
  Clique aqui para adicionar um novo registro de manutenção
</HelpTooltip>

// Onboarding guiado
<GuidedTour
  steps={[
    { target: '#dashboard', content: 'Este é seu painel principal' },
    { target: '#new-os', content: 'Clique aqui para criar uma ordem de serviço' }
  ]}
/>
```

---

## Métricas de UX a Monitorar

| Métrica | Alvo | Ferramenta |
|---------|------|------------|
| Time to First Interaction | <3s | Web Vitals |
| Task Completion Rate | >90% | Analytics |
| Error Rate | <2% | Sentry |
| User Satisfaction (NPS) | >40 | Survey |
| Accessibility Score | >90 | Lighthouse |
| Mobile Usability | 100% | GSC |

---

*Documentação de UX gerada em: 2025-12-05*
