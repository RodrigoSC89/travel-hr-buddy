/**
 * IMCA Audit Service
 * Handles generation and management of IMCA technical audits for DP vessels
 */

import type {
  IMCAAuditReport,
  AuditGenerationRequest,
  AuditModule,
  NonConformity,
  RiskLevel
} from "@/types/imca-audit";
import { IMCA_STANDARDS } from "@/types/imca-audit";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate comprehensive audit prompt for AI
 */
export function generateAuditPrompt(request: AuditGenerationRequest): string {
  const standardsText = IMCA_STANDARDS.map(s => 
    `- **${s.code}** — ${s.title}\n  ↳ ${s.description}`
  ).join('\n\n');

  return `Você é um auditor técnico altamente qualificado em sistemas de posicionamento dinâmico (DP), com profunda familiaridade nas normas internacionais da IMCA, IMO e MTS.

Seu objetivo é gerar uma **auditoria técnica detalhada** para o seguinte contexto:

**DADOS DA EMBARCAÇÃO/OPERAÇÃO:**
- Nome: ${request.vesselName}
- Tipo de Operação: ${request.operationType}
- Localização: ${request.location}
- Classe DP: ${request.dpClass}
- Objetivo da Auditoria: ${request.objective}

${request.operationalData?.incidentDescription ? `
**DADOS OPERACIONAIS:**
${request.operationalData.incidentDescription}

${request.operationalData.weatherConditions ? `Condições Meteorológicas: ${request.operationalData.weatherConditions}` : ''}
${request.operationalData.crewInformation ? `Informações da Tripulação: ${request.operationalData.crewInformation}` : ''}
${request.operationalData.systemStatus ? `Status dos Sistemas: ${request.operationalData.systemStatus}` : ''}
${request.operationalData.sensorData ? `Dados de Sensores: ${request.operationalData.sensorData}` : ''}
${request.operationalData.logData ? `Dados de Logs: ${request.operationalData.logData}` : ''}
` : ''}

---

📚 **Normas e Diretrizes de Referência:**

${standardsText}

---

🧾 **Instruções para Geração do Relatório:**

1. **Contextualize** a auditoria com o nome do navio, tipo de operação (terra/navio), localização e objetivo.

2. **Liste os módulos auditados**, incluindo:
   - Sistema de Controle DP
   - Sistema de Propulsão
   - Sensores de Posicionamento (GNSS, gyro, etc.)
   - Rede e Comunicações
   - Pessoal DP (qualificação conforme IMCA M117)
   - Logs e Históricos (conforme IMCA M109)
   - FMEA (conforme IMCA M166)
   - Testes Anuais (conforme IMCA M190)
   - Documentação
   - Power Management System (PMS)
   - Capability Plots (conforme IMCA M140)
   - Planejamento Operacional (conforme IMCA M220)

3. Para cada módulo, **avalie a conformidade** com base nas normas acima.

4. Para cada não-conformidade encontrada:
   - Classifique o **nível de risco (Alto, Médio, Baixo)**
   - Indique **causas prováveis**
   - Sugira uma **ação corretiva** específica
   - Referencie as **normas IMCA/IMO/MTS aplicáveis**

5. Finalize com um **plano de ação priorizado**, destacando:
   - Itens críticos (risco alto)
   - Prazos recomendados
   - Requisitos de verificação futura

6. O texto deve ser técnico, claro, e formatado em JSON estruturado.

---

**FORMATO DE RESPOSTA ESPERADO (JSON):**

Retorne APENAS um objeto JSON válido com a seguinte estrutura:

{
  "modules": [
    {
      "name": "Nome do Módulo",
      "description": "Descrição do que foi auditado",
      "compliant": true/false,
      "findings": ["Observação 1", "Observação 2"],
      "nonConformities": [
        {
          "id": "NC-001",
          "module": "Nome do Módulo",
          "description": "Descrição da não-conformidade",
          "standardReference": ["IMCA M103", "IMO MSC.1/Circ.1580"],
          "riskLevel": "Alto|Médio|Baixo",
          "probableCauses": ["Causa 1", "Causa 2"],
          "correctiveActions": ["Ação corretiva 1", "Ação corretiva 2"],
          "deadline": "30 dias",
          "status": "Aberto"
        }
      ],
      "recommendations": ["Recomendação 1", "Recomendação 2"]
    }
  ],
  "overallCompliance": 85,
  "criticalIssues": 2,
  "totalNonConformities": 5,
  "actionPlan": {
    "criticalItems": [/* Array de NonConformity críticas */],
    "prioritizedActions": [
      {
        "priority": "Crítica|Alta|Média|Baixa",
        "action": "Descrição da ação",
        "deadline": "Prazo",
        "verification": "Como verificar"
      }
    ]
  }
}

Gere a auditoria completa agora.`;
}

/**
 * Generate IMCA audit using AI
 */
export async function generateIMCAAudit(
  request: AuditGenerationRequest
): Promise<IMCAAuditReport> {
  try {
    const prompt = generateAuditPrompt(request);
    
    // Call OpenAI via Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("imca-audit-generator", {
      body: { prompt, request }
    });

    if (error) {
      console.error("Error generating audit:", error);
      throw new Error(`Falha ao gerar auditoria: ${error.message}`);
    }

    if (!data?.audit) {
      throw new Error("Resposta inválida do servidor");
    }

    // Construct full audit report
    const auditReport: IMCAAuditReport = {
      id: `audit-${Date.now()}`,
      vesselName: request.vesselName,
      operationType: request.operationType,
      location: request.location,
      dpClass: request.dpClass,
      auditDate: new Date().toISOString().split('T')[0],
      auditor: "Sistema AI - IMCA Standards",
      objective: request.objective,
      status: "Concluído",
      operationalContext: request.operationalData ? {
        weatherConditions: request.operationalData.weatherConditions,
        operationDescription: request.operationalData.incidentDescription,
        crewStatus: request.operationalData.crewInformation,
        incidentDescription: request.operationalData.incidentDescription
      } : undefined,
      ...data.audit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: "AI"
    };

    return auditReport;
  } catch (error) {
    console.error("Error in generateIMCAAudit:", error);
    throw error;
  }
}

/**
 * Format audit report as Markdown
 */
export function formatAuditAsMarkdown(audit: IMCAAuditReport): string {
  let markdown = `# 🚢 Auditoria Técnica IMCA\n\n`;
  
  // Header
  markdown += `## 📋 Informações da Auditoria\n\n`;
  markdown += `- **Embarcação/Operação:** ${audit.vesselName}\n`;
  markdown += `- **Tipo:** ${audit.operationType}\n`;
  markdown += `- **Localização:** ${audit.location}\n`;
  markdown += `- **Classe DP:** ${audit.dpClass}\n`;
  markdown += `- **Data da Auditoria:** ${audit.auditDate}\n`;
  markdown += `- **Auditor:** ${audit.auditor}\n`;
  markdown += `- **Objetivo:** ${audit.objective}\n`;
  markdown += `- **Status:** ${audit.status}\n\n`;

  // Operational Context
  if (audit.operationalContext) {
    markdown += `## 🌊 Contexto Operacional\n\n`;
    if (audit.operationalContext.operationDescription) {
      markdown += `**Descrição da Operação:**\n${audit.operationalContext.operationDescription}\n\n`;
    }
    if (audit.operationalContext.weatherConditions) {
      markdown += `**Condições Meteorológicas:** ${audit.operationalContext.weatherConditions}\n\n`;
    }
    if (audit.operationalContext.crewStatus) {
      markdown += `**Status da Tripulação:** ${audit.operationalContext.crewStatus}\n\n`;
    }
  }

  // Overall Summary
  markdown += `## 📊 Resumo Executivo\n\n`;
  markdown += `- **Conformidade Geral:** ${audit.overallCompliance}%\n`;
  markdown += `- **Questões Críticas:** ${audit.criticalIssues}\n`;
  markdown += `- **Total de Não-Conformidades:** ${audit.totalNonConformities}\n\n`;

  // Standards Reference
  markdown += `## 📚 Normas de Referência\n\n`;
  IMCA_STANDARDS.forEach(standard => {
    markdown += `### ${standard.code}\n`;
    markdown += `**${standard.title}**\n`;
    markdown += `${standard.description}\n\n`;
  });

  // Modules Audit
  markdown += `## 🔍 Módulos Auditados\n\n`;
  audit.modules.forEach((module, index) => {
    markdown += `### ${index + 1}. ${module.name}\n\n`;
    markdown += `**Descrição:** ${module.description}\n\n`;
    markdown += `**Conformidade:** ${module.compliant ? '✅ Conforme' : '❌ Não Conforme'}\n\n`;
    
    if (module.findings.length > 0) {
      markdown += `**Observações:**\n`;
      module.findings.forEach(finding => {
        markdown += `- ${finding}\n`;
      });
      markdown += `\n`;
    }

    if (module.nonConformities.length > 0) {
      markdown += `**Não-Conformidades:**\n\n`;
      module.nonConformities.forEach(nc => {
        const riskEmoji = nc.riskLevel === "Alto" ? "🔴" : nc.riskLevel === "Médio" ? "🟡" : "🟢";
        markdown += `#### ${riskEmoji} ${nc.id}: ${nc.description}\n\n`;
        markdown += `- **Nível de Risco:** ${nc.riskLevel}\n`;
        markdown += `- **Normas Aplicáveis:** ${nc.standardReference.join(', ')}\n`;
        markdown += `- **Prazo:** ${nc.deadline || 'A definir'}\n\n`;
        
        markdown += `**Causas Prováveis:**\n`;
        nc.probableCauses.forEach(cause => {
          markdown += `- ${cause}\n`;
        });
        markdown += `\n`;
        
        markdown += `**Ações Corretivas:**\n`;
        nc.correctiveActions.forEach(action => {
          markdown += `- ${action}\n`;
        });
        markdown += `\n`;
      });
    }

    if (module.recommendations.length > 0) {
      markdown += `**Recomendações:**\n`;
      module.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += `\n`;
    }
  });

  // Action Plan
  markdown += `## 📋 Plano de Ação Priorizado\n\n`;
  
  if (audit.actionPlan.criticalItems.length > 0) {
    markdown += `### ⚠️ Itens Críticos (Atenção Imediata)\n\n`;
    audit.actionPlan.criticalItems.forEach((item, index) => {
      markdown += `${index + 1}. **${item.description}**\n`;
      markdown += `   - Módulo: ${item.module}\n`;
      markdown += `   - Prazo: ${item.deadline || 'Imediato'}\n`;
      markdown += `   - Ações: ${item.correctiveActions.join('; ')}\n\n`;
    });
  }

  markdown += `### 📅 Cronograma de Ações\n\n`;
  audit.actionPlan.prioritizedActions.forEach((action, index) => {
    const priorityEmoji = action.priority === "Crítica" ? "🔴" : 
                          action.priority === "Alta" ? "🟠" : 
                          action.priority === "Média" ? "🟡" : "🟢";
    markdown += `${index + 1}. ${priorityEmoji} **[${action.priority}]** ${action.action}\n`;
    markdown += `   - **Prazo:** ${action.deadline}\n`;
    markdown += `   - **Verificação:** ${action.verification}\n\n`;
  });

  // Footer
  markdown += `---\n\n`;
  markdown += `**Relatório gerado em:** ${new Date(audit.createdAt).toLocaleString('pt-BR')}\n`;
  markdown += `**Gerado por:** ${audit.generatedBy === 'AI' ? 'Sistema AI - Normas IMCA' : 'Manual'}\n\n`;
  markdown += `*Este relatório foi elaborado com base nas normas IMCA, IMO e MTS para sistemas de posicionamento dinâmico.*\n`;

  return markdown;
}

/**
 * Save audit to database
 */
export async function saveAudit(audit: IMCAAuditReport): Promise<void> {
  const { error } = await supabase
    .from('imca_audits')
    .insert({
      id: audit.id,
      vessel_name: audit.vesselName,
      operation_type: audit.operationType,
      location: audit.location,
      dp_class: audit.dpClass,
      audit_date: audit.auditDate,
      auditor: audit.auditor,
      objective: audit.objective,
      status: audit.status,
      operational_context: audit.operationalContext,
      modules: audit.modules,
      overall_compliance: audit.overallCompliance,
      critical_issues: audit.criticalIssues,
      total_non_conformities: audit.totalNonConformities,
      action_plan: audit.actionPlan,
      generated_by: audit.generatedBy,
      created_at: audit.createdAt,
      updated_at: audit.updatedAt
    });

  if (error) {
    console.error("Error saving audit:", error);
    throw new Error(`Falha ao salvar auditoria: ${error.message}`);
  }
}

/**
 * Load audits from database
 */
export async function loadAudits(): Promise<IMCAAuditReport[]> {
  const { data, error } = await supabase
    .from('imca_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error loading audits:", error);
    throw new Error(`Falha ao carregar auditorias: ${error.message}`);
  }

  return (data || []).map(row => ({
    id: row.id,
    vesselName: row.vessel_name,
    operationType: row.operation_type,
    location: row.location,
    dpClass: row.dp_class,
    auditDate: row.audit_date,
    auditor: row.auditor,
    objective: row.objective,
    status: row.status,
    operationalContext: row.operational_context,
    modules: row.modules,
    overallCompliance: row.overall_compliance,
    criticalIssues: row.critical_issues,
    totalNonConformities: row.total_non_conformities,
    actionPlan: row.action_plan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    generatedBy: row.generated_by
  }));
}
