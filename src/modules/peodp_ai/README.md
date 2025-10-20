# PEO-DP AI Module

## 🎯 Propósito

O módulo **PEO-DP Inteligente** é um sistema avançado de auditoria de conformidade para operações de Dynamic Positioning (DP), baseado nas normas **NORMAM-101** (Diretoria de Portos e Costas) e **IMCA M 117** (The Training and Experience of Key DP Personnel).

Este sistema executa auditorias automatizadas, cruza dados de logs DP, FMEA, ASOG e tarefas MMI para gerar relatórios técnicos profissionais compatíveis com requisitos da Petrobras e outras operadoras.

## 📁 Estrutura de Módulo

```
modules/peodp_ai/
 ├── peodp_core.ts             # Núcleo de controle e interface principal
 ├── peodp_engine.ts           # Motor de auditoria e inferência
 ├── peodp_rules.ts            # Regras da NORMAM-101 e IMCA M 117
 ├── peodp_profiles/           # Perfis de embarcações e tipos de DP
 │     ├── normam_101.json
 │     └── imca_m117.json
 ├── peodp_report.ts           # Geração de relatório técnico automatizado
 └── index.ts                  # Exports do módulo
```

## 🔧 Funcionalidades Principais

### 1. **peodp_core.ts** - Orquestra a Auditoria de Conformidade DP

Classe principal que coordena todo o processo de auditoria:

```typescript
import { peodpCore } from "@/modules/peodp_ai";

const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "PSV Ocean Explorer",
  dpClass: "DP2",
  autoDownload: true,
  format: "pdf"
});
```

### 2. **peodp_engine.ts** - Motor de Inferência

Cruza logs DP, FMEA, ASOG e tarefas MMI para verificação de conformidade:

```typescript
const engine = new PEOEngine();
const resultado = await engine.executarAuditoria("PSV Ocean Explorer", "DP2");
const recomendacoes = engine.gerarRecomendacoes(resultado);
```

### 3. **peodp_report.ts** - Geração de Relatórios

Gera relatórios técnicos profissionais em PDF ou Markdown:

```typescript
const report = new PEOReport();
report.downloadRelatorio(auditoria, recomendacoes);
const markdown = report.gerarMarkdown(auditoria, recomendacoes);
```

### 4. **peodp_rules.ts** - Regras de Conformidade

Define todas as regras das normas NORMAM-101 e IMCA M 117:

```typescript
import { NORMAM_101_RULES, IMCA_M117_RULES, validateAllRules } from "@/modules/peodp_ai";

const { passed, failed, results } = await validateAllRules();
```

## 📊 Normas Implementadas

### NORMAM-101 (DPC)

- ✅ N101-01: Sistema DP classificado e certificado conforme IMO MSC/Circ.645
- ✅ N101-02: Registro de horas DP e eventos de falha disponíveis
- ✅ N101-03: Tripulação DP certificada e escalada conforme nível de operação
- ✅ N101-04: Plano de manutenção e ensaios DP em conformidade com IMCA M117
- ✅ N101-05: Relatórios ASOG e FMEA revisados e atualizados

### IMCA M 117

- ✅ M117-01: DPO (Dynamic Positioning Operator) com certificação válida
- ✅ M117-02: Treinamento específico para classe DP da embarcação
- ✅ M117-03: Experiência mínima documentada em operações DP
- ✅ M117-04: Programa de treinamento contínuo e reciclagem
- ✅ M117-05: Matriz de competências e avaliação periódica

## 🎨 Interface de Usuário

### Componente React

```typescript
import { PEODPAuditComponent } from "@/components/peodp-ai/peodp-audit-component";

// Use no seu componente ou página
<PEODPAuditComponent />
```

### Página de Auditoria

Acesse a página de auditoria em: `/admin/peodp-audit`

## 📈 Score de Conformidade

O sistema calcula um score de 0-100% baseado nos requisitos verificados:

- **90-100%**: 🌟 Excelente - Conformidade total
- **75-89%**: ✅ Bom - Conformidade aceitável com pequenos ajustes
- **60-74%**: ⚠️ Aceitável - Necessita melhorias
- **0-59%**: 🚨 Não Conforme - Ação imediata requerida

## 📝 Tipos TypeScript

```typescript
interface PEODPAuditoria {
  data: string;
  resultado: PEODPResultadoItem[];
  score: number;
  vesselName?: string;
  dpClass?: string;
  normas: string[];
}

interface PEODPResultadoItem {
  item: string;
  descricao: string;
  cumprimento: "OK" | "N/A" | "Não Conforme" | "Pendente";
  observacoes?: string;
}
```

## 🔗 Integração com Outros Módulos

### Integração com IMCA Audit System

O PEO-DP AI complementa o sistema IMCA existente, focando especificamente em:
- Conformidade com NORMAM-101 brasileira
- Treinamento e experiência de pessoal DP (IMCA M 117)
- Auditoria automatizada e inteligente

### Integração com DP Intelligence

Conecta-se ao DP Intelligence Center para:
- Análise de logs DP em tempo real
- Cruzamento com dados FMEA e ASOG
- Monitoramento contínuo de conformidade

### Integração com SGSO

Alimenta o sistema SGSO com:
- Relatórios de auditoria DP
- Não conformidades identificadas
- Planos de ação corretiva

## 🚀 Uso Programático

### Exemplo Completo

```typescript
import { peodpCore, PEOEngine, PEOReport } from "@/modules/peodp_ai";

async function executarAuditoriaDPCompleta() {
  // 1. Executar auditoria
  const auditoria = await peodpCore.iniciarAuditoria({
    vesselName: "FPSO Cidade de São Paulo",
    dpClass: "DP3",
  });

  // 2. Gerar recomendações
  const engine = new PEOEngine();
  const recomendacoes = engine.gerarRecomendacoes(auditoria);

  // 3. Baixar relatórios
  peodpCore.downloadReports(auditoria, recomendacoes, "both");

  // 4. Preview do PDF
  const preview = await peodpCore.gerarPreview(auditoria, recomendacoes);
  
  return { auditoria, recomendacoes, preview };
}
```

## 📦 Dependências

- `jspdf` - Geração de PDF
- `jspdf-autotable` - Tabelas no PDF
- Tipos TypeScript personalizados

## ⚡ Performance

- ✅ Auditoria executada em menos de 2 segundos
- ✅ Geração de relatório PDF otimizada
- ✅ Lazy loading de módulos pesados
- ✅ Cache de regras de conformidade

## 🔐 Segurança

- ✅ Validação de entrada de dados
- ✅ Logging de todas as operações
- ✅ Tratamento de erros robusto
- ✅ Dados sensíveis não expostos

## 🚀 Phase 2: Real-time Monitoring (NEW)

### Real-time Event Monitoring

The new `peodp_realtime.ts` module provides continuous monitoring of DP system events:

```typescript
import { peodpCore } from "@/modules/peodp_ai";

// Start real-time monitoring
const sessionId = peodpCore.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer");

// Execute monitoring cycles manually
const evento = peodpCore.executar_ciclo();

// Or start continuous loop
peodpCore.iniciar_loop_continuo(3); // Check every 3 seconds

// Stop and generate report
const report = peodpCore.parar_monitoramento();
```

#### Monitored Events

The system monitors 7 types of DP events:

- **Loss of DP Reference** (Critical)
- **Thruster Fault** (High)
- **UPS Alarm** (High)
- **Manual Override** (Medium)
- **Position Drift** (Medium)
- **Power Failure** (Critical)
- **System Normal** (Info)

### Smart Workflow Integration

The `peodp_workflow.ts` module automatically triggers corrective actions:

```typescript
import { PEOWorkflow } from "@/modules/peodp_ai";

const workflow = new PEOWorkflow();

// Get predefined action for event type
const action = workflow.obter_acao("Thruster Fault");

// Trigger action for an event
const result = workflow.acionar_acao(evento);
```

#### Automatic Actions by Event Type

- **Loss of DP Reference** → Verify sensors, activate GPS/DGNSS backup
- **Thruster Fault** → Engage machinery team, run MMI self-test
- **UPS Alarm** → Check power bus and battery integrity
- **Manual Override** → Confirm DPO intention and log justification
- **Position Drift** → Verify sensor integrity, check environmental conditions
- **Power Failure** → Activate emergency system, verify UPS

### Session Reports

Generate comprehensive reports with statistics:

```typescript
// Session monitoring report
const sessionReport = peodpCore.gerar_relatorio_sessao();

// Comparison between sessions
const comparison = peodpCore.gerar_relatorio_comparacao();

// Executive summary
const summary = peodpCore.gerar_sumario_executivo();
```

### Complete Demo

Run the complete Phase 2 demonstration:

```typescript
peodpCore.executar_demo();
```

This will:
1. Execute a compliance audit
2. Start real-time monitoring for 30 seconds
3. Generate session report with statistics
4. Create executive summary with recommendations

## 🎯 Phase 3 Roadmap

- [ ] Integração com banco de dados para logs DP reais
- [ ] BridgeLink API integration for SGSO Petrobras
- [ ] Forecast IA Global for predictive risk analysis
- [ ] Real-time visual dashboard for multi-vessel monitoring
- [ ] Offline mode with automatic synchronization
- [ ] Alertas automáticos de não conformidade
- [ ] Machine Learning para predição de não conformidades
- [ ] Suporte a mais normas (IMO, DNV, etc.)

## 📖 Documentação Adicional

- [NORMAM-101/DPC](https://www.marinha.mil.br/dpc/normam)
- [IMCA M 117](https://www.imca-int.com/product/the-training-and-experience-of-key-dp-personnel-imca-m-117/)
- [IMO MSC/Circ.645](https://www.imo.org/)

## 🤝 Contribuindo

Para adicionar novas regras ou normas:

1. Adicione a regra em `peodp_rules.ts`
2. Atualize o JSON correspondente em `peodp_profiles/`
3. Implemente a lógica de validação em `peodp_engine.ts`
4. Teste a auditoria completa

## 📄 Licença

Este módulo faz parte do Travel HR Buddy e segue a mesma licença do projeto principal.
