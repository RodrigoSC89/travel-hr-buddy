/**
 * Fraud Detection Engine
 * IA identifica padrões anômalos em despesas e bloqueia transações suspeitas
 * Nível: Autônomo
 */

export interface Transaction {
  id: string;
  type: 'expense' | 'purchase_order' | 'invoice' | 'payment' | 'reimbursement';
  amount: number;
  currency: string;
  description: string;
  category: string;
  vendor: string;
  vendorId: string;
  requestedBy: string;
  approvedBy: string | null;
  department: string;
  vesselId: string | null;
  date: Date;
  location: string;
  paymentMethod: string;
  attachments: string[];
  metadata: Record<string, any>;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  alertType: FraudAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  description: string;
  indicators: FraudIndicator[];
  recommendedAction: 'approve' | 'review' | 'block' | 'investigate';
  autoBlocked: boolean;
  status: 'pending' | 'reviewed' | 'confirmed_fraud' | 'false_positive' | 'escalated';
  createdAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  notes: string | null;
}

export type FraudAlertType =
  | 'duplicate_payment'
  | 'unusual_amount'
  | 'vendor_anomaly'
  | 'timing_anomaly'
  | 'approval_bypass'
  | 'round_number_pattern'
  | 'split_transaction'
  | 'ghost_vendor'
  | 'kickback_pattern'
  | 'expense_inflation';

export interface FraudIndicator {
  indicator: string;
  weight: number;
  evidence: string;
  confidence: number;
}

export interface VendorRiskProfile {
  vendorId: string;
  vendorName: string;
  riskScore: number;
  riskFactors: string[];
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
  unusualPatterns: string[];
  lastTransactionDate: Date;
  flaggedTransactions: number;
  relationship: 'new' | 'established' | 'preferred';
}

export interface FraudAnalytics {
  period: { start: Date; end: Date };
  totalTransactions: number;
  flaggedTransactions: number;
  blockedTransactions: number;
  confirmedFraud: number;
  falsePositives: number;
  totalAmountAtRisk: number;
  savedAmount: number;
  detectionRate: number;
  topFraudTypes: Array<{ type: FraudAlertType; count: number; amount: number }>;
  riskByDepartment: Array<{ department: string; riskScore: number; incidents: number }>;
  riskByVendor: Array<{ vendor: string; riskScore: number; amount: number }>;
}

class FraudDetectionEngine {
  private transactionHistory: Map<string, Transaction[]> = new Map();
  private vendorProfiles: Map<string, VendorRiskProfile> = new Map();
  private readonly BLOCK_THRESHOLD = 85; // Auto-block if risk > 85
  private readonly REVIEW_THRESHOLD = 60;

  async analyzeTransaction(
    transaction: Transaction,
    historicalData?: Transaction[]
  ): Promise<FraudAlert | null> {
    const indicators: FraudIndicator[] = [];

    // Store historical data
    if (historicalData) {
      this.transactionHistory.set(transaction.department, historicalData);
    }

    // Run all detection algorithms
    const checks = await Promise.all([
      this.checkDuplicatePayment(transaction),
      this.checkUnusualAmount(transaction),
      this.checkVendorAnomaly(transaction),
      this.checkTimingAnomaly(transaction),
      this.checkApprovalBypass(transaction),
      this.checkRoundNumberPattern(transaction),
      this.checkSplitTransaction(transaction),
      this.checkGhostVendor(transaction),
      this.checkKickbackPattern(transaction),
      this.checkExpenseInflation(transaction)
    ]);

    // Collect all indicators
    checks.forEach(check => {
      if (check) indicators.push(...check);
    });

    if (indicators.length === 0) return null;

    // Calculate weighted risk score
    const riskScore = this.calculateRiskScore(indicators);
    const alertType = this.determineAlertType(indicators);
    const severity = this.determineSeverity(riskScore);
    const autoBlocked = riskScore >= this.BLOCK_THRESHOLD;

    return {
      id: crypto.randomUUID(),
      transactionId: transaction.id,
      alertType,
      severity,
      riskScore,
      description: this.generateAlertDescription(alertType, indicators),
      indicators,
      recommendedAction: this.determineAction(riskScore, alertType),
      autoBlocked,
      status: autoBlocked ? 'pending' : 'pending',
      createdAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      notes: null
    };
  }

  private async checkDuplicatePayment(tx: Transaction): Promise<FraudIndicator[] | null> {
    const history = this.transactionHistory.get(tx.department) || [];
    
    const duplicates = history.filter(h => 
      h.id !== tx.id &&
      h.vendorId === tx.vendorId &&
      h.amount === tx.amount &&
      Math.abs(new Date(h.date).getTime() - new Date(tx.date).getTime()) < 30 * 24 * 60 * 60 * 1000
    );

    if (duplicates.length > 0) {
      return [{
        indicator: 'Pagamento duplicado detectado',
        weight: 40,
        evidence: `${duplicates.length} transação(ões) idêntica(s) para ${tx.vendor} no valor de ${tx.currency} ${tx.amount}`,
        confidence: 0.95
      }];
    }

    // Check similar amounts (within 1%)
    const similarAmounts = history.filter(h =>
      h.id !== tx.id &&
      h.vendorId === tx.vendorId &&
      Math.abs(h.amount - tx.amount) / tx.amount < 0.01 &&
      h.description === tx.description
    );

    if (similarAmounts.length >= 2) {
      return [{
        indicator: 'Padrão de valores similares',
        weight: 25,
        evidence: `${similarAmounts.length} transações com valores quase idênticos`,
        confidence: 0.75
      }];
    }

    return null;
  }

  private async checkUnusualAmount(tx: Transaction): Promise<FraudIndicator[] | null> {
    const history = this.transactionHistory.get(tx.department) || [];
    const categoryHistory = history.filter(h => h.category === tx.category);

    if (categoryHistory.length < 5) return null;

    const amounts = categoryHistory.map(h => h.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    );

    const zScore = (tx.amount - mean) / stdDev;

    if (zScore > 3) {
      return [{
        indicator: 'Valor significativamente acima da média',
        weight: 35,
        evidence: `Transação de ${tx.currency} ${tx.amount} está ${zScore.toFixed(1)} desvios padrão acima da média (${tx.currency} ${mean.toFixed(2)})`,
        confidence: 0.85
      }];
    }

    if (tx.amount > 10000 && categoryHistory.every(h => h.amount < 5000)) {
      return [{
        indicator: 'Primeiro grande valor nesta categoria',
        weight: 30,
        evidence: `Transação de ${tx.currency} ${tx.amount} é muito maior que o histórico (max: ${Math.max(...amounts)})`,
        confidence: 0.80
      }];
    }

    return null;
  }

  private async checkVendorAnomaly(tx: Transaction): Promise<FraudIndicator[] | null> {
    const indicators: FraudIndicator[] = [];
    const vendorHistory = (this.transactionHistory.get(tx.department) || [])
      .filter(h => h.vendorId === tx.vendorId);

    // New vendor with high amount
    if (vendorHistory.length === 0 && tx.amount > 5000) {
      indicators.push({
        indicator: 'Novo fornecedor com valor alto',
        weight: 25,
        evidence: `Primeira transação com ${tx.vendor} no valor de ${tx.currency} ${tx.amount}`,
        confidence: 0.70
      });
    }

    // Sudden spike in vendor activity
    const recentVendorTx = vendorHistory.filter(h => 
      new Date(h.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    if (recentVendorTx.length > 5) {
      indicators.push({
        indicator: 'Aumento súbito de transações com fornecedor',
        weight: 20,
        evidence: `${recentVendorTx.length} transações com ${tx.vendor} nos últimos 7 dias`,
        confidence: 0.65
      });
    }

    return indicators.length > 0 ? indicators : null;
  }

  private async checkTimingAnomaly(tx: Transaction): Promise<FraudIndicator[] | null> {
    const txDate = new Date(tx.date);
    const indicators: FraudIndicator[] = [];

    // Weekend transaction
    if (txDate.getDay() === 0 || txDate.getDay() === 6) {
      if (tx.amount > 2000) {
        indicators.push({
          indicator: 'Transação de alto valor em fim de semana',
          weight: 15,
          evidence: `Transação de ${tx.currency} ${tx.amount} realizada em ${txDate.toLocaleDateString('pt-BR', { weekday: 'long' })}`,
          confidence: 0.60
        });
      }
    }

    // End of month/quarter (potential budget gaming)
    const dayOfMonth = txDate.getDate();
    const month = txDate.getMonth();
    
    if (dayOfMonth >= 28 || dayOfMonth <= 2) {
      const history = this.transactionHistory.get(tx.department) || [];
      const endOfMonthTx = history.filter(h => {
        const d = new Date(h.date);
        return d.getDate() >= 28 || d.getDate() <= 2;
      });

      if (endOfMonthTx.length > history.length * 0.3) {
        indicators.push({
          indicator: 'Concentração de transações no fim do período',
          weight: 20,
          evidence: 'Mais de 30% das transações ocorrem nos últimos/primeiros dias do mês',
          confidence: 0.55
        });
      }
    }

    return indicators.length > 0 ? indicators : null;
  }

  private async checkApprovalBypass(tx: Transaction): Promise<FraudIndicator[] | null> {
    // Check if same person requested and approved
    if (tx.requestedBy === tx.approvedBy && tx.approvedBy !== null) {
      return [{
        indicator: 'Auto-aprovação detectada',
        weight: 45,
        evidence: `${tx.requestedBy} solicitou e aprovou a mesma transação`,
        confidence: 0.95
      }];
    }

    // Check approval hierarchy (simplified - would need org data)
    if (tx.amount > 10000 && tx.approvedBy === null) {
      return [{
        indicator: 'Transação de alto valor sem aprovação',
        weight: 50,
        evidence: `Transação de ${tx.currency} ${tx.amount} não tem aprovação registrada`,
        confidence: 0.90
      }];
    }

    return null;
  }

  private async checkRoundNumberPattern(tx: Transaction): Promise<FraudIndicator[] | null> {
    // Check if amount is suspiciously round
    const isRound = tx.amount % 1000 === 0 && tx.amount >= 1000;
    
    if (isRound && tx.type === 'expense') {
      const history = this.transactionHistory.get(tx.department) || [];
      const roundTx = history.filter(h => 
        h.requestedBy === tx.requestedBy && 
        h.amount % 1000 === 0 && 
        h.amount >= 1000
      );

      if (roundTx.length > 3) {
        return [{
          indicator: 'Padrão de valores redondos',
          weight: 25,
          evidence: `${roundTx.length + 1} transações com valores redondos pelo mesmo solicitante`,
          confidence: 0.70
        }];
      }
    }

    return null;
  }

  private async checkSplitTransaction(tx: Transaction): Promise<FraudIndicator[] | null> {
    const history = this.transactionHistory.get(tx.department) || [];
    
    // Find transactions on same day from same person
    const sameDayTx = history.filter(h =>
      h.requestedBy === tx.requestedBy &&
      h.vendorId === tx.vendorId &&
      new Date(h.date).toDateString() === new Date(tx.date).toDateString()
    );

    // Check if splitting to avoid approval threshold
    const totalAmount = sameDayTx.reduce((sum, h) => sum + h.amount, 0) + tx.amount;
    const avgAmount = totalAmount / (sameDayTx.length + 1);

    // Common approval thresholds
    const thresholds = [1000, 5000, 10000, 25000];
    
    for (const threshold of thresholds) {
      if (totalAmount > threshold && avgAmount < threshold && sameDayTx.length >= 2) {
        return [{
          indicator: 'Possível fracionamento de transação',
          weight: 40,
          evidence: `${sameDayTx.length + 1} transações totalizando ${tx.currency} ${totalAmount.toFixed(2)}, cada uma abaixo de ${tx.currency} ${threshold}`,
          confidence: 0.80
        }];
      }
    }

    return null;
  }

  private async checkGhostVendor(tx: Transaction): Promise<FraudIndicator[] | null> {
    const indicators: FraudIndicator[] = [];

    // Check for generic vendor names
    const genericNames = ['services', 'consulting', 'supplies', 'general', 'misc'];
    const vendorLower = tx.vendor.toLowerCase();

    if (genericNames.some(g => vendorLower.includes(g))) {
      indicators.push({
        indicator: 'Nome de fornecedor genérico',
        weight: 15,
        evidence: `Fornecedor "${tx.vendor}" tem nome genérico`,
        confidence: 0.55
      });
    }

    // Check for similar vendor names (possible duplicates)
    const allVendors = [...this.vendorProfiles.keys()];
    const similarVendors = allVendors.filter(v => 
      this.calculateStringSimilarity(v, tx.vendor) > 0.8 && v !== tx.vendor
    );

    if (similarVendors.length > 0) {
      indicators.push({
        indicator: 'Fornecedor similar existente',
        weight: 25,
        evidence: `Fornecedor "${tx.vendor}" é similar a: ${similarVendors.join(', ')}`,
        confidence: 0.75
      });
    }

    return indicators.length > 0 ? indicators : null;
  }

  private async checkKickbackPattern(tx: Transaction): Promise<FraudIndicator[] | null> {
    const history = this.transactionHistory.get(tx.department) || [];
    
    // Check for consistent percentage patterns
    const vendorTx = history.filter(h => h.vendorId === tx.vendorId);
    
    if (vendorTx.length >= 5) {
      // Check if amounts follow a consistent markup pattern
      const ratios = vendorTx.map(h => h.amount);
      const sortedRatios = [...ratios].sort((a, b) => a - b);
      
      // Check for consistent round percentages
      for (const base of ratios) {
        const markups = ratios.map(r => (r / base) * 100);
        const roundMarkups = markups.filter(m => 
          Math.abs(m - Math.round(m / 5) * 5) < 1
        );
        
        if (roundMarkups.length > ratios.length * 0.7) {
          return [{
            indicator: 'Padrão de percentual consistente',
            weight: 30,
            evidence: 'Valores sugerem markup sistemático entre transações',
            confidence: 0.65
          }];
        }
      }
    }

    return null;
  }

  private async checkExpenseInflation(tx: Transaction): Promise<FraudIndicator[] | null> {
    if (tx.category !== 'travel' && tx.category !== 'meals' && tx.category !== 'accommodation') {
      return null;
    }

    // Market rate benchmarks (simplified)
    const benchmarks: Record<string, number> = {
      'travel_domestic': 1500,
      'travel_international': 5000,
      'meals': 150,
      'accommodation': 400
    };

    const benchmark = benchmarks[tx.category] || 1000;
    
    if (tx.amount > benchmark * 2) {
      return [{
        indicator: 'Despesa significativamente acima do benchmark',
        weight: 25,
        evidence: `${tx.category}: ${tx.currency} ${tx.amount} vs benchmark de ${tx.currency} ${benchmark}`,
        confidence: 0.70
      }];
    }

    return null;
  }

  private calculateRiskScore(indicators: FraudIndicator[]): number {
    if (indicators.length === 0) return 0;

    // Weighted sum with confidence adjustment
    const weightedSum = indicators.reduce((sum, ind) => {
      return sum + (ind.weight * ind.confidence);
    }, 0);

    // Normalize to 0-100, with bonus for multiple indicators
    const multiplier = 1 + (indicators.length - 1) * 0.1;
    return Math.min(100, Math.round(weightedSum * multiplier));
  }

  private determineAlertType(indicators: FraudIndicator[]): FraudAlertType {
    // Return the type based on highest weight indicator
    const indicatorToType: Record<string, FraudAlertType> = {
      'Pagamento duplicado': 'duplicate_payment',
      'Valor significativamente acima': 'unusual_amount',
      'Novo fornecedor': 'vendor_anomaly',
      'Auto-aprovação': 'approval_bypass',
      'valores redondos': 'round_number_pattern',
      'fracionamento': 'split_transaction',
      'genérico': 'ghost_vendor',
      'percentual consistente': 'kickback_pattern',
      'acima do benchmark': 'expense_inflation'
    };

    const topIndicator = indicators.sort((a, b) => b.weight - a.weight)[0];
    
    for (const [key, type] of Object.entries(indicatorToType)) {
      if (topIndicator.indicator.toLowerCase().includes(key.toLowerCase())) {
        return type;
      }
    }

    return 'unusual_amount';
  }

  private determineSeverity(riskScore: number): FraudAlert['severity'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private determineAction(riskScore: number, alertType: FraudAlertType): FraudAlert['recommendedAction'] {
    if (riskScore >= this.BLOCK_THRESHOLD) return 'block';
    if (riskScore >= this.REVIEW_THRESHOLD) return 'investigate';
    if (alertType === 'approval_bypass' || alertType === 'duplicate_payment') return 'review';
    return 'review';
  }

  private generateAlertDescription(type: FraudAlertType, indicators: FraudIndicator[]): string {
    const descriptions: Record<FraudAlertType, string> = {
      duplicate_payment: 'Possível pagamento duplicado detectado',
      unusual_amount: 'Valor da transação fora do padrão esperado',
      vendor_anomaly: 'Comportamento incomum do fornecedor',
      timing_anomaly: 'Transação em horário/data atípico',
      approval_bypass: 'Possível violação de controles de aprovação',
      round_number_pattern: 'Padrão suspeito de valores redondos',
      split_transaction: 'Possível fracionamento para evitar controles',
      ghost_vendor: 'Fornecedor com características suspeitas',
      kickback_pattern: 'Padrão sugestivo de propina ou kickback',
      expense_inflation: 'Despesa significativamente inflacionada'
    };

    const mainDesc = descriptions[type];
    const indicatorSummary = indicators.slice(0, 2).map(i => i.indicator).join('; ');
    
    return `${mainDesc}. Indicadores: ${indicatorSummary}`;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    
    return costs[s2.length];
  }

  generateAnalytics(
    transactions: Transaction[],
    alerts: FraudAlert[],
    period: { start: Date; end: Date }
  ): FraudAnalytics {
    const periodAlerts = alerts.filter(a => 
      new Date(a.createdAt) >= period.start && 
      new Date(a.createdAt) <= period.end
    );

    const confirmedFraud = periodAlerts.filter(a => a.status === 'confirmed_fraud');
    const falsePositives = periodAlerts.filter(a => a.status === 'false_positive');

    const typeGroups = new Map<FraudAlertType, { count: number; amount: number }>();
    for (const alert of periodAlerts) {
      const tx = transactions.find(t => t.id === alert.transactionId);
      const existing = typeGroups.get(alert.alertType) || { count: 0, amount: 0 };
      typeGroups.set(alert.alertType, {
        count: existing.count + 1,
        amount: existing.amount + (tx?.amount || 0)
      });
    }

    return {
      period,
      totalTransactions: transactions.length,
      flaggedTransactions: periodAlerts.length,
      blockedTransactions: periodAlerts.filter(a => a.autoBlocked).length,
      confirmedFraud: confirmedFraud.length,
      falsePositives: falsePositives.length,
      totalAmountAtRisk: periodAlerts.reduce((sum, a) => {
        const tx = transactions.find(t => t.id === a.transactionId);
        return sum + (tx?.amount || 0);
      }, 0),
      savedAmount: confirmedFraud.reduce((sum, a) => {
        const tx = transactions.find(t => t.id === a.transactionId);
        return sum + (tx?.amount || 0);
      }, 0),
      detectionRate: periodAlerts.length > 0 
        ? (confirmedFraud.length / (confirmedFraud.length + falsePositives.length)) * 100
        : 0,
      topFraudTypes: [...typeGroups.entries()]
        .map(([type, data]) => ({ type, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      riskByDepartment: this.calculateDepartmentRisk(transactions, periodAlerts),
      riskByVendor: this.calculateVendorRisk(transactions, periodAlerts)
    };
  }

  private calculateDepartmentRisk(
    transactions: Transaction[],
    alerts: FraudAlert[]
  ): Array<{ department: string; riskScore: number; incidents: number }> {
    const deptGroups = new Map<string, { count: number; alerts: number }>();

    for (const tx of transactions) {
      const existing = deptGroups.get(tx.department) || { count: 0, alerts: 0 };
      const hasAlert = alerts.some(a => a.transactionId === tx.id);
      deptGroups.set(tx.department, {
        count: existing.count + 1,
        alerts: existing.alerts + (hasAlert ? 1 : 0)
      });
    }

    return [...deptGroups.entries()]
      .map(([department, data]) => ({
        department,
        riskScore: Math.round((data.alerts / data.count) * 100),
        incidents: data.alerts
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  private calculateVendorRisk(
    transactions: Transaction[],
    alerts: FraudAlert[]
  ): Array<{ vendor: string; riskScore: number; amount: number }> {
    const vendorGroups = new Map<string, { count: number; alerts: number; amount: number }>();

    for (const tx of transactions) {
      const existing = vendorGroups.get(tx.vendor) || { count: 0, alerts: 0, amount: 0 };
      const hasAlert = alerts.some(a => a.transactionId === tx.id);
      vendorGroups.set(tx.vendor, {
        count: existing.count + 1,
        alerts: existing.alerts + (hasAlert ? 1 : 0),
        amount: existing.amount + tx.amount
      });
    }

    return [...vendorGroups.entries()]
      .map(([vendor, data]) => ({
        vendor,
        riskScore: Math.round((data.alerts / data.count) * 100),
        amount: data.amount
      }))
      .filter(v => v.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }
}

export const fraudDetectionEngine = new FraudDetectionEngine();
