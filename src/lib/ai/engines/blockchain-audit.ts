/**
 * Blockchain Audit Trail Engine
 * Registro imutável de todas as decisões autônomas para compliance
 * Nível: Autônomo
 */

export interface AuditBlock {
  blockId: string;
  previousHash: string;
  timestamp: Date;
  entries: AuditEntry[];
  merkleRoot: string;
  nonce: number;
  hash: string;
  validatorId: string;
}

export interface AuditEntry {
  entryId: string;
  entryType: AuditEntryType;
  timestamp: Date;
  actor: ActorInfo;
  action: ActionInfo;
  context: ContextInfo;
  evidence: EvidenceInfo;
  signature: string;
  metadata: Record<string, unknown>;
}

export type AuditEntryType = 
  | 'ai_decision'
  | 'human_override'
  | 'system_action'
  | 'compliance_check'
  | 'document_signature'
  | 'access_grant'
  | 'access_revoke'
  | 'configuration_change'
  | 'alert_triggered'
  | 'incident_reported';

export interface ActorInfo {
  actorId: string;
  actorType: 'ai_agent' | 'human' | 'system' | 'external';
  actorName: string;
  role: string;
  organization: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface ActionInfo {
  actionType: string;
  description: string;
  module: string;
  resource: string;
  resourceId: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  parameters: Record<string, unknown>;
}

export interface ContextInfo {
  triggeredBy: string;
  reason: string;
  confidence?: number;
  relatedEntries: string[];
  vesselId?: string;
  vesselName?: string;
  voyageId?: string;
  location?: { lat: number; lon: number };
}

export interface EvidenceInfo {
  documents: string[];
  screenshots: string[];
  dataSnapshots: string[];
  approvals: ApprovalRecord[];
  dataHash: string;
}

export interface ApprovalRecord {
  approverId: string;
  approverName: string;
  approvalTime: Date;
  decision: 'approved' | 'rejected' | 'pending';
  comments: string;
  signature: string;
}

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  entryTypes?: AuditEntryType[];
  actorId?: string;
  actorType?: ActorInfo['actorType'];
  module?: string;
  resourceId?: string;
  vesselId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  reportId: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: AuditSummary;
  entries: AuditEntry[];
  statistics: AuditStatistics;
  complianceScore: number;
  integrityStatus: IntegrityStatus;
  recommendations: string[];
}

export interface AuditSummary {
  totalEntries: number;
  byType: Record<AuditEntryType, number>;
  byActor: Record<string, number>;
  byModule: Record<string, number>;
  aiDecisions: number;
  humanOverrides: number;
  alerts: number;
  incidents: number;
}

export interface AuditStatistics {
  aiDecisionAccuracy: number;
  averageConfidence: number;
  overrideRate: number;
  alertResponseTime: number;
  complianceViolations: number;
}

export interface IntegrityStatus {
  verified: boolean;
  lastVerifiedAt: Date;
  blocksVerified: number;
  invalidBlocks: string[];
  chainIntact: boolean;
}

export interface AuditVerification {
  entryId: string;
  verified: boolean;
  blockId: string;
  position: number;
  proof: string[];
  timestamp: Date;
}

class BlockchainAuditEngine {
  private chain: AuditBlock[] = [];
  private pendingEntries: AuditEntry[] = [];
  private readonly BLOCK_SIZE = 100;
  private readonly DIFFICULTY = 2; // Number of leading zeros required

  constructor() {
    this.initializeChain();
  }

  private initializeChain(): void {
    // Create genesis block
    const genesisBlock: AuditBlock = {
      blockId: 'genesis',
      previousHash: '0'.repeat(64),
      timestamp: new Date('2024-01-01T00:00:00Z'),
      entries: [],
      merkleRoot: this.calculateMerkleRoot([]),
      nonce: 0,
      hash: '',
      validatorId: 'system'
    };
    genesisBlock.hash = this.calculateBlockHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  recordEntry(entry: Omit<AuditEntry, 'entryId' | 'timestamp' | 'signature'>): AuditEntry {
    const fullEntry: AuditEntry = {
      ...entry,
      entryId: crypto.randomUUID(),
      timestamp: new Date(),
      signature: ''
    };

    // Generate signature
    fullEntry.signature = this.signEntry(fullEntry);

    // Add to pending entries
    this.pendingEntries.push(fullEntry);

    // Check if we should create a new block
    if (this.pendingEntries.length >= this.BLOCK_SIZE) {
      this.createBlock();
    }

    return fullEntry;
  }

  recordAIDecision(
    agentId: string,
    agentName: string,
    decision: {
      type: string;
      description: string;
      module: string;
      resource: string;
      resourceId: string;
      confidence: number;
      reasoning: string;
      parameters: Record<string, unknown>;
    },
    context: Partial<ContextInfo>
  ): AuditEntry {
    return this.recordEntry({
      entryType: 'ai_decision',
      actor: {
        actorId: agentId,
        actorType: 'ai_agent',
        actorName: agentName,
        role: 'AI Agent',
        organization: 'System'
      },
      action: {
        actionType: decision.type,
        description: decision.description,
        module: decision.module,
        resource: decision.resource,
        resourceId: decision.resourceId,
        previousState: null,
        newState: null,
        parameters: {
          ...decision.parameters,
          reasoning: decision.reasoning
        }
      },
      context: {
        triggeredBy: 'autonomous_operation',
        reason: decision.reasoning,
        confidence: decision.confidence,
        relatedEntries: [],
        ...context
      },
      evidence: {
        documents: [],
        screenshots: [],
        dataSnapshots: [],
        approvals: [],
        dataHash: this.hashData(decision)
      },
      metadata: {
        aiModel: 'multi-agent-consensus',
        version: '4.0'
      }
    });
  }

  recordHumanOverride(
    userId: string,
    userName: string,
    originalDecisionId: string,
    override: {
      reason: string;
      newDecision: string;
      module: string;
      resource: string;
      resourceId: string;
    }
  ): AuditEntry {
    return this.recordEntry({
      entryType: 'human_override',
      actor: {
        actorId: userId,
        actorType: 'human',
        actorName: userName,
        role: 'Operator',
        organization: 'Company'
      },
      action: {
        actionType: 'override',
        description: override.newDecision,
        module: override.module,
        resource: override.resource,
        resourceId: override.resourceId,
        previousState: { originalDecisionId },
        newState: { decision: override.newDecision },
        parameters: {}
      },
      context: {
        triggeredBy: 'human_intervention',
        reason: override.reason,
        relatedEntries: [originalDecisionId]
      },
      evidence: {
        documents: [],
        screenshots: [],
        dataSnapshots: [],
        approvals: [],
        dataHash: this.hashData(override)
      },
      metadata: {}
    });
  }

  recordComplianceCheck(
    framework: string,
    result: {
      passed: boolean;
      score: number;
      findings: string[];
      vesselId?: string;
      vesselName?: string;
    }
  ): AuditEntry {
    return this.recordEntry({
      entryType: 'compliance_check',
      actor: {
        actorId: 'compliance_engine',
        actorType: 'system',
        actorName: 'Compliance Audit Engine',
        role: 'Auditor',
        organization: 'System'
      },
      action: {
        actionType: 'compliance_audit',
        description: `${framework} compliance check: ${result.passed ? 'PASSED' : 'FAILED'}`,
        module: 'compliance',
        resource: framework,
        resourceId: crypto.randomUUID(),
        previousState: null,
        newState: { score: result.score, findings: result.findings },
        parameters: { framework }
      },
      context: {
        triggeredBy: 'scheduled_audit',
        reason: `Regular ${framework} compliance verification`,
        relatedEntries: [],
        vesselId: result.vesselId,
        vesselName: result.vesselName
      },
      evidence: {
        documents: [],
        screenshots: [],
        dataSnapshots: [],
        approvals: [],
        dataHash: this.hashData(result)
      },
      metadata: {
        framework,
        passed: result.passed,
        score: result.score
      }
    });
  }

  private createBlock(): AuditBlock {
    const lastBlock = this.chain[this.chain.length - 1];
    const entries = this.pendingEntries.splice(0, this.BLOCK_SIZE);

    const newBlock: AuditBlock = {
      blockId: crypto.randomUUID(),
      previousHash: lastBlock.hash,
      timestamp: new Date(),
      entries,
      merkleRoot: this.calculateMerkleRoot(entries),
      nonce: 0,
      hash: '',
      validatorId: 'system'
    };

    // Mine the block (simplified proof of work)
    newBlock.hash = this.mineBlock(newBlock);
    this.chain.push(newBlock);

    return newBlock;
  }

  private mineBlock(block: AuditBlock): string {
    let nonce = 0;
    const target = '0'.repeat(this.DIFFICULTY);
    
    while (true) {
      block.nonce = nonce;
      const hash = this.calculateBlockHash(block);
      if (hash.startsWith(target)) {
        return hash;
      }
      nonce++;
      if (nonce > 1000000) break; // Safety limit
    }
    
    return this.calculateBlockHash(block);
  }

  private calculateBlockHash(block: AuditBlock): string {
    const data = JSON.stringify({
      blockId: block.blockId,
      previousHash: block.previousHash,
      timestamp: block.timestamp.toISOString(),
      merkleRoot: block.merkleRoot,
      nonce: block.nonce
    });
    return this.sha256(data);
  }

  private calculateMerkleRoot(entries: AuditEntry[]): string {
    if (entries.length === 0) {
      return this.sha256('empty');
    }

    let hashes = entries.map(e => this.sha256(JSON.stringify(e)));

    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || hashes[i];
        newHashes.push(this.sha256(left + right));
      }
      hashes = newHashes;
    }

    return hashes[0];
  }

  private signEntry(entry: AuditEntry): string {
    const data = JSON.stringify({
      entryId: entry.entryId,
      entryType: entry.entryType,
      timestamp: entry.timestamp,
      actor: entry.actor,
      action: entry.action
    });
    return this.sha256(data);
  }

  private hashData(data: unknown): string {
    return this.sha256(JSON.stringify(data));
  }

  private sha256(data: string): string {
    // Simplified hash - in production would use crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  verifyEntry(entryId: string): AuditVerification {
    // Search for the entry in the chain
    for (const block of this.chain) {
      const entryIndex = block.entries.findIndex(e => e.entryId === entryId);
      if (entryIndex !== -1) {
        const entry = block.entries[entryIndex];
        const recalculatedSignature = this.signEntry({ ...entry, signature: '' });
        
        return {
          entryId,
          verified: recalculatedSignature === entry.signature,
          blockId: block.blockId,
          position: entryIndex,
          proof: this.generateMerkleProof(block.entries, entryIndex),
          timestamp: entry.timestamp
        };
      }
    }

    // Check pending entries
    const pendingEntry = this.pendingEntries.find(e => e.entryId === entryId);
    if (pendingEntry) {
      return {
        entryId,
        verified: true,
        blockId: 'pending',
        position: -1,
        proof: [],
        timestamp: pendingEntry.timestamp
      };
    }

    return {
      entryId,
      verified: false,
      blockId: '',
      position: -1,
      proof: [],
      timestamp: new Date()
    };
  }

  private generateMerkleProof(entries: AuditEntry[], index: number): string[] {
    const proof: string[] = [];
    let hashes = entries.map(e => this.sha256(JSON.stringify(e)));
    let idx = index;

    while (hashes.length > 1) {
      const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      if (siblingIdx < hashes.length) {
        proof.push(hashes[siblingIdx]);
      }

      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || hashes[i];
        newHashes.push(this.sha256(left + right));
      }
      hashes = newHashes;
      idx = Math.floor(idx / 2);
    }

    return proof;
  }

  verifyChainIntegrity(): IntegrityStatus {
    const invalidBlocks: string[] = [];
    
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check previous hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        invalidBlocks.push(currentBlock.blockId);
        continue;
      }

      // Verify block hash
      const recalculatedHash = this.calculateBlockHash(currentBlock);
      if (recalculatedHash !== currentBlock.hash) {
        invalidBlocks.push(currentBlock.blockId);
        continue;
      }

      // Verify merkle root
      const recalculatedMerkle = this.calculateMerkleRoot(currentBlock.entries);
      if (recalculatedMerkle !== currentBlock.merkleRoot) {
        invalidBlocks.push(currentBlock.blockId);
      }
    }

    return {
      verified: invalidBlocks.length === 0,
      lastVerifiedAt: new Date(),
      blocksVerified: this.chain.length,
      invalidBlocks,
      chainIntact: invalidBlocks.length === 0
    };
  }

  queryEntries(query: AuditQuery): AuditEntry[] {
    const allEntries: AuditEntry[] = [
      ...this.chain.flatMap(b => b.entries),
      ...this.pendingEntries
    ];

    return allEntries
      .filter(entry => {
        if (query.startDate && entry.timestamp < query.startDate) return false;
        if (query.endDate && entry.timestamp > query.endDate) return false;
        if (query.entryTypes && !query.entryTypes.includes(entry.entryType)) return false;
        if (query.actorId && entry.actor.actorId !== query.actorId) return false;
        if (query.actorType && entry.actor.actorType !== query.actorType) return false;
        if (query.module && entry.action.module !== query.module) return false;
        if (query.resourceId && entry.action.resourceId !== query.resourceId) return false;
        if (query.vesselId && entry.context.vesselId !== query.vesselId) return false;
        if (query.searchText) {
          const searchLower = query.searchText.toLowerCase();
          const matchesSearch = 
            entry.action.description.toLowerCase().includes(searchLower) ||
            entry.actor.actorName.toLowerCase().includes(searchLower) ||
            entry.context.reason.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  generateReport(startDate: Date, endDate: Date): AuditReport {
    const entries = this.queryEntries({ startDate, endDate, limit: 10000 });
    const integrity = this.verifyChainIntegrity();

    const summary = this.calculateSummary(entries);
    const statistics = this.calculateStatistics(entries);

    const recommendations: string[] = [];
    if (statistics.overrideRate > 0.2) {
      recommendations.push('Alta taxa de override humano - revisar parâmetros de decisão da IA');
    }
    if (statistics.complianceViolations > 0) {
      recommendations.push(`${statistics.complianceViolations} violações de compliance - ação corretiva necessária`);
    }
    if (statistics.averageConfidence < 0.7) {
      recommendations.push('Confiança média da IA abaixo de 70% - considerar retreinamento');
    }

    return {
      reportId: crypto.randomUUID(),
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      summary,
      entries: entries.slice(0, 100), // Limit for report
      statistics,
      complianceScore: this.calculateComplianceScore(entries),
      integrityStatus: integrity,
      recommendations
    };
  }

  private calculateSummary(entries: AuditEntry[]): AuditSummary {
    const byType: Record<AuditEntryType, number> = {} as Record<AuditEntryType, number>;
    const byActor: Record<string, number> = {};
    const byModule: Record<string, number> = {};

    for (const entry of entries) {
      byType[entry.entryType] = (byType[entry.entryType] || 0) + 1;
      byActor[entry.actor.actorName] = (byActor[entry.actor.actorName] || 0) + 1;
      byModule[entry.action.module] = (byModule[entry.action.module] || 0) + 1;
    }

    return {
      totalEntries: entries.length,
      byType,
      byActor,
      byModule,
      aiDecisions: byType['ai_decision'] || 0,
      humanOverrides: byType['human_override'] || 0,
      alerts: byType['alert_triggered'] || 0,
      incidents: byType['incident_reported'] || 0
    };
  }

  private calculateStatistics(entries: AuditEntry[]): AuditStatistics {
    const aiDecisions = entries.filter(e => e.entryType === 'ai_decision');
    const overrides = entries.filter(e => e.entryType === 'human_override');
    const complianceChecks = entries.filter(e => e.entryType === 'compliance_check');

    const confidences = aiDecisions
      .map(e => e.context.confidence)
      .filter((c): c is number => c !== undefined);

    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    const violations = complianceChecks.filter(
      e => e.metadata?.passed === false
    ).length;

    return {
      aiDecisionAccuracy: 0.85, // Would calculate from feedback
      averageConfidence: avgConfidence,
      overrideRate: aiDecisions.length > 0 ? overrides.length / aiDecisions.length : 0,
      alertResponseTime: 300, // Would calculate from timestamps
      complianceViolations: violations
    };
  }

  private calculateComplianceScore(entries: AuditEntry[]): number {
    const complianceChecks = entries.filter(e => e.entryType === 'compliance_check');
    if (complianceChecks.length === 0) return 100;

    const passed = complianceChecks.filter(e => e.metadata?.passed === true).length;
    return Math.round((passed / complianceChecks.length) * 100);
  }

  getChainStats(): {
    totalBlocks: number;
    totalEntries: number;
    pendingEntries: number;
    chainSize: number;
    lastBlockTime: Date;
  } {
    const totalEntries = this.chain.reduce((sum, b) => sum + b.entries.length, 0);
    
    return {
      totalBlocks: this.chain.length,
      totalEntries,
      pendingEntries: this.pendingEntries.length,
      chainSize: JSON.stringify(this.chain).length,
      lastBlockTime: this.chain[this.chain.length - 1].timestamp
    };
  }

  exportChain(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      chain: this.chain,
      pending: this.pendingEntries
    }, null, 2);
  }
}

export const blockchainAuditEngine = new BlockchainAuditEngine();
