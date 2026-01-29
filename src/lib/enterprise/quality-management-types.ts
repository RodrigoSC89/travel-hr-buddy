/**
 * ✅ QUALITY MANAGEMENT - Types & Logic
 * QMS, NCR, CAPA, internal audits, continuous improvement
 */

export interface NonConformity {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'investigating' | 'action_required' | 'closed';
  rootCause?: string;
  correctiveActions: QualityCorrectiveAction[];
  createdAt: Date;
  closedAt?: Date;
}

export interface QualityCorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  effectiveness?: 'effective' | 'partial' | 'ineffective';
}

export interface InternalAudit {
  id: string;
  auditType: string;
  scope: string;
  scheduledDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed';
  findings: AuditFinding[];
  auditor: string;
}

export interface AuditFinding {
  id: string;
  type: 'observation' | 'minor_nc' | 'major_nc' | 'opportunity';
  description: string;
  requirement: string;
  evidence: string;
}

export class QualityManagementEngine {
  private static instance: QualityManagementEngine;
  static getInstance() { return this.instance || (this.instance = new QualityManagementEngine()); }

  createNCR(params: Omit<NonConformity, 'id' | 'status' | 'correctiveActions' | 'createdAt'>): NonConformity {
    return { ...params, id: crypto.randomUUID(), status: 'open', correctiveActions: [], createdAt: new Date() };
  }

  scheduleAudit(params: Omit<InternalAudit, 'id' | 'status' | 'findings'>): InternalAudit {
    return { ...params, id: crypto.randomUUID(), status: 'scheduled', findings: [] };
  }
}

export const qualityManagement = QualityManagementEngine.getInstance();
