/**
 * 📜 CONTRACT & LEGAL - Types & Logic
 */

export interface Contract {
  id: string;
  title: string;
  type: 'charter' | 'service' | 'purchase' | 'employment' | 'insurance';
  parties: string[];
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  obligations: Obligation[];
  renewalDate?: Date;
}

export interface Obligation {
  id: string;
  description: string;
  dueDate: Date;
  responsible: string;
  status: 'pending' | 'completed' | 'overdue';
}

export class ContractLegalEngine {
  private static instance: ContractLegalEngine;
  static getInstance() { return this.instance || (this.instance = new ContractLegalEngine()); }

  createContract(params: Omit<Contract, 'id' | 'status' | 'obligations'>): Contract {
    return { ...params, id: crypto.randomUUID(), status: 'draft', obligations: [] };
  }

  getExpiringContracts(contracts: Contract[], days: number): Contract[] {
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return contracts.filter(c => c.status === 'active' && c.endDate < threshold);
  }
}

export const contractLegal = ContractLegalEngine.getInstance();
