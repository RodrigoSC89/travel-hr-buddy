/**
 * 👥 CREWING & PAYROLL - Types & Logic
 */

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  vesselId?: string;
  contractStart: Date;
  contractEnd: Date;
  salary: { base: number; currency: string };
  certificates: Certificate[];
}

export interface Certificate {
  type: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
}

export interface PayrollRecord {
  id: string;
  crewMemberId: string;
  period: { start: Date; end: Date };
  baseSalary: number;
  overtime: number;
  allowances: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid';
}

export class CrewingPayrollEngine {
  private static instance: CrewingPayrollEngine;
  static getInstance() { return this.instance || (this.instance = new CrewingPayrollEngine()); }

  calculatePayroll(crew: CrewMember, overtimeHours: number, allowances: number, deductions: number): PayrollRecord {
    const overtime = overtimeHours * (crew.salary.base / 160) * 1.5;
    const netPay = crew.salary.base + overtime + allowances - deductions;
    return {
      id: crypto.randomUUID(),
      crewMemberId: crew.id,
      period: { start: new Date(), end: new Date() },
      baseSalary: crew.salary.base,
      overtime,
      allowances,
      deductions,
      netPay,
      currency: crew.salary.currency,
      status: 'pending',
    };
  }

  getExpiringCertificates(crew: CrewMember[], days: number): { crew: CrewMember; certificate: Certificate }[] {
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const expiring: { crew: CrewMember; certificate: Certificate }[] = [];
    for (const c of crew) {
      for (const cert of c.certificates) {
        if (cert.expiryDate < threshold) expiring.push({ crew: c, certificate: cert });
      }
    }
    return expiring;
  }
}

export const crewingPayroll = CrewingPayrollEngine.getInstance();
