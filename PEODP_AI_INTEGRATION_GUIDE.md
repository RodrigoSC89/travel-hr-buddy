# PEO-DP Inteligente - Guia de Uso e Integração

## 📋 Visão Geral

Este documento descreve como usar o sistema **PEO-DP Inteligente** (NORMAM-101 + IMCA M 117) e seus pontos de integração com outros módulos do Travel HR Buddy.

## 🚀 Acesso ao Sistema

### Via Interface Web

1. **Login no sistema**: Acesse o Travel HR Buddy com suas credenciais
2. **Navegue para o módulo PEO-DP**: `/admin/peodp-audit`
3. **Preencha os dados da embarcação**:
   - Nome da embarcação (obrigatório)
   - Classe DP (DP1, DP2 ou DP3)
4. **Clique em "Iniciar Auditoria PEO-DP"**
5. **Visualize os resultados** na aba "Resultados"
6. **Baixe os relatórios** em PDF ou Markdown

### Via API Programática

```typescript
import { peodpCore } from "@/modules/peodp_ai";

// Executar auditoria completa
const auditoria = await peodpCore.iniciarAuditoria({
  vesselName: "PSV Ocean Explorer",
  dpClass: "DP2",
  autoDownload: true,
  format: "pdf"
});

console.log(`Score: ${auditoria.score}%`);
console.log(`Itens verificados: ${auditoria.resultado.length}`);
```

## 🔗 Pontos de Integração

### 1. Integração com IMCA Audit System

O PEO-DP AI pode ser usado em conjunto com o sistema IMCA existente:

```typescript
import { generateIMCAAudit } from "@/services/imca-audit-service";
import { peodpCore } from "@/modules/peodp_ai";

// 1. Gerar auditoria IMCA completa
const imcaAudit = await generateIMCAAudit({
  vesselName: "FPSO Cidade de São Paulo",
  dpClass: "DP3",
  location: "Bacia de Campos",
  auditObjective: "Auditoria anual de conformidade DP"
});

// 2. Executar auditoria PEO-DP focada em NORMAM-101
const peodpAudit = await peodpCore.iniciarAuditoria({
  vesselName: "FPSO Cidade de São Paulo",
  dpClass: "DP3"
});

// 3. Combinar resultados para relatório completo
const relatorioCompleto = {
  imca: imcaAudit,
  peodp: peodpAudit,
  timestamp: new Date().toISOString()
};
```

### 2. Integração com DP Intelligence Center

O módulo pode consumir dados do DP Intelligence para verificações em tempo real:

```typescript
import { peodpCore } from "@/modules/peodp_ai";
// Assumindo que existe um serviço DP Intelligence
import { getDPLogs, getDPStatus } from "@/services/dp-intelligence";

async function auditoriaComDadosReais(vesselId: string) {
  // 1. Buscar dados DP em tempo real
  const dpLogs = await getDPLogs(vesselId);
  const dpStatus = await getDPStatus(vesselId);
  
  // 2. Executar auditoria PEO-DP
  const auditoria = await peodpCore.iniciarAuditoria({
    vesselName: dpStatus.vesselName,
    dpClass: dpStatus.dpClass
  });
  
  // 3. Cruzar com logs DP para validação
  // (Implementação futura: engine pode consumir dpLogs diretamente)
  
  return auditoria;
}
```

### 3. Integração com SGSO (Sistema de Gestão de Segurança Operacional)

Alimentar o SGSO com não conformidades identificadas:

```typescript
import { peodpCore, PEOEngine } from "@/modules/peodp_ai";
import { supabase } from "@/integrations/supabase/client";

async function enviarNaoConformidadesParaSGSO(vesselName: string) {
  // 1. Executar auditoria
  const auditoria = await peodpCore.iniciarAuditoria({ vesselName });
  
  // 2. Filtrar não conformidades
  const naoConformes = auditoria.resultado.filter(
    r => r.cumprimento === "Não Conforme"
  );
  
  // 3. Inserir no SGSO
  for (const item of naoConformes) {
    await supabase.from("sgso_nonconformities").insert({
      vessel_name: vesselName,
      standard: item.item,
      description: item.descricao,
      severity: "high",
      status: "open",
      audit_date: auditoria.data,
      source: "PEO-DP Intelligent Audit"
    });
  }
  
  return naoConformes.length;
}
```

### 4. Integração com Sistema de Notificações

Enviar alertas automáticos quando o score for crítico:

```typescript
import { peodpCore, PEOEngine } from "@/modules/peodp_ai";
import { supabase } from "@/integrations/supabase/client";

async function auditoriaComAlertas(vesselName: string, dpClass: string) {
  const auditoria = await peodpCore.iniciarAuditoria({ vesselName, dpClass });
  
  // Se score crítico, enviar alerta
  if (auditoria.score < 60) {
    await supabase.from("notifications").insert({
      type: "critical_audit",
      title: `⚠️ Auditoria PEO-DP Crítica - ${vesselName}`,
      message: `Score: ${auditoria.score}% - Ação imediata necessária`,
      severity: "critical",
      data: { auditoria }
    });
  }
  
  return auditoria;
}
```

### 5. Integração com Sistema de Reports Automatizados

Gerar e enviar relatórios por email:

```typescript
import { peodpCore } from "@/modules/peodp_ai";
import { supabase } from "@/integrations/supabase/client";

async function auditoriaComEmailReport(
  vesselName: string,
  recipientEmail: string
) {
  const auditoria = await peodpCore.iniciarAuditoria({ vesselName });
  const engine = new PEOEngine();
  const recomendacoes = engine.gerarRecomendacoes(auditoria);
  
  // Gerar markdown do relatório
  const markdown = peodpCore.gerarMarkdown(auditoria, recomendacoes);
  
  // Enviar por email usando Supabase Edge Function
  await supabase.functions.invoke("send-email", {
    body: {
      to: recipientEmail,
      subject: `Relatório PEO-DP - ${vesselName}`,
      markdown: markdown,
      attachPDF: true
    }
  });
}
```

## 📊 Casos de Uso Práticos

### Caso 1: Auditoria Pré-Operacional

```typescript
import { peodpCore } from "@/modules/peodp_ai";

async function auditoriaPreOperacional(vesselId: string) {
  console.log("🔍 Iniciando auditoria pré-operacional...");
  
  const auditoria = await peodpCore.iniciarAuditoria({
    vesselName: "PSV Ocean Explorer",
    dpClass: "DP2"
  });
  
  console.log(`✅ Auditoria concluída - Score: ${auditoria.score}%`);
  
  // Decisão: liberar operação apenas se score >= 75%
  if (auditoria.score >= 75) {
    console.log("✅ Embarcação aprovada para operação DP");
    return { approved: true, auditoria };
  } else {
    console.log("❌ Embarcação NÃO aprovada - ações corretivas necessárias");
    return { approved: false, auditoria };
  }
}
```

### Caso 2: Auditoria Periódica Automatizada

```typescript
import { peodpCore } from "@/modules/peodp_ai";
import { supabase } from "@/integrations/supabase/client";

async function auditoriaPeriodicaTodosNavios() {
  // Buscar todos os navios DP
  const { data: vessels } = await supabase
    .from("vessels")
    .select("*")
    .not("dp_class", "is", null);
  
  const resultados = [];
  
  for (const vessel of vessels || []) {
    const auditoria = await peodpCore.iniciarAuditoria({
      vesselName: vessel.name,
      dpClass: vessel.dp_class
    });
    
    // Salvar resultado no banco
    await supabase.from("peodp_audit_history").insert({
      vessel_id: vessel.id,
      audit_date: auditoria.data,
      score: auditoria.score,
      report_data: auditoria
    });
    
    resultados.push({
      vessel: vessel.name,
      score: auditoria.score
    });
  }
  
  return resultados;
}
```

### Caso 3: Dashboard de Conformidade em Tempo Real

```typescript
import { peodpCore, PEOEngine } from "@/modules/peodp_ai";

async function getDashboardData() {
  const auditoria = await peodpCore.iniciarAuditoria({
    vesselName: "FPSO Cidade de São Paulo",
    dpClass: "DP3"
  });
  
  const engine = new PEOEngine();
  const recomendacoes = engine.gerarRecomendacoes(auditoria);
  
  return {
    score: auditoria.score,
    totalItems: auditoria.resultado.length,
    okCount: auditoria.resultado.filter(r => r.cumprimento === "OK").length,
    nonCompliantCount: auditoria.resultado.filter(r => r.cumprimento === "Não Conforme").length,
    pendingCount: auditoria.resultado.filter(r => r.cumprimento === "Pendente").length,
    recommendations: recomendacoes,
    lastAudit: auditoria.data
  };
}
```

## 🎯 Regras de Negócio

### Score de Conformidade

- **90-100%**: 🌟 Excelente - Operação liberada sem restrições
- **75-89%**: ✅ Bom - Operação liberada com observações
- **60-74%**: ⚠️ Aceitável - Operação liberada com plano de ação
- **0-59%**: 🚨 Não Conforme - Operação NÃO liberada

### Criticidade dos Itens

Baseado em `peodp_rules.ts`:

- **Crítica**: Impede operação se não conforme
- **Alta**: Requer plano de ação imediato
- **Média**: Requer plano de ação em 30 dias
- **Baixa**: Requer plano de ação em 90 dias

## 📈 Monitoramento e KPIs

### Métricas Recomendadas

```typescript
interface PEODPMetrics {
  totalAudits: number;
  averageScore: number;
  trendingUp: boolean;
  criticalItems: number;
  vesselsCompliant: number;
  vesselsNonCompliant: number;
}

async function calculateMetrics(period: string): Promise<PEODPMetrics> {
  // Implementação depende do banco de dados de histórico
  // Este é um exemplo de estrutura
  return {
    totalAudits: 45,
    averageScore: 87.5,
    trendingUp: true,
    criticalItems: 3,
    vesselsCompliant: 12,
    vesselsNonCompliant: 2
  };
}
```

## 🔐 Segurança e Compliance

### Rastreabilidade

Todas as auditorias devem ser registradas com:
- Data/hora de execução
- Usuário que executou
- Embarcação auditada
- Resultados completos
- Hash do relatório (para integridade)

```typescript
import { peodpCore } from "@/modules/peodp_ai";
import { supabase } from "@/integrations/supabase/client";

async function auditoriaComRastreabilidade(
  vesselName: string,
  userId: string
) {
  const auditoria = await peodpCore.iniciarAuditoria({ vesselName });
  
  // Salvar com rastreabilidade completa
  await supabase.from("audit_trail").insert({
    user_id: userId,
    action: "peodp_audit",
    vessel_name: vesselName,
    score: auditoria.score,
    timestamp: auditoria.data,
    details: auditoria
  });
  
  return auditoria;
}
```

## 🛠️ Desenvolvimento e Extensão

### Adicionar Nova Norma

Para adicionar suporte a uma nova norma (ex: ISO 9001):

1. Criar arquivo JSON em `peodp_profiles/iso_9001.json`
2. Adicionar regras em `peodp_rules.ts`
3. Atualizar `peodp_engine.ts` para incluir nova norma
4. Atualizar tipos em `peodp-audit.ts`

### Personalizar Validações

Editar `peodp_engine.ts`, método `verificar()`:

```typescript
private async verificar(descricao: string): Promise<"OK" | "N/A" | "Não Conforme" | "Pendente"> {
  // Aqui você pode:
  // 1. Consultar banco de dados
  // 2. Chamar APIs externas
  // 3. Verificar logs DP
  // 4. Cruzar com FMEA/ASOG
  // 5. Validar certificações
  
  // Exemplo: consultar se há certificação válida
  const { data } = await supabase
    .from("certifications")
    .select("*")
    .eq("vessel_name", this.vesselName)
    .eq("type", "DP")
    .gte("expiry_date", new Date().toISOString());
  
  return data && data.length > 0 ? "OK" : "Não Conforme";
}
```

## 📚 Recursos Adicionais

- [README do módulo](/src/modules/peodp_ai/README.md)
- [Documentação NORMAM-101](https://www.marinha.mil.br/dpc/normam)
- [Documentação IMCA M 117](https://www.imca-int.com/product/the-training-and-experience-of-key-dp-personnel-imca-m-117/)
- [Testes automatizados](/src/tests/modules/peodp-engine.test.ts)

## 💡 Dicas de Performance

1. **Cache de resultados**: Implementar cache de auditorias recentes
2. **Execução assíncrona**: Para múltiplos navios, usar `Promise.all()`
3. **Lazy loading**: Carregar normas JSON apenas quando necessário
4. **Batch processing**: Para auditorias em lote, processar em chunks

## 🆘 Suporte

Para questões ou problemas:
1. Verificar [issues no GitHub](https://github.com/RodrigoSC89/travel-hr-buddy/issues)
2. Consultar documentação inline no código
3. Executar testes: `npm run test src/tests/modules/peodp-engine.test.ts`

---

**Última atualização**: 2025-10-20
**Versão do módulo**: 1.0.0
