/**
 * Exportação contábil da folha de pagamento
 * Formatos: Excel, CSV, SEFIP/eSocial
 */

import * as XLSX from 'xlsx';
import { PayrollCalculation, PayrollSummary } from '@/hooks/usePayroll';

export interface AccountingEntry {
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  history: string;
  costCenter?: string;
}

// Plano de contas padrão para folha
const CHART_OF_ACCOUNTS = {
  SALARIES_EXPENSE: { code: '4.1.1.01', name: 'Salários e Ordenados' },
  OVERTIME_EXPENSE: { code: '4.1.1.02', name: 'Horas Extras' },
  NIGHT_SHIFT_EXPENSE: { code: '4.1.1.03', name: 'Adicional Noturno' },
  INSS_EXPENSE: { code: '4.1.2.01', name: 'INSS Patronal' },
  FGTS_EXPENSE: { code: '4.1.2.02', name: 'FGTS' },
  SALARIES_PAYABLE: { code: '2.1.1.01', name: 'Salários a Pagar' },
  INSS_PAYABLE: { code: '2.1.2.01', name: 'INSS a Recolher' },
  IRRF_PAYABLE: { code: '2.1.2.02', name: 'IRRF a Recolher' },
  FGTS_PAYABLE: { code: '2.1.2.03', name: 'FGTS a Depositar' },
};

// Gerar lançamentos contábeis
export function generateAccountingEntries(
  calculations: PayrollCalculation[],
  summary: PayrollSummary,
  referenceMonth: string
): AccountingEntry[] {
  const entries: AccountingEntry[] = [];
  const history = `Folha de pagamento ref. ${referenceMonth}`;

  // Débito - Despesas com pessoal
  if (summary.totalGross > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.SALARIES_EXPENSE.code,
      accountName: CHART_OF_ACCOUNTS.SALARIES_EXPENSE.name,
      debit: summary.totalGross,
      credit: 0,
      history,
    });
  }

  // Débito - INSS Patronal (20% + RAT)
  const employerINSS = calculations.reduce((acc, c) => acc + c.employer_inss, 0);
  if (employerINSS > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.INSS_EXPENSE.code,
      accountName: CHART_OF_ACCOUNTS.INSS_EXPENSE.name,
      debit: employerINSS,
      credit: 0,
      history,
    });
  }

  // Débito - FGTS
  if (summary.totalFGTS > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.FGTS_EXPENSE.code,
      accountName: CHART_OF_ACCOUNTS.FGTS_EXPENSE.name,
      debit: summary.totalFGTS,
      credit: 0,
      history,
    });
  }

  // Crédito - Salários a pagar
  if (summary.totalNet > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.SALARIES_PAYABLE.code,
      accountName: CHART_OF_ACCOUNTS.SALARIES_PAYABLE.name,
      debit: 0,
      credit: summary.totalNet,
      history,
    });
  }

  // Crédito - INSS a recolher (funcionário + empregador)
  const totalINSSPayable = summary.totalINSS + employerINSS;
  if (totalINSSPayable > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.INSS_PAYABLE.code,
      accountName: CHART_OF_ACCOUNTS.INSS_PAYABLE.name,
      debit: 0,
      credit: totalINSSPayable,
      history,
    });
  }

  // Crédito - IRRF a recolher
  if (summary.totalIRRF > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.IRRF_PAYABLE.code,
      accountName: CHART_OF_ACCOUNTS.IRRF_PAYABLE.name,
      debit: 0,
      credit: summary.totalIRRF,
      history,
    });
  }

  // Crédito - FGTS a depositar
  if (summary.totalFGTS > 0) {
    entries.push({
      account: CHART_OF_ACCOUNTS.FGTS_PAYABLE.code,
      accountName: CHART_OF_ACCOUNTS.FGTS_PAYABLE.name,
      debit: 0,
      credit: summary.totalFGTS,
      history,
    });
  }

  return entries;
}

// Exportar para Excel
export function exportPayrollToExcel(
  calculations: PayrollCalculation[],
  summary: PayrollSummary,
  referenceMonth: string
): void {
  const wb = XLSX.utils.book_new();

  // Aba 1: Resumo da Folha
  const summaryData = [
    ['RESUMO DA FOLHA DE PAGAMENTO'],
    ['Competência:', referenceMonth],
    [''],
    ['Total Funcionários:', summary.employeeCount],
    ['Total Bruto:', summary.totalGross],
    ['Total Líquido:', summary.totalNet],
    ['Total INSS:', summary.totalINSS],
    ['Total IRRF:', summary.totalIRRF],
    ['Total FGTS:', summary.totalFGTS],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Aba 2: Detalhamento por funcionário
  const detailHeaders = [
    'Nome',
    'Salário Base',
    'Horas Extras',
    'Valor HE',
    'Adicional Noturno',
    'Salário Bruto',
    'INSS',
    'IRRF',
    'VT',
    'Outros Descontos',
    'Total Descontos',
    'Salário Líquido',
    'FGTS',
  ];
  const detailData = calculations.map((c) => [
    c.employee_name,
    c.base_salary,
    c.overtime_hours,
    c.overtime_value,
    c.night_shift_value,
    c.gross_salary,
    c.inss_value,
    c.irrf_value,
    c.transport_voucher,
    c.other_deductions,
    c.total_deductions,
    c.net_salary,
    c.fgts_value,
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalhamento');

  // Aba 3: Lançamentos Contábeis
  const accountingEntries = generateAccountingEntries(calculations, summary, referenceMonth);
  const accountingHeaders = ['Conta', 'Descrição', 'Débito', 'Crédito', 'Histórico'];
  const accountingData = accountingEntries.map((e) => [
    e.account,
    e.accountName,
    e.debit > 0 ? e.debit : '',
    e.credit > 0 ? e.credit : '',
    e.history,
  ]);
  const wsAccounting = XLSX.utils.aoa_to_sheet([accountingHeaders, ...accountingData]);
  XLSX.utils.book_append_sheet(wb, wsAccounting, 'Contabilidade');

  // Aba 4: SEFIP/GFIP
  const sefipHeaders = ['CPF', 'Nome', 'Categoria', 'Remuneração', 'Base FGTS', 'FGTS', 'Base 13º'];
  const sefipData = calculations.map((c) => [
    '', // CPF seria preenchido
    c.employee_name,
    '01', // Categoria trabalhador
    c.gross_salary,
    c.gross_salary,
    c.fgts_value,
    0, // 13º proporcional
  ]);
  const wsSefip = XLSX.utils.aoa_to_sheet([sefipHeaders, ...sefipData]);
  XLSX.utils.book_append_sheet(wb, wsSefip, 'SEFIP');

  // Salvar arquivo
  XLSX.writeFile(wb, `folha_pagamento_${referenceMonth}.xlsx`);
}

// Exportar para CSV (formato simplificado)
export function exportPayrollToCSV(
  calculations: PayrollCalculation[],
  referenceMonth: string
): void {
  const headers = [
    'Nome',
    'Salário Base',
    'Salário Bruto',
    'INSS',
    'IRRF',
    'Total Descontos',
    'Salário Líquido',
    'FGTS',
  ];

  const rows = calculations.map((c) => [
    c.employee_name,
    c.base_salary.toFixed(2),
    c.gross_salary.toFixed(2),
    c.inss_value.toFixed(2),
    c.irrf_value.toFixed(2),
    c.total_deductions.toFixed(2),
    c.net_salary.toFixed(2),
    c.fgts_value.toFixed(2),
  ]);

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `folha_${referenceMonth}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Gerar arquivo para eSocial (formato XML simplificado)
export function generateESocialXML(
  calculations: PayrollCalculation[],
  referenceMonth: string,
  companyData: { cnpj: string; razaoSocial: string }
): string {
  const [year, month] = referenceMonth.split('-');
  
  const workersXML = calculations.map((c) => `
    <trabalhador>
      <cpfTrab></cpfTrab>
      <nmTrab>${c.employee_name}</nmTrab>
      <dtNascto></dtNascto>
      <remun>
        <vrSalFx>${c.base_salary.toFixed(2)}</vrSalFx>
        <vrRubr>${c.gross_salary.toFixed(2)}</vrRubr>
      </remun>
      <infoInterm>
        <qtdDiasTrab>${c.worked_days}</qtdDiasTrab>
      </infoInterm>
    </trabalhador>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
  <evtRemun>
    <ideEvento>
      <indRetif>1</indRetif>
      <perApur>${year}-${month}</perApur>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${companyData.cnpj.replace(/\D/g, '')}</nrInsc>
    </ideEmpregador>
    <dmDev>
      <ideDmDev>1</ideDmDev>
      ${workersXML}
    </dmDev>
  </evtRemun>
</eSocial>`;
}
