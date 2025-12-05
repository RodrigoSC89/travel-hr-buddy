# 📊 Sistema de Relatórios Inteligentes com IA

## Visão Geral

O sistema de relatórios inteligentes utiliza a LLM embarcada para gerar análises, insights e relatórios automatizados baseados nos dados operacionais.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Reports System                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Data       │───▶│    AI       │───▶│   Report    │     │
│  │  Sources    │    │   Engine    │    │  Generator  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│        │                   │                   │            │
│        ▼                   ▼                   ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ - Fleet     │    │ - Analysis  │    │ - PDF       │     │
│  │ - Maint.    │    │ - Insights  │    │ - Excel     │     │
│  │ - Crew      │    │ - Trends    │    │ - UI        │     │
│  │ - Finance   │    │ - Anomalies │    │ - Email     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Tipos de Relatórios

### 1. Relatório Semanal Automático

```typescript
interface WeeklyReport {
  period: { start: Date; end: Date };
  summary: {
    totalVessels: number;
    activeVessels: number;
    maintenanceOrders: number;
    completedMaintenance: number;
    incidents: number;
    complianceScore: number;
  };
  highlights: string[];
  alerts: Alert[];
  aiInsights: string[];
  recommendations: string[];
}
```

**Exemplo de Prompt para Geração:**
```
Analise os dados da semana de [data_inicio] a [data_fim]:

FROTA:
- Total de embarcações: 45
- Ativas: 42 (93.3%)
- Em manutenção: 3

MANUTENÇÃO:
- Ordens abertas: 28
- Concluídas: 45
- Taxa de conclusão: 61.6%
- Tempo médio de reparo: 4.2 dias

TRIPULAÇÃO:
- Total embarcados: 320
- Certificações vencendo (30 dias): 12
- Horas extras registradas: 156h

Gere um resumo executivo destacando:
1. Principais conquistas
2. Pontos de atenção
3. Recomendações prioritárias
```

**Resposta Esperada da IA:**
```markdown
## Resumo Executivo - Semana 48/2024

### Destaques Positivos
- 93.3% da frota operacional, acima da meta de 90%
- 45 manutenções concluídas, melhor semana do trimestre
- Zero incidentes de segurança reportados

### Pontos de Atenção
⚠️ **Taxa de manutenção abaixo do ideal** - 61.6% de conclusão indica 
   backlog crescente. Considerar priorização ou recursos adicionais.

⚠️ **Certificações próximas do vencimento** - 12 tripulantes com 
   certificações vencendo em 30 dias. Iniciar renovação imediatamente.

### Recomendações
1. Revisar backlog de manutenção e identificar ordens críticas
2. Agendar treinamentos para renovação de certificados
3. Investigar aumento de horas extras (156h vs média de 120h)
```

---

### 2. Relatório de Tendências

**Prompts Sugeridos pelo Usuário:**

| Pergunta | Análise Gerada |
|----------|----------------|
| "Mostre tendência de custos de manutenção dos últimos 6 meses" | Gráfico + análise de variação |
| "Compare performance das embarcações no trimestre" | Ranking + insights |
| "Qual a previsão de manutenções para o próximo mês?" | Projeção baseada em histórico |
| "Quais embarcações têm mais ocorrências?" | Análise de Pareto |

**Implementação:**
```typescript
// src/lib/ai/reports/trend-analyzer.ts
export async function analyzeTrend(
  metric: string,
  period: 'week' | 'month' | 'quarter' | 'year',
  data: DataPoint[]
): Promise<TrendAnalysis> {
  const prompt = `
    Analise a tendência de ${metric} no período de ${period}:
    
    Dados:
    ${JSON.stringify(data, null, 2)}
    
    Forneça:
    1. Tendência geral (crescente/decrescente/estável)
    2. Variação percentual
    3. Anomalias identificadas
    4. Projeção para próximo período
    5. Ações recomendadas
    
    Formato: JSON estruturado
  `;
  
  const response = await aiEngine.complete(prompt);
  return parseTrendAnalysis(response);
}
```

---

### 3. Alertas e Anomalias

**Sistema de Detecção Automática:**

```typescript
// src/lib/ai/reports/anomaly-detector.ts
export const anomalyRules = {
  maintenance: {
    highBacklog: (orders) => orders.pending > orders.avgMonthly * 1.5,
    repeatedFailures: (vessel) => vessel.sameIssueCount > 3,
    delayedOrders: (orders) => orders.overdue > orders.total * 0.2
  },
  
  fleet: {
    lowUtilization: (vessel) => vessel.utilization < 0.7,
    highFuelConsumption: (vessel) => vessel.fuelPerNm > vessel.benchmark * 1.2,
    excessiveIdleTime: (vessel) => vessel.idleHours > 72
  },
  
  crew: {
    expiringCerts: (crew) => crew.certExpiringDays < 30,
    overworked: (crew) => crew.weeklyHours > 60,
    complianceGap: (crew) => !crew.hasRequiredTraining
  }
};

export async function detectAnomalies(data: OperationalData): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  
  for (const [category, rules] of Object.entries(anomalyRules)) {
    for (const [ruleName, check] of Object.entries(rules)) {
      const items = data[category];
      for (const item of items) {
        if (check(item)) {
          anomalies.push({
            category,
            rule: ruleName,
            item: item.id,
            severity: getSeverity(ruleName),
            message: await generateAnomalyMessage(category, ruleName, item)
          });
        }
      }
    }
  }
  
  return anomalies;
}
```

---

## Exemplos de Prompts para Usuários

### Frota
```
"Me mostre os navios com mais manutenção nos últimos 30 dias"
"Qual embarcação tem o maior consumo de combustível?"
"Compare a eficiência da frota este mês vs mês passado"
"Quais navios estão abaixo da performance esperada?"
```

### Manutenção
```
"Liste as ordens de serviço mais antigas ainda abertas"
"Quais equipamentos falham com mais frequência?"
"Mostre o tempo médio de reparo por tipo de manutenção"
"Preveja as manutenções necessárias para próxima semana"
```

### Tripulação
```
"Quais certificados vencem nos próximos 60 dias?"
"Mostre tripulantes com mais horas extras este mês"
"Verifique conformidade MLC da tripulação do navio X"
"Sugira escala de trabalho otimizada para próxima viagem"
```

### Financeiro
```
"Qual o custo total de manutenção por embarcação este ano?"
"Compare gastos com combustível vs orçamento"
"Mostre tendência de custos operacionais"
"Identifique oportunidades de redução de custos"
```

---

## Formatos de Saída

### 1. PDF Profissional

```typescript
// src/lib/reports/pdf-generator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generatePDFReport(
  report: AIReport
): Promise<Blob> {
  const doc = new jsPDF();
  
  // Header com logo
  doc.addImage(logo, 'PNG', 10, 10, 40, 15);
  doc.setFontSize(20);
  doc.text(report.title, 60, 20);
  
  // Resumo executivo
  doc.setFontSize(14);
  doc.text('Resumo Executivo', 10, 40);
  doc.setFontSize(10);
  doc.text(report.summary, 10, 50, { maxWidth: 190 });
  
  // KPIs em cards
  const kpis = report.kpis.map(k => [k.name, k.value, k.trend]);
  doc.autoTable({
    head: [['Indicador', 'Valor', 'Tendência']],
    body: kpis,
    startY: 80
  });
  
  // Insights da IA
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Insights Gerados por IA', 10, 20);
  
  let y = 30;
  for (const insight of report.aiInsights) {
    doc.setFontSize(10);
    doc.text(`• ${insight}`, 10, y, { maxWidth: 190 });
    y += 10;
  }
  
  // Recomendações
  doc.setFontSize(14);
  doc.text('Recomendações', 10, y + 10);
  
  y += 20;
  for (const rec of report.recommendations) {
    doc.text(`${rec.priority}. ${rec.text}`, 10, y, { maxWidth: 190 });
    y += 10;
  }
  
  return doc.output('blob');
}
```

### 2. Interface Visual

```typescript
// src/components/reports/AIReportDashboard.tsx
export function AIReportDashboard({ report }: { report: AIReport }) {
  return (
    <div className="space-y-6">
      {/* Header com período */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <Badge variant="outline">
          {format(report.period.start, 'dd/MM')} - {format(report.period.end, 'dd/MM/yyyy')}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {report.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <TrendIndicator value={kpi.trend} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.aiInsights.map((insight, i) => (
              <li key={i} className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.recommendations.map((rec, i) => (
              <div 
                key={i}
                className={cn(
                  "p-4 rounded-lg border",
                  rec.priority === 'high' && "border-red-500 bg-red-50",
                  rec.priority === 'medium' && "border-yellow-500 bg-yellow-50",
                  rec.priority === 'low' && "border-green-500 bg-green-50"
                )}
              >
                <div className="font-medium">{rec.title}</div>
                <div className="text-sm text-muted-foreground">{rec.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Email Automático

```typescript
// src/lib/reports/email-sender.ts
export async function sendScheduledReport(
  report: AIReport,
  recipients: string[]
): Promise<void> {
  const pdfBlob = await generatePDFReport(report);
  
  const emailContent = `
    <h1>${report.title}</h1>
    
    <h2>Resumo</h2>
    <p>${report.summary}</p>
    
    <h2>Principais Indicadores</h2>
    <table>
      ${report.kpis.map(kpi => `
        <tr>
          <td>${kpi.name}</td>
          <td><strong>${kpi.value}</strong></td>
          <td>${kpi.trend > 0 ? '↑' : kpi.trend < 0 ? '↓' : '→'} ${Math.abs(kpi.trend)}%</td>
        </tr>
      `).join('')}
    </table>
    
    <h2>Alertas</h2>
    <ul>
      ${report.alerts.map(a => `<li style="color: ${a.severity === 'high' ? 'red' : 'orange'}">${a.message}</li>`).join('')}
    </ul>
    
    <p><em>Relatório completo em anexo.</em></p>
  `;
  
  await supabase.functions.invoke('send-email', {
    body: {
      to: recipients,
      subject: `[Nautilus] ${report.title} - ${format(new Date(), 'dd/MM/yyyy')}`,
      html: emailContent,
      attachments: [{
        filename: `relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        content: await blobToBase64(pdfBlob)
      }]
    }
  });
}
```

---

## Agendamento de Relatórios

```typescript
// src/lib/reports/scheduler.ts
export const reportSchedules = {
  weekly: {
    cron: '0 8 * * MON', // Segundas às 8h
    reports: ['fleet-summary', 'maintenance-backlog', 'crew-compliance']
  },
  monthly: {
    cron: '0 8 1 * *', // Dia 1 às 8h
    reports: ['executive-summary', 'cost-analysis', 'kpi-dashboard']
  },
  daily: {
    cron: '0 7 * * *', // Diariamente às 7h
    reports: ['alerts-digest', 'pending-actions']
  }
};

export async function processScheduledReports() {
  const now = new Date();
  
  for (const [schedule, config] of Object.entries(reportSchedules)) {
    if (shouldRun(config.cron, now)) {
      for (const reportType of config.reports) {
        const report = await generateReport(reportType);
        const recipients = await getReportRecipients(reportType);
        await sendScheduledReport(report, recipients);
      }
    }
  }
}
```

---

## Métricas de Qualidade dos Relatórios

| Métrica | Alvo | Medição |
|---------|------|---------|
| Tempo de geração | <30s | Performance |
| Relevância dos insights | >4/5 | Feedback usuário |
| Precisão dos dados | 100% | Validação automática |
| Taxa de abertura (email) | >60% | Analytics |
| Ações tomadas | >30% | Tracking |

---

*Sistema de relatórios com IA - Documentação gerada em: 2025-12-05*
