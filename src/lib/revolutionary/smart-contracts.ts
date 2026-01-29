/**
 * 📜 Smart Contracts - Blockchain Chartering Engine
 * PATCH REVOLUTION v2.0
 * 
 * Contratos inteligentes blockchain para chartering automático
 * Integrado com Supabase para persistência real
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SmartCharterContract {
  id: string;
  contractHash: string;
  ownerName: string;
  chartererName: string;
  vesselId: string;
  vesselName: string;
  charterType: 'time' | 'voyage' | 'bareboat' | 'coa';
  startDate: Date;
  endDate?: Date;
  rateValue: number;
  currency: string;
  conditions: ContractCondition[];
  status: ContractStatus;
  signedByOwner: boolean;
  signedByCharterer: boolean;
  totalPaid: number;
  totalDue: number;
  createdAt: Date;
}

export type ContractStatus = 
  | 'draft' | 'pending_signatures' | 'active' 
  | 'paused' | 'completed' | 'terminated' | 'disputed';

export interface ContractCondition {
  id: string;
  type: ConditionType;
  description: string;
  triggerEvent: string;
  action: string;
  isActive: boolean;
}

export type ConditionType = 
  | 'payment_due' | 'delivery_confirmation' | 'performance_bonus'
  | 'delay_penalty' | 'fuel_adjustment' | 'weather_clause';

export interface PaymentSchedule {
  id: string;
  contractId: string;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
}

// Type for database row - allows nullable fields from DB
interface SmartContractRow {
  id: string;
  contract_hash: string;
  owner_name: string;
  charterer_name: string;
  vessel_id: string | null;
  vessel_name: string;
  charter_type: string;
  start_date: string;
  end_date: string | null;
  rate_value: number;
  currency: string | null;
  conditions: unknown;
  status: string;
  signed_by_owner: boolean | null;
  signed_by_charterer: boolean | null;
  total_paid: number | null;
  total_due: number | null;
  created_at: string | null;
}

function mapRowToContract(row: SmartContractRow): SmartCharterContract {
  const conditions = Array.isArray(row.conditions) ? row.conditions as ContractCondition[] : [];
  return {
    id: row.id,
    contractHash: row.contract_hash,
    ownerName: row.owner_name,
    chartererName: row.charterer_name,
    vesselId: row.vessel_id || '',
    vesselName: row.vessel_name,
    charterType: row.charter_type as SmartCharterContract['charterType'],
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    rateValue: row.rate_value,
    currency: row.currency || 'USD',
    conditions,
    status: row.status as ContractStatus,
    signedByOwner: row.signed_by_owner ?? false,
    signedByCharterer: row.signed_by_charterer ?? false,
    totalPaid: row.total_paid ?? 0,
    totalDue: row.total_due ?? 0,
    createdAt: new Date(row.created_at || Date.now()),
  };
}


class SmartContractsEngine {
  // Get all contracts from database
  async getContracts(): Promise<SmartCharterContract[]> {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch contracts', { error });
        return [];
      }

      return (data || []).map(mapRowToContract);
    } catch (error) {
      logger.error('Error fetching contracts', { error });
      return [];
    }
  }

  // Get contract by ID
  async getContractById(contractId: string): Promise<SmartCharterContract | null> {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('id', contractId)
        .maybeSingle();

      if (error || !data) return null;
      return mapRowToContract(data);
    } catch (error) {
      logger.error('Error fetching contract', { error, contractId });
      return null;
    }
  }

  // Get contracts by status
  async getContractsByStatus(status: ContractStatus): Promise<SmartCharterContract[]> {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(mapRowToContract);
    } catch (error) {
      logger.error('Error fetching contracts by status', { error, status });
      return [];
    }
  }

  // Get active contracts
  async getActiveContracts(): Promise<SmartCharterContract[]> {
    return this.getContractsByStatus('active');
  }

  // Create new contract (draft)
  async createContract(data: Partial<SmartCharterContract>): Promise<SmartCharterContract> {
    const contractHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Cast conditions to JSON-compatible format
    const conditionsJson = (data.conditions || []).map(c => ({
      id: c.id,
      type: c.type,
      description: c.description,
      triggerEvent: c.triggerEvent,
      action: c.action,
      isActive: c.isActive,
    }));
    
    const { data: created, error } = await supabase
      .from('smart_contracts')
      .insert([{
        contract_hash: contractHash,
        owner_name: data.ownerName || '',
        charterer_name: data.chartererName || '',
        vessel_id: data.vesselId || null,
        vessel_name: data.vesselName || '',
        charter_type: data.charterType || 'time',
        start_date: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
        rate_value: data.rateValue || 0,
        currency: data.currency || 'USD',
        conditions: conditionsJson as unknown as undefined,
        status: 'draft',
        signed_by_owner: false,
        signed_by_charterer: false,
        total_paid: 0,
        total_due: data.rateValue || 0,
      }])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create contract', { error });
      throw new Error('Failed to create contract');
    }

    logger.info('Smart contract created', { id: created.id });
    return mapRowToContract(created);
  }

  // Sign contract
  async signContract(contractId: string, party: 'owner' | 'charterer'): Promise<SmartCharterContract> {
    const contract = await this.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    const updates: Record<string, unknown> = {};
    
    if (party === 'owner') {
      updates.signed_by_owner = true;
    } else {
      updates.signed_by_charterer = true;
    }

    // Check if both parties have signed
    const willBeSigned = party === 'owner' 
      ? (true && contract.signedByCharterer)
      : (contract.signedByOwner && true);
    
    if (willBeSigned) {
      updates.status = 'active';
    } else if (!contract.signedByOwner && !contract.signedByCharterer) {
      updates.status = 'pending_signatures';
    }

    const { data, error } = await supabase
      .from('smart_contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to sign contract', { error });
      throw new Error('Failed to sign contract');
    }

    logger.info('Contract signed', { contractId, party });
    return mapRowToContract(data);
  }

  // Execute payment
  async executePayment(contractId: string, amount: number): Promise<{ success: boolean; transactionHash: string }> {
    const contract = await this.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    const newTotalPaid = contract.totalPaid + amount;
    const newTotalDue = Math.max(0, contract.totalDue - amount);

    const { error } = await supabase
      .from('smart_contracts')
      .update({
        total_paid: newTotalPaid,
        total_due: newTotalDue,
      })
      .eq('id', contractId);

    if (error) {
      logger.error('Failed to execute payment', { error });
      throw new Error('Failed to execute payment');
    }

    const transactionHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;
    logger.info('Payment executed', { contractId, amount, transactionHash });

    return { success: true, transactionHash };
  }

  // Get contract statistics
  async getContractStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    completed: number;
    totalValue: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('status, rate_value');

      if (error) {
        return { total: 0, active: 0, pending: 0, completed: 0, totalValue: 0 };
      }

      const contracts = data || [];
      return {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'active').length,
        pending: contracts.filter(c => c.status === 'pending_signatures').length,
        completed: contracts.filter(c => c.status === 'completed').length,
        totalValue: contracts.reduce((sum, c) => sum + (c.rate_value || 0), 0),
      };
    } catch (error) {
      logger.error('Error fetching contract stats', { error });
      return { total: 0, active: 0, pending: 0, completed: 0, totalValue: 0 };
    }
  }

  // Generate contract hash
  generateContractHash(data: Record<string, unknown>): string {
    return `0x${JSON.stringify(data).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(16)}`;
  }
}

export const smartContractsEngine = new SmartContractsEngine();
