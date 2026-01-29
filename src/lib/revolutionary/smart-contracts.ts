/**
 * 📜 Smart Contracts - Blockchain Chartering Engine
 * PATCH REVOLUTION v2.0
 * 
 * Contratos inteligentes blockchain para chartering automático
 * Versão simplificada com dados simulados
 */

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

// Mock contracts
const MOCK_CONTRACTS: SmartCharterContract[] = [
  {
    id: 'sc-001',
    contractHash: '0x7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t',
    ownerName: 'Pacific Shipping Ltd',
    chartererName: 'Global Cargo Inc',
    vesselId: 'v-001',
    vesselName: 'MV Atlantic Star',
    charterType: 'time',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    rateValue: 35000,
    currency: 'USD',
    conditions: [
      { id: 'c-1', type: 'payment_due', description: 'Pagamento mensal', triggerEvent: 'monthly', action: 'auto_invoice', isActive: true },
      { id: 'c-2', type: 'performance_bonus', description: 'Bônus por eficiência', triggerEvent: 'fuel_savings > 10%', action: 'add_bonus', isActive: true },
    ],
    status: 'active',
    signedByOwner: true,
    signedByCharterer: true,
    totalPaid: 280000,
    totalDue: 35000,
    createdAt: new Date('2023-12-15'),
  },
  {
    id: 'sc-002',
    contractHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    ownerName: 'Atlantic Maritime Co',
    chartererName: 'Euro Bulk Transport',
    vesselId: 'v-002',
    vesselName: 'MV Pacific Wind',
    charterType: 'voyage',
    startDate: new Date('2024-06-01'),
    rateValue: 890000,
    currency: 'USD',
    conditions: [
      { id: 'c-3', type: 'delivery_confirmation', description: 'Confirmação de entrega', triggerEvent: 'arrival_at_port', action: 'release_payment', isActive: true },
      { id: 'c-4', type: 'delay_penalty', description: 'Penalidade por atraso', triggerEvent: 'delay > 48h', action: 'deduct_penalty', isActive: true },
    ],
    status: 'pending_signatures',
    signedByOwner: true,
    signedByCharterer: false,
    totalPaid: 0,
    totalDue: 890000,
    createdAt: new Date('2024-05-20'),
  },
  {
    id: 'sc-003',
    contractHash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
    ownerName: 'Nordic Vessel Group',
    chartererName: 'Asian Trade LLC',
    vesselId: 'v-003',
    vesselName: 'MV Northern Light',
    charterType: 'time',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-05-31'),
    rateValue: 42000,
    currency: 'USD',
    conditions: [],
    status: 'completed',
    signedByOwner: true,
    signedByCharterer: true,
    totalPaid: 504000,
    totalDue: 0,
    createdAt: new Date('2023-05-15'),
  },
];

class SmartContractsEngine {
  // Get all contracts
  async getContracts(): Promise<SmartCharterContract[]> {
    return MOCK_CONTRACTS;
  }

  // Get contract by ID
  async getContractById(contractId: string): Promise<SmartCharterContract | null> {
    return MOCK_CONTRACTS.find(c => c.id === contractId) || null;
  }

  // Get contracts by status
  async getContractsByStatus(status: ContractStatus): Promise<SmartCharterContract[]> {
    return MOCK_CONTRACTS.filter(c => c.status === status);
  }

  // Get active contracts
  async getActiveContracts(): Promise<SmartCharterContract[]> {
    return MOCK_CONTRACTS.filter(c => c.status === 'active');
  }

  // Create new contract (draft)
  async createContract(data: Partial<SmartCharterContract>): Promise<SmartCharterContract> {
    const newContract: SmartCharterContract = {
      id: `sc-${Date.now()}`,
      contractHash: `0x${Math.random().toString(16).slice(2)}`,
      ownerName: data.ownerName || '',
      chartererName: data.chartererName || '',
      vesselId: data.vesselId || '',
      vesselName: data.vesselName || '',
      charterType: data.charterType || 'time',
      startDate: data.startDate || new Date(),
      endDate: data.endDate,
      rateValue: data.rateValue || 0,
      currency: data.currency || 'USD',
      conditions: data.conditions || [],
      status: 'draft',
      signedByOwner: false,
      signedByCharterer: false,
      totalPaid: 0,
      totalDue: data.rateValue || 0,
      createdAt: new Date(),
    };

    MOCK_CONTRACTS.push(newContract);
    logger.info('Smart contract created', { id: newContract.id });
    return newContract;
  }

  // Sign contract
  async signContract(contractId: string, party: 'owner' | 'charterer'): Promise<SmartCharterContract> {
    const contract = MOCK_CONTRACTS.find(c => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    if (party === 'owner') {
      contract.signedByOwner = true;
    } else {
      contract.signedByCharterer = true;
    }

    if (contract.signedByOwner && contract.signedByCharterer) {
      contract.status = 'active';
    } else if (contract.signedByOwner || contract.signedByCharterer) {
      contract.status = 'pending_signatures';
    }

    logger.info('Contract signed', { contractId, party });
    return contract;
  }

  // Execute payment
  async executePayment(contractId: string, amount: number): Promise<{ success: boolean; transactionHash: string }> {
    const contract = MOCK_CONTRACTS.find(c => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    contract.totalPaid += amount;
    contract.totalDue = Math.max(0, contract.totalDue - amount);

    const transactionHash = `0x${Math.random().toString(16).slice(2)}`;
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
    return {
      total: MOCK_CONTRACTS.length,
      active: MOCK_CONTRACTS.filter(c => c.status === 'active').length,
      pending: MOCK_CONTRACTS.filter(c => c.status === 'pending_signatures').length,
      completed: MOCK_CONTRACTS.filter(c => c.status === 'completed').length,
      totalValue: MOCK_CONTRACTS.reduce((sum, c) => sum + c.rateValue, 0),
    };
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
