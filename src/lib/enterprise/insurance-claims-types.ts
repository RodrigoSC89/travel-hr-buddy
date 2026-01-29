/**
 * 🏥 INSURANCE & CLAIMS - Types & Logic
 */

export interface InsurancePolicy {
  id: string;
  type: 'hull' | 'pi' | 'cargo' | 'crew';
  insurer: string;
  policyNumber: string;
  coverage: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  vesselId?: string;
}

export interface Claim {
  id: string;
  policyId: string;
  type: string;
  description: string;
  amount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  submittedDate: Date;
  documents: string[];
}

export class InsuranceClaimsEngine {
  private static instance: InsuranceClaimsEngine;
  static getInstance() { return this.instance || (this.instance = new InsuranceClaimsEngine()); }

  submitClaim(params: Omit<Claim, 'id' | 'status' | 'submittedDate'>): Claim {
    return { ...params, id: crypto.randomUUID(), status: 'submitted', submittedDate: new Date() };
  }

  getExpiringPolicies(policies: InsurancePolicy[], days: number): InsurancePolicy[] {
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return policies.filter(p => p.endDate < threshold);
  }
}

export const insuranceClaims = InsuranceClaimsEngine.getInstance();
