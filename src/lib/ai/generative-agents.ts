/**
 * Generative AI Agents v6.0
 * Advanced autonomous agents for document generation and analysis
 */

import { supabase } from "@/integrations/supabase/client";

interface AgentConfig {
  id: string;
  name: string;
  capabilities: string[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface GeneratedDocument {
  id: string;
  type: 'report' | 'certificate' | 'contract' | 'policy' | 'sop';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  generatedAt: Date;
  confidence: number;
}

interface AgentTask {
  id: string;
  agentId: string;
  type: 'generate' | 'analyze' | 'summarize' | 'translate' | 'validate';
  input: unknown;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

// Pre-configured maritime agents
const MARITIME_AGENTS: AgentConfig[] = [
  {
    id: 'doc-generator',
    name: 'Document Generator',
    capabilities: ['report-generation', 'certificate-creation', 'policy-drafting'],
    systemPrompt: `You are a maritime document specialist. Generate professional, 
    compliant documents following MLC 2006, STCW, and SOLAS standards. 
    Use formal maritime terminology and include all required sections.`,
    temperature: 0.3,
    maxTokens: 4000
  },
  {
    id: 'compliance-auditor',
    name: 'Compliance Auditor',
    capabilities: ['regulation-check', 'gap-analysis', 'audit-preparation'],
    systemPrompt: `You are a maritime compliance expert. Analyze documents and 
    operations for regulatory compliance. Reference specific regulations 
    and provide actionable recommendations.`,
    temperature: 0.2,
    maxTokens: 3000
  },
  {
    id: 'crew-advisor',
    name: 'Crew Management Advisor',
    capabilities: ['scheduling', 'certification-tracking', 'training-planning'],
    systemPrompt: `You are a crew management expert. Optimize crew rotations, 
    track certifications, and plan training. Consider rest hours, 
    qualifications, and operational requirements.`,
    temperature: 0.4,
    maxTokens: 2500
  },
  {
    id: 'safety-analyst',
    name: 'Safety Analyst',
    capabilities: ['risk-assessment', 'incident-investigation', 'safety-planning'],
    systemPrompt: `You are a maritime safety expert. Analyze safety data, 
    identify risks, and recommend mitigations. Follow ISM Code and 
    industry best practices.`,
    temperature: 0.3,
    maxTokens: 3000
  },
  {
    id: 'operations-optimizer',
    name: 'Operations Optimizer',
    capabilities: ['route-optimization', 'fuel-efficiency', 'schedule-planning'],
    systemPrompt: `You are a maritime operations expert. Optimize vessel 
    operations for efficiency and cost. Consider weather, fuel, 
    port schedules, and cargo requirements.`,
    temperature: 0.5,
    maxTokens: 2500
  }
];

class GenerativeAgentsEngine {
  private agents = new Map<string, AgentConfig>();
  private taskQueue: AgentTask[] = [];
  private isProcessing = false;

  constructor() {
    // Register default agents
    MARITIME_AGENTS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  registerAgent(config: AgentConfig): void {
    this.agents.set(config.id, config);
  }

  getAgent(id: string): AgentConfig | undefined {
    return this.agents.get(id);
  }

  listAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  async generateDocument(
    type: GeneratedDocument['type'],
    context: Record<string, unknown>
  ): Promise<GeneratedDocument> {
    const agent = this.agents.get('doc-generator');
    if (!agent) throw new Error('Document generator agent not found');

    const prompt = this.buildDocumentPrompt(type, context);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-document-generator', {
        body: {
          type,
          context,
          prompt,
          agentConfig: {
            temperature: agent.temperature,
            maxTokens: agent.maxTokens
          }
        }
      });

      if (error) throw error;

      const doc: GeneratedDocument = {
        id: crypto.randomUUID(),
        type,
        title: data.title || `${type.toUpperCase()} - ${new Date().toISOString()}`,
        content: data.content,
        metadata: {
          ...context,
          agent: agent.id,
          model: data.model || 'gpt-4o'
        },
        generatedAt: new Date(),
        confidence: data.confidence || 0.9
      };

      // Log generation
      await this.logGeneration(doc);

      return doc;
    } catch (error) {
      console.error('[GenerativeAgents] Document generation failed:', error);
      
      // Fallback to template-based generation
      return this.generateFromTemplate(type, context);
    }
  }

  private buildDocumentPrompt(type: string, context: Record<string, unknown>): string {
    const templates: Record<string, string> = {
      report: `Generate a professional maritime ${context.reportType || 'operational'} report.
        Vessel: ${context.vessel || 'N/A'}
        Period: ${context.period || 'Current'}
        Include: Executive summary, key findings, recommendations, appendices.`,
      
      certificate: `Generate a maritime certificate document.
        Type: ${context.certType || 'Competency'}
        Holder: ${context.holder || 'N/A'}
        Include: Certification details, validity, issuing authority, conditions.`,
      
      contract: `Generate a maritime employment contract.
        Position: ${context.position || 'Seafarer'}
        Duration: ${context.duration || '6 months'}
        Include: Terms, compensation, duties, MLC 2006 compliance.`,
      
      policy: `Generate a maritime company policy document.
        Topic: ${context.topic || 'Safety'}
        Include: Purpose, scope, responsibilities, procedures, compliance.`,
      
      sop: `Generate a Standard Operating Procedure (SOP).
        Operation: ${context.operation || 'General'}
        Include: Purpose, scope, references, procedure steps, safety notes.`
    };

    return templates[type] || templates.report;
  }

  private generateFromTemplate(
    type: GeneratedDocument['type'],
    context: Record<string, unknown>
  ): GeneratedDocument {
    const templates: Record<string, string> = {
      report: `
# ${(context.reportType as string)?.toUpperCase() || 'OPERATIONAL'} REPORT
## Vessel: ${context.vessel || 'N/A'}
## Date: ${new Date().toLocaleDateString()}

### Executive Summary
This report covers the ${context.period || 'current period'} operations.

### Key Findings
- Operations proceeded according to plan
- All safety protocols were followed
- Crew performance was satisfactory

### Recommendations
1. Continue current operational procedures
2. Maintain safety vigilance
3. Complete scheduled maintenance

### Appendices
[Generated template - customize as needed]
      `,
      certificate: `
# CERTIFICATE OF ${(context.certType as string)?.toUpperCase() || 'COMPETENCY'}

This certifies that **${context.holder || '[Name]'}** has successfully completed
the requirements for ${context.certType || 'maritime certification'}.

Date of Issue: ${new Date().toLocaleDateString()}
Valid Until: ${context.validUntil || '[Date]'}

[Template - requires official validation]
      `,
      contract: `
# SEAFARER EMPLOYMENT AGREEMENT

## Position: ${context.position || 'Seafarer'}
## Duration: ${context.duration || '6 months'}

### Terms and Conditions
This agreement complies with MLC 2006 requirements.

[Template - legal review required]
      `,
      policy: `
# ${(context.topic as string)?.toUpperCase() || 'COMPANY'} POLICY

## Purpose
To establish guidelines for ${context.topic || 'operations'}.

## Scope
Applies to all personnel and operations.

[Template - customize for organization]
      `,
      sop: `
# STANDARD OPERATING PROCEDURE
## ${context.operation || 'General Operations'}

### Purpose
To provide step-by-step guidance for ${context.operation || 'operations'}.

### Procedure
1. Preparation
2. Execution
3. Verification
4. Documentation

[Template - customize for specific operation]
      `
    };

    return {
      id: crypto.randomUUID(),
      type,
      title: `${type.toUpperCase()} - Template Generated`,
      content: templates[type] || templates.report,
      metadata: { ...context, template: true },
      generatedAt: new Date(),
      confidence: 0.7
    };
  }

  async analyzeDocument(
    content: string,
    analysisType: 'compliance' | 'risk' | 'summary'
  ): Promise<{ analysis: string; score: number; recommendations: string[] }> {
    const agent = analysisType === 'compliance' 
      ? this.agents.get('compliance-auditor')
      : this.agents.get('safety-analyst');

    if (!agent) {
      return {
        analysis: 'Analysis not available',
        score: 0,
        recommendations: []
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-document-analyzer', {
        body: {
          content,
          analysisType,
          agentId: agent.id
        }
      });

      if (error) throw error;

      return {
        analysis: data.analysis || 'Analysis complete',
        score: data.score || 0.8,
        recommendations: data.recommendations || []
      };
    } catch {
      // Fallback analysis
      return {
        analysis: `Document ${analysisType} analysis pending. Please review manually.`,
        score: 0.5,
        recommendations: [
          'Manual review recommended',
          'Verify regulatory compliance',
          'Check for completeness'
        ]
      };
    }
  }

  async runAgent(
    agentId: string,
    input: unknown
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-execute', {
        body: {
          agentId,
          agentConfig: agent,
          input
        }
      });

      if (error) throw error;

      return {
        success: true,
        result: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Agent execution failed'
      };
    }
  }

  private async logGeneration(doc: GeneratedDocument): Promise<void> {
    try {
      console.log('[GenerativeAgents] Logged document:', doc.id);
    } catch (error) {
      console.error('[GenerativeAgents] Failed to log generation:', error);
    }
  }
}

export const generativeAgentsEngine = new GenerativeAgentsEngine();
export type { AgentConfig, GeneratedDocument, AgentTask };
