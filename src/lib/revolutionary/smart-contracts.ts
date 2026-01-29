/**
 * 📜 Smart Contracts - Blockchain Chartering Engine
 * PATCH REVOLUTION v2.0
 * 
 * Contratos inteligentes blockchain para chartering automático
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SmartCharterContract {
  id: string;
  contractHash: string;
  
  // Parties
  ownerId: string;
  ownerName: string;
  chartererId: string;
  chartererName: string;
  
  // Vessel
  vesselId: string;
  vesselName: string;
  vesselType: string;
  vesselDWT: number;
  
  // Terms
  charterType: 'time' | 'voyage' | 'bareboat' | 'coa';
  startDate: Date;
  endDate?: Date;
  
  // Financial
  rateType: 'daily' | 'lumpsum' | 'per_ton';
  rateValue: number;
  currency: string;
  paymentTerms: string;
  
  // Conditions
  conditions: ContractCondition[];
  
  // Status
  status: ContractStatus;
  signedByOwner: boolean;
  signedByCharterer: boolean;
  deployedAt?: Date;
  
  // Execution
  executionLog: ContractExecution[];
  totalPaid: number;
  totalDue: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type ContractStatus = 
  | 'draft'
  | 'pending_signatures'
  | 'active'
  | 'paused'
  | 'completed'
  | 'terminated'
  | 'disputed';

export interface ContractCondition {
  id: string;
  type: ConditionType;
  description: string;
  triggerEvent: string;
  action: string;
  parameters: Record<string, unknown>;
  isActive: boolean;
  lastTriggered?: Date;
}

export type ConditionType = 
  | 'payment_due'
  | 'delivery_confirmation'
  | 'performance_bonus'
  | 'delay_penalty'
  | 'fuel_adjustment'
  | 'weather_clause'
  | 'port_congestion'
  | 'off_hire'
  | 'cargo_damage'
  | 'early_termination';

export interface ContractExecution {
  id: string;
  timestamp: Date;
  conditionId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  actionTaken: string;
  transactionHash?: string;
  amount?: number;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface PaymentSchedule {
  id: string;
  contractId: string;
  dueDate: Date;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'disputed';
  paidAt?: Date;
  transactionHash?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  charterType: SmartCharterContract['charterType'];
  description: string;
  defaultConditions: ContractCondition[];
  clauses: string[];
  isStandard: boolean;
}

// Standard contract templates
const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'time-charter-standard',
    name: 'Time Charter (NYPE 2015)',
    charterType: 'time',
    description: 'Contrato padrão NYPE 2015 para time charter',
    defaultConditions: [
      {
        id: 'auto-hire',
        type: 'payment_due',
        description: 'Pagamento automático de hire',
        triggerEvent: 'hire_period_start',
        action: 'process_payment',
        parameters: { frequency: 'monthly', advance: true },
        isActive: true,
      },
      {
        id: 'off-hire',
        type: 'off_hire',
        description: 'Dedução automática por off-hire',
        triggerEvent: 'vessel_off_hire',
        action: 'calculate_deduction',
        parameters: { minHours: 24 },
        isActive: true,
      },
      {
        id: 'fuel-adjustment',
        type: 'fuel_adjustment',
        description: 'Ajuste de bunker na entrega/redelivery',
        triggerEvent: 'vessel_delivery|vessel_redelivery',
        action: 'calculate_bunker_adjustment',
        parameters: { priceIndex: 'singapore_vlsfo' },
        isActive: true,
      },
    ],
    clauses: [
      'Delivery/Redelivery',
      'Description of Vessel',
      'Owners to Provide',
      'Charterers to Provide',
      'Rate of Hire',
      'Payment of Hire',
      'Off-Hire',
      'Speed and Consumption',
      'Bunkers on Delivery/Redelivery',
    ],
    isStandard: true,
  },
  {
    id: 'voyage-charter-standard',
    name: 'Voyage Charter (GENCON 2022)',
    charterType: 'voyage',
    description: 'Contrato padrão GENCON para voyage charter',
    defaultConditions: [
      {
        id: 'freight-payment',
        type: 'payment_due',
        description: 'Pagamento de frete após carregamento',
        triggerEvent: 'cargo_loaded',
        action: 'process_payment',
        parameters: { percentage: 95, holdback: 5 },
        isActive: true,
      },
      {
        id: 'demurrage',
        type: 'delay_penalty',
        description: 'Cálculo automático de demurrage',
        triggerEvent: 'laytime_exceeded',
        action: 'calculate_demurrage',
        parameters: { rate: 'per_day' },
        isActive: true,
      },
      {
        id: 'despatch',
        type: 'performance_bonus',
        description: 'Cálculo de despatch por economia de tempo',
        triggerEvent: 'laytime_saved',
        action: 'calculate_despatch',
        parameters: { rate: 'half_demurrage' },
        isActive: true,
      },
    ],
    clauses: [
      'Shipment',
      'Loading/Discharging',
      'Freight',
      'Laytime',
      'Demurrage/Despatch',
      'Lien',
      'General Average',
    ],
    isStandard: true,
  },
  {
    id: 'coa-standard',
    name: 'Contract of Affreightment',
    charterType: 'coa',
    description: 'Contrato de afretamento por viagens múltiplas',
    defaultConditions: [
      {
        id: 'voyage-nomination',
        type: 'delivery_confirmation',
        description: 'Confirmação de nomeação de viagem',
        triggerEvent: 'voyage_nominated',
        action: 'confirm_nomination',
        parameters: { responseTime: 48 },
        isActive: true,
      },
      {
        id: 'quantity-tolerance',
        type: 'cargo_damage',
        description: 'Tolerância de quantidade de carga',
        triggerEvent: 'cargo_quantity_verified',
        action: 'verify_tolerance',
        parameters: { tolerance: 5 },
        isActive: true,
      },
    ],
    clauses: [
      'Cargo Description',
      'Quantity',
      'Loading Ports',
      'Discharging Ports',
      'Laycan Spread',
      'Rate Schedule',
    ],
    isStandard: true,
  },
];

class SmartContractsEngine {
  
  // Get available templates
  getTemplates(): ContractTemplate[] {
    return CONTRACT_TEMPLATES;
  }

  // Create new smart contract
  async createContract(
    templateId: string,
    params: {
      ownerId: string;
      ownerName: string;
      chartererId: string;
      chartererName: string;
      vesselId: string;
      vesselName: string;
      vesselType: string;
      vesselDWT: number;
      startDate: Date;
      endDate?: Date;
      rateType: SmartCharterContract['rateType'];
      rateValue: number;
      currency: string;
      paymentTerms: string;
      customConditions?: ContractCondition[];
    }
  ): Promise<SmartCharterContract> {
    const template = CONTRACT_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const contractId = crypto.randomUUID();
    const contractHash = await this.generateContractHash(contractId, params);

    const contract: SmartCharterContract = {
      id: contractId,
      contractHash,
      ...params,
      charterType: template.charterType,
      conditions: params.customConditions || template.defaultConditions,
      status: 'draft',
      signedByOwner: false,
      signedByCharterer: false,
      executionLog: [],
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store contract
    await this.storeContract(contract);

    logger.info('Smart contract created', { contractId, templateId });

    return contract;
  }

  // Generate contract hash for integrity verification
  private async generateContractHash(
    contractId: string,
    params: Record<string, unknown>
  ): Promise<string> {
    const data = JSON.stringify({ contractId, ...params, timestamp: Date.now() });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Store contract in database
  private async storeContract(contract: SmartCharterContract): Promise<void> {
    try {
      await supabase.from('smart_contracts').insert({
        id: contract.id,
        contract_hash: contract.contractHash,
        owner_id: contract.ownerId,
        owner_name: contract.ownerName,
        charterer_id: contract.chartererId,
        charterer_name: contract.chartererName,
        vessel_id: contract.vesselId,
        vessel_name: contract.vesselName,
        vessel_type: contract.vesselType,
        vessel_dwt: contract.vesselDWT,
        charter_type: contract.charterType,
        start_date: contract.startDate.toISOString(),
        end_date: contract.endDate?.toISOString(),
        rate_type: contract.rateType,
        rate_value: contract.rateValue,
        currency: contract.currency,
        payment_terms: contract.paymentTerms,
        conditions: contract.conditions,
        status: contract.status,
        signed_by_owner: contract.signedByOwner,
        signed_by_charterer: contract.signedByCharterer,
        execution_log: contract.executionLog,
        total_paid: contract.totalPaid,
        total_due: contract.totalDue,
        created_at: contract.createdAt.toISOString(),
        updated_at: contract.updatedAt.toISOString(),
      });
    } catch (error) {
      logger.error('Failed to store contract', error as Error);
      throw error;
    }
  }

  // Sign contract
  async signContract(
    contractId: string,
    signerRole: 'owner' | 'charterer',
    signerName: string,
    signatureData: string // Could be actual digital signature
  ): Promise<SmartCharterContract> {
    const { data: contract } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (!contract) {
      throw new Error('Contract not found');
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (signerRole === 'owner') {
      updates.signed_by_owner = true;
    } else {
      updates.signed_by_charterer = true;
    }

    // Check if both parties have signed
    const bothSigned = (signerRole === 'owner' && contract.signed_by_charterer) ||
                       (signerRole === 'charterer' && contract.signed_by_owner);

    if (bothSigned) {
      updates.status = 'active';
      updates.deployed_at = new Date().toISOString();
    } else {
      updates.status = 'pending_signatures';
    }

    // Log signature
    const execution: ContractExecution = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      conditionId: 'signature',
      eventType: `${signerRole}_signed`,
      eventData: { signerName, signatureData: signatureData.substring(0, 32) + '...' },
      actionTaken: 'contract_signed',
      status: 'success',
    };

    updates.execution_log = [...(contract.execution_log || []), execution];

    await supabase
      .from('smart_contracts')
      .update(updates)
      .eq('id', contractId);

    logger.info('Contract signed', { contractId, signerRole });

    return this.getContract(contractId) as unknown as Promise<SmartCharterContract>;
  }

  // Get contract by ID
  async getContract(contractId: string): Promise<SmartCharterContract | null> {
    const { data } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('id', contractId)
      .maybeSingle();

    if (!data) return null;

    return this.mapContractFromDB(data);
  }

  // Map database record to contract type
  private mapContractFromDB(data: Record<string, unknown>): SmartCharterContract {
    return {
      id: data.id as string,
      contractHash: data.contract_hash as string,
      ownerId: data.owner_id as string,
      ownerName: data.owner_name as string,
      chartererId: data.charterer_id as string,
      chartererName: data.charterer_name as string,
      vesselId: data.vessel_id as string,
      vesselName: data.vessel_name as string,
      vesselType: data.vessel_type as string,
      vesselDWT: data.vessel_dwt as number,
      charterType: data.charter_type as SmartCharterContract['charterType'],
      startDate: new Date(data.start_date as string),
      endDate: data.end_date ? new Date(data.end_date as string) : undefined,
      rateType: data.rate_type as SmartCharterContract['rateType'],
      rateValue: data.rate_value as number,
      currency: data.currency as string,
      paymentTerms: data.payment_terms as string,
      conditions: data.conditions as ContractCondition[],
      status: data.status as ContractStatus,
      signedByOwner: data.signed_by_owner as boolean,
      signedByCharterer: data.signed_by_charterer as boolean,
      deployedAt: data.deployed_at ? new Date(data.deployed_at as string) : undefined,
      executionLog: data.execution_log as ContractExecution[],
      totalPaid: data.total_paid as number,
      totalDue: data.total_due as number,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  // Process automatic payment
  async processPayment(
    contractId: string,
    amount: number,
    description: string
  ): Promise<ContractExecution> {
    const contract = await this.getContract(contractId);
    if (!contract || contract.status !== 'active') {
      throw new Error('Contract not active');
    }

    // In production, this would integrate with payment gateway or blockchain
    const transactionHash = await this.generateContractHash(contractId, { amount, description, timestamp: Date.now() });

    const execution: ContractExecution = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      conditionId: 'payment',
      eventType: 'payment_processed',
      eventData: { amount, description },
      actionTaken: 'payment_transferred',
      transactionHash,
      amount,
      status: 'success',
    };

    // Update contract
    await supabase
      .from('smart_contracts')
      .update({
        total_paid: contract.totalPaid + amount,
        execution_log: [...contract.executionLog, execution],
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId);

    logger.info('Payment processed', { contractId, amount, transactionHash });

    return execution;
  }

  // Execute contract condition
  async executeCondition(
    contractId: string,
    conditionId: string,
    eventData: Record<string, unknown>
  ): Promise<ContractExecution> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const condition = contract.conditions.find(c => c.id === conditionId);
    if (!condition || !condition.isActive) {
      throw new Error('Condition not found or inactive');
    }

    let actionResult: { success: boolean; action: string; amount?: number; error?: string };

    // Execute based on condition type
    switch (condition.type) {
      case 'payment_due':
        actionResult = await this.handlePaymentDue(contract, condition, eventData);
        break;
      case 'delay_penalty':
        actionResult = await this.handleDelayPenalty(contract, condition, eventData);
        break;
      case 'performance_bonus':
        actionResult = await this.handlePerformanceBonus(contract, condition, eventData);
        break;
      case 'off_hire':
        actionResult = await this.handleOffHire(contract, condition, eventData);
        break;
      default:
        actionResult = { success: true, action: 'condition_logged' };
    }

    const execution: ContractExecution = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      conditionId,
      eventType: condition.triggerEvent,
      eventData,
      actionTaken: actionResult.action,
      amount: actionResult.amount,
      status: actionResult.success ? 'success' : 'failed',
      errorMessage: actionResult.error,
    };

    // Update contract
    const updatedConditions = contract.conditions.map(c =>
      c.id === conditionId ? { ...c, lastTriggered: new Date() } : c
    );

    await supabase
      .from('smart_contracts')
      .update({
        conditions: updatedConditions,
        execution_log: [...contract.executionLog, execution],
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId);

    return execution;
  }

  // Handle payment due condition
  private async handlePaymentDue(
    contract: SmartCharterContract,
    condition: ContractCondition,
    eventData: Record<string, unknown>
  ): Promise<{ success: boolean; action: string; amount?: number }> {
    const amount = (eventData.amount as number) || contract.rateValue;
    
    // In production, initiate actual payment
    return {
      success: true,
      action: 'payment_initiated',
      amount,
    };
  }

  // Handle delay penalty (demurrage)
  private async handleDelayPenalty(
    contract: SmartCharterContract,
    condition: ContractCondition,
    eventData: Record<string, unknown>
  ): Promise<{ success: boolean; action: string; amount?: number }> {
    const hoursDelayed = (eventData.hoursDelayed as number) || 0;
    const dailyRate = (condition.parameters.rate as number) || contract.rateValue * 0.1;
    const amount = (hoursDelayed / 24) * dailyRate;

    return {
      success: true,
      action: 'demurrage_calculated',
      amount: Math.round(amount * 100) / 100,
    };
  }

  // Handle performance bonus (despatch)
  private async handlePerformanceBonus(
    contract: SmartCharterContract,
    condition: ContractCondition,
    eventData: Record<string, unknown>
  ): Promise<{ success: boolean; action: string; amount?: number }> {
    const hoursSaved = (eventData.hoursSaved as number) || 0;
    const dailyRate = (condition.parameters.rate as number) || contract.rateValue * 0.05;
    const amount = (hoursSaved / 24) * dailyRate;

    return {
      success: true,
      action: 'despatch_calculated',
      amount: Math.round(amount * 100) / 100,
    };
  }

  // Handle off-hire
  private async handleOffHire(
    contract: SmartCharterContract,
    condition: ContractCondition,
    eventData: Record<string, unknown>
  ): Promise<{ success: boolean; action: string; amount?: number }> {
    const offHireHours = (eventData.hours as number) || 0;
    const minHours = (condition.parameters.minHours as number) || 24;

    if (offHireHours < minHours) {
      return { success: true, action: 'off_hire_below_threshold' };
    }

    const dailyRate = contract.rateValue;
    const deduction = (offHireHours / 24) * dailyRate;

    return {
      success: true,
      action: 'off_hire_deduction_applied',
      amount: Math.round(deduction * 100) / 100,
    };
  }

  // Get contracts for organization
  async getContractsForOrganization(
    organizationId: string,
    role: 'owner' | 'charterer' | 'all' = 'all'
  ): Promise<SmartCharterContract[]> {
    let query = supabase.from('smart_contracts').select('*');

    if (role === 'owner') {
      query = query.eq('owner_id', organizationId);
    } else if (role === 'charterer') {
      query = query.eq('charterer_id', organizationId);
    } else {
      query = query.or(`owner_id.eq.${organizationId},charterer_id.eq.${organizationId}`);
    }

    const { data } = await query.order('created_at', { ascending: false });

    return (data || []).map(this.mapContractFromDB);
  }

  // Generate payment schedule for contract
  generatePaymentSchedule(contract: SmartCharterContract): PaymentSchedule[] {
    const schedules: PaymentSchedule[] = [];

    if (contract.charterType === 'time' && contract.endDate) {
      // Generate monthly payments for time charter
      let currentDate = new Date(contract.startDate);
      let sequence = 1;

      while (currentDate < contract.endDate) {
        schedules.push({
          id: `${contract.id}-${sequence}`,
          contractId: contract.id,
          dueDate: new Date(currentDate),
          amount: contract.rateValue * 30, // Monthly
          currency: contract.currency,
          description: `Hire Payment ${sequence}`,
          status: 'pending',
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
        sequence++;
      }
    } else if (contract.charterType === 'voyage') {
      // Single freight payment for voyage
      schedules.push({
        id: `${contract.id}-freight`,
        contractId: contract.id,
        dueDate: contract.startDate, // On loading
        amount: contract.rateValue,
        currency: contract.currency,
        description: 'Freight Payment',
        status: 'pending',
      });
    }

    return schedules;
  }

  // Verify contract integrity
  async verifyContractIntegrity(contractId: string): Promise<{
    isValid: boolean;
    originalHash: string;
    currentHash: string;
    discrepancies: string[];
  }> {
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const currentHash = await this.generateContractHash(contractId, {
      ownerId: contract.ownerId,
      chartererId: contract.chartererId,
      vesselId: contract.vesselId,
      startDate: contract.startDate,
      rateValue: contract.rateValue,
    });

    const discrepancies: string[] = [];
    
    // In production, would verify against blockchain
    // For now, compare hashes
    const isValid = contract.contractHash.substring(0, 16) === currentHash.substring(0, 16);

    if (!isValid) {
      discrepancies.push('Hash mismatch detected - contract may have been tampered');
    }

    return {
      isValid,
      originalHash: contract.contractHash,
      currentHash,
      discrepancies,
    };
  }
}

export const smartContractsEngine = new SmartContractsEngine();
