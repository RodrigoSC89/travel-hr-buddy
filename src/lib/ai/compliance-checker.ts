/**
 * Compliance Checker - PATCH 950
 * Verifies compliance with ANTAQ, MARPOL, ESG regulations
 */

export interface ComplianceRule {
  id: string;
  code: string;
  regulation: "ANTAQ" | "MARPOL" | "ESG" | "NORMAM" | "ISM" | "Internal";
  category: string;
  description: string;
  requirement: string;
  checkFunction: (data: any) => ComplianceCheckResult;
  severity: "info" | "warning" | "critical";
  penalty?: string;
}

export interface ComplianceCheckResult {
  ruleId: string;
  passed: boolean;
  status: "compliant" | "non_compliant" | "warning" | "not_applicable";
  message: string;
  details?: string;
  recommendation?: string;
  evidence?: string;
  checkedAt: Date;
}

export interface ComplianceReport {
  id: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  overallScore: number;
  byRegulation: Record<string, { total: number; passed: number; score: number }>;
  results: ComplianceCheckResult[];
  criticalIssues: ComplianceCheckResult[];
  recommendations: string[];
}

// Built-in compliance rules
const COMPLIANCE_RULES: ComplianceRule[] = [
  // ANTAQ Rules
  {
    id: "antaq-001",
    code: "ANTAQ-RES-72",
    regulation: "ANTAQ",
    category: "Documentação",
    description: "Registro de embarcação atualizado",
    requirement: "Todas as embarcações devem ter registro válido e atualizado junto à ANTAQ",
    severity: "critical",
    penalty: "Multa de R$ 10.000 a R$ 100.000",
    checkFunction: (data) => {
      const vessel = data.vessel;
      if (!vessel?.registrationExpiry) {
        return {
          ruleId: "antaq-001",
          passed: false,
          status: "non_compliant",
          message: "Registro de embarcação não encontrado",
          recommendation: "Atualize o registro da embarcação imediatamente",
          checkedAt: new Date()
        };
      }
      const expiry = new Date(vessel.registrationExpiry);
      const daysUntilExpiry = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilExpiry < 0) {
        return {
          ruleId: "antaq-001",
          passed: false,
          status: "non_compliant",
          message: "Registro da embarcação expirado",
          details: `Expirou em ${expiry.toLocaleDateString()}`,
          recommendation: "Renove o registro urgentemente para evitar penalidades",
          checkedAt: new Date()
        };
      }
      if (daysUntilExpiry < 30) {
        return {
          ruleId: "antaq-001",
          passed: true,
          status: "warning",
          message: "Registro próximo do vencimento",
          details: `Expira em ${Math.floor(daysUntilExpiry)} dias`,
          recommendation: "Inicie o processo de renovação",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "antaq-001",
        passed: true,
        status: "compliant",
        message: "Registro de embarcação válido",
        evidence: `Válido até ${expiry.toLocaleDateString()}`,
        checkedAt: new Date()
      };
    }
  },
  
  // MARPOL Rules
  {
    id: "marpol-001",
    code: "MARPOL-ANNEX-I",
    regulation: "MARPOL",
    category: "Meio Ambiente",
    description: "Registro de descarte de óleo",
    requirement: "Manter registro de todas as operações de descarte de óleo e resíduos oleosos",
    severity: "critical",
    penalty: "Detenção do navio e multa internacional",
    checkFunction: (data) => {
      const lastOilRecord = data.oilRecordBook?.lastEntry;
      if (!lastOilRecord) {
        return {
          ruleId: "marpol-001",
          passed: false,
          status: "non_compliant",
          message: "Livro de Registro de Óleo não encontrado",
          recommendation: "Implemente o registro de operações de óleo imediatamente",
          checkedAt: new Date()
        };
      }
      const daysSinceLastEntry = (Date.now() - new Date(lastOilRecord).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastEntry > 7) {
        return {
          ruleId: "marpol-001",
          passed: false,
          status: "warning",
          message: "Registro de óleo desatualizado",
          details: `Última entrada há ${Math.floor(daysSinceLastEntry)} dias`,
          recommendation: "Atualize o registro de operações de óleo",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "marpol-001",
        passed: true,
        status: "compliant",
        message: "Registro de óleo em dia",
        checkedAt: new Date()
      };
    }
  },
  {
    id: "marpol-002",
    code: "MARPOL-ANNEX-IV",
    regulation: "MARPOL",
    category: "Meio Ambiente",
    description: "Sistema de tratamento de esgoto",
    requirement: "Embarcações devem possuir sistema de tratamento de esgoto aprovado",
    severity: "critical",
    checkFunction: (data) => {
      const sewageSystem = data.vessel?.sewageTreatmentSystem;
      if (!sewageSystem?.certified) {
        return {
          ruleId: "marpol-002",
          passed: false,
          status: "non_compliant",
          message: "Sistema de tratamento de esgoto não certificado",
          recommendation: "Obtenha certificação do sistema de tratamento",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "marpol-002",
        passed: true,
        status: "compliant",
        message: "Sistema de esgoto certificado",
        evidence: `Certificado: ${sewageSystem.certificateNumber}`,
        checkedAt: new Date()
      };
    }
  },

  // ESG Rules
  {
    id: "esg-001",
    code: "ESG-EMISSIONS",
    regulation: "ESG",
    category: "Emissões",
    description: "Monitoramento de emissões de CO2",
    requirement: "Registrar e monitorar emissões de CO2 mensalmente",
    severity: "warning",
    checkFunction: (data) => {
      const emissions = data.emissions?.monthlyRecords;
      if (!emissions || emissions.length === 0) {
        return {
          ruleId: "esg-001",
          passed: false,
          status: "non_compliant",
          message: "Sem registro de emissões",
          recommendation: "Implemente monitoramento de emissões de CO2",
          checkedAt: new Date()
        };
      }
      const lastRecord = emissions[emissions.length - 1];
      const daysSinceLastRecord = (Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastRecord > 35) {
        return {
          ruleId: "esg-001",
          passed: false,
          status: "warning",
          message: "Registro de emissões desatualizado",
          recommendation: "Atualize o registro mensal de emissões",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "esg-001",
        passed: true,
        status: "compliant",
        message: "Monitoramento de emissões em dia",
        evidence: `Último registro: ${new Date(lastRecord.date).toLocaleDateString()}`,
        checkedAt: new Date()
      };
    }
  },
  {
    id: "esg-002",
    code: "ESG-WASTE",
    regulation: "ESG",
    category: "Resíduos",
    description: "Gestão de resíduos sólidos",
    requirement: "Implementar plano de gestão de resíduos sólidos",
    severity: "warning",
    checkFunction: (data) => {
      const wasteManagement = data.wasteManagement;
      if (!wasteManagement?.planApproved) {
        return {
          ruleId: "esg-002",
          passed: false,
          status: "non_compliant",
          message: "Plano de gestão de resíduos não aprovado",
          recommendation: "Desenvolva e aprove um plano de gestão de resíduos",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "esg-002",
        passed: true,
        status: "compliant",
        message: "Plano de resíduos aprovado",
        checkedAt: new Date()
      };
    }
  },

  // ISM Rules
  {
    id: "ism-001",
    code: "ISM-DOC",
    regulation: "ISM",
    category: "Segurança",
    description: "Documento de Conformidade (DOC)",
    requirement: "Empresa deve possuir DOC válido",
    severity: "critical",
    checkFunction: (data) => {
      const doc = data.company?.docCertificate;
      if (!doc?.valid) {
        return {
          ruleId: "ism-001",
          passed: false,
          status: "non_compliant",
          message: "Documento de Conformidade inválido ou ausente",
          recommendation: "Obtenha ou renove o DOC junto à autoridade marítima",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "ism-001",
        passed: true,
        status: "compliant",
        message: "DOC válido",
        evidence: `Número: ${doc.number}`,
        checkedAt: new Date()
      };
    }
  },
  {
    id: "ism-002",
    code: "ISM-SMC",
    regulation: "ISM",
    category: "Segurança",
    description: "Certificado de Gerenciamento de Segurança (SMC)",
    requirement: "Cada embarcação deve possuir SMC válido",
    severity: "critical",
    checkFunction: (data) => {
      const smc = data.vessel?.smcCertificate;
      if (!smc?.valid) {
        return {
          ruleId: "ism-002",
          passed: false,
          status: "non_compliant",
          message: "SMC inválido ou ausente",
          recommendation: "Obtenha ou renove o SMC da embarcação",
          checkedAt: new Date()
        };
      }
      const expiry = new Date(smc.expiry);
      const daysUntilExpiry = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilExpiry < 60) {
        return {
          ruleId: "ism-002",
          passed: true,
          status: "warning",
          message: "SMC próximo do vencimento",
          details: `Expira em ${Math.floor(daysUntilExpiry)} dias`,
          recommendation: "Inicie o processo de renovação",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "ism-002",
        passed: true,
        status: "compliant",
        message: "SMC válido",
        evidence: `Válido até ${expiry.toLocaleDateString()}`,
        checkedAt: new Date()
      };
    }
  },

  // Internal Rules
  {
    id: "int-001",
    code: "INT-MAINT",
    regulation: "Internal",
    category: "Manutenção",
    description: "Manutenção preventiva em dia",
    requirement: "Realizar manutenção preventiva conforme cronograma",
    severity: "warning",
    checkFunction: (data) => {
      const maintenance = data.maintenance;
      if (!maintenance) {
        return {
          ruleId: "int-001",
          passed: false,
          status: "not_applicable",
          message: "Dados de manutenção não disponíveis",
          checkedAt: new Date()
        };
      }
      const overdueCount = maintenance.overdueTasks || 0;
      if (overdueCount > 5) {
        return {
          ruleId: "int-001",
          passed: false,
          status: "non_compliant",
          message: `${overdueCount} tarefas de manutenção atrasadas`,
          recommendation: "Priorize a execução das manutenções pendentes",
          checkedAt: new Date()
        };
      }
      if (overdueCount > 0) {
        return {
          ruleId: "int-001",
          passed: true,
          status: "warning",
          message: `${overdueCount} tarefa(s) de manutenção atrasada(s)`,
          recommendation: "Execute as manutenções pendentes",
          checkedAt: new Date()
        };
      }
      return {
        ruleId: "int-001",
        passed: true,
        status: "compliant",
        message: "Manutenção preventiva em dia",
        checkedAt: new Date()
      };
    }
  }
];

class ComplianceChecker {
  private rules: ComplianceRule[] = [...COMPLIANCE_RULES];

  /**
   * Run all compliance checks
   */
  runFullCheck(data: any): ComplianceReport {
    const results: ComplianceCheckResult[] = [];
    const byRegulation: Record<string, { total: number; passed: number; score: number }> = {};

    // Initialize regulation counters
    const regulations = [...new Set(this.rules.map(r => r.regulation))];
    regulations.forEach(reg => {
      byRegulation[reg] = { total: 0, passed: 0, score: 0 };
    });

    // Run each rule
    this.rules.forEach(rule => {
      try {
        const result = rule.checkFunction(data);
        results.push(result);
        
        byRegulation[rule.regulation].total++;
        if (result.passed) {
          byRegulation[rule.regulation].passed++;
        }
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          status: "not_applicable",
          message: `Erro ao verificar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          checkedAt: new Date()
        });
      }
    });

    // Calculate scores
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.keys(byRegulation).forEach(reg => {
      const stats = byRegulation[reg];
      if (stats.total > 0) {
        stats.score = Math.round((stats.passed / stats.total) * 100);
        totalScore += stats.score;
        totalWeight++;
      }
    });

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Get critical issues
    const criticalIssues = results.filter(r => 
      !r.passed && 
      this.rules.find(rule => rule.id === r.ruleId)?.severity === "critical"
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (criticalIssues.length > 0) {
      recommendations.push(`⚠️ ${criticalIssues.length} problema(s) crítico(s) requerem atenção imediata`);
    }
    
    Object.entries(byRegulation).forEach(([reg, stats]) => {
      if (stats.score < 80) {
        recommendations.push(`Melhore a conformidade com ${reg}: atual ${stats.score}%`);
      }
    });

    if (overallScore >= 90) {
      recommendations.push("✅ Excelente nível de conformidade. Mantenha o monitoramento regular.");
    }

    return {
      id: `report_${Date.now()}`,
      generatedAt: new Date(),
      period: { start: new Date(), end: new Date() },
      overallScore,
      byRegulation,
      results,
      criticalIssues,
      recommendations
    };
  }

  /**
   * Check specific regulation
   */
  checkRegulation(regulation: ComplianceRule["regulation"], data: any): ComplianceCheckResult[] {
    return this.rules
      .filter(r => r.regulation === regulation)
      .map(rule => {
        try {
          return rule.checkFunction(data);
        } catch (error) {
          return {
            ruleId: rule.id,
            passed: false,
            status: "not_applicable" as const,
            message: `Erro ao verificar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            checkedAt: new Date()
          };
        }
      });
  }

  /**
   * Get all rules
   */
  getRules(): ComplianceRule[] {
    return [...this.rules];
  }

  /**
   * Get rules by regulation
   */
  getRulesByRegulation(regulation: ComplianceRule["regulation"]): ComplianceRule[] {
    return this.rules.filter(r => r.regulation === regulation);
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): ComplianceRule[] {
    return this.rules.filter(r => r.category === category);
  }

  /**
   * Add custom rule
   */
  addRule(rule: ComplianceRule): void {
    this.rules.push(rule);
  }

  /**
   * Get compliance summary for display
   */
  getSummary(report: ComplianceReport): string {
    let summary = "## Relatório de Conformidade\n\n";
    summary += `**Score Geral: ${report.overallScore}%**\n\n`;
    
    summary += "### Por Regulação:\n";
    Object.entries(report.byRegulation).forEach(([reg, stats]) => {
      const icon = stats.score >= 80 ? "✅" : stats.score >= 50 ? "⚠️" : "❌";
      summary += `- ${icon} ${reg}: ${stats.score}% (${stats.passed}/${stats.total})\n`;
    });

    if (report.criticalIssues.length > 0) {
      summary += "\n### ⚠️ Problemas Críticos:\n";
      report.criticalIssues.forEach(issue => {
        summary += `- ${issue.message}\n`;
        if (issue.recommendation) {
          summary += `  → ${issue.recommendation}\n`;
        }
      });
    }

    summary += "\n### Recomendações:\n";
    report.recommendations.forEach(rec => {
      summary += `- ${rec}\n`;
    });

    return summary;
  }
}

export const complianceChecker = new ComplianceChecker();
