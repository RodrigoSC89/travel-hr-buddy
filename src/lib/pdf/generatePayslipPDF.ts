/**
 * Gerador de Holerite em PDF
 * Formato padrão brasileiro CLT
 */

import { createPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';

export interface PayslipData {
  // Empresa
  companyName: string;
  companyCNPJ: string;
  companyAddress?: string;
  
  // Funcionário
  employeeName: string;
  employeeCPF?: string;
  employeePosition: string;
  employeeDepartment: string;
  admissionDate: string;
  
  // Período
  referenceMonth: string;
  paymentDate: string;
  
  // Proventos
  baseSalary: number;
  overtimeHours: number;
  overtimeValue: number;
  nightShiftHours: number;
  nightShiftValue: number;
  hazardPay: number;
  unhealthyPay: number;
  bonus: number;
  commissions: number;
  otherEarnings: number;
  grossSalary: number;
  
  // Descontos
  inssValue: number;
  irrfValue: number;
  transportVoucher: number;
  mealVoucher: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Líquido
  netSalary: number;
  
  // FGTS
  fgtsValue: number;
  fgtsBase: number;
}

export async function generatePayslipPDF(data: PayslipData): Promise<void> {
  const [doc, autoTable] = await Promise.all([createPDF(), getAutoTable()]);
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Formatar moeda
  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Formatar mês de referência
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(monthNum) - 1]}/${year}`;
  };

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DEMONSTRATIVO DE PAGAMENTO', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Competência: ${formatMonth(data.referenceMonth)}`, pageWidth / 2, 28, { align: 'center' });

  // Dados da empresa
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPREGADOR', 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.companyName}`, 14, 46);
  doc.text(`CNPJ: ${data.companyCNPJ}`, 14, 52);
  if (data.companyAddress) {
    doc.text(data.companyAddress, 14, 58);
  }

  // Dados do funcionário
  doc.setFont('helvetica', 'bold');
  doc.text('EMPREGADO', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.employeeName}`, 14, 76);
  doc.text(`CPF: ${data.employeeCPF || 'N/A'}`, 14, 82);
  doc.text(`Cargo: ${data.employeePosition}`, 110, 76);
  doc.text(`Depto: ${data.employeeDepartment}`, 110, 82);
  doc.text(`Admissão: ${data.admissionDate}`, 110, 88);

  // Tabela de proventos e descontos
  const earnings: [string, string, string][] = [];
  const deductions: [string, string, string][] = [];

  // Proventos
  if (data.baseSalary > 0) {
    earnings.push(['Salário Base', '', formatCurrency(data.baseSalary)]);
  }
  if (data.overtimeValue > 0) {
    earnings.push([`Hora Extra (${data.overtimeHours}h)`, '50%', formatCurrency(data.overtimeValue)]);
  }
  if (data.nightShiftValue > 0) {
    earnings.push([`Adicional Noturno (${data.nightShiftHours}h)`, '20%', formatCurrency(data.nightShiftValue)]);
  }
  if (data.hazardPay > 0) {
    earnings.push(['Adicional de Periculosidade', '30%', formatCurrency(data.hazardPay)]);
  }
  if (data.unhealthyPay > 0) {
    earnings.push(['Adicional de Insalubridade', '', formatCurrency(data.unhealthyPay)]);
  }
  if (data.bonus > 0) {
    earnings.push(['Gratificação/Bônus', '', formatCurrency(data.bonus)]);
  }
  if (data.commissions > 0) {
    earnings.push(['Comissões', '', formatCurrency(data.commissions)]);
  }
  if (data.otherEarnings > 0) {
    earnings.push(['Outros Proventos', '', formatCurrency(data.otherEarnings)]);
  }

  // Descontos
  if (data.inssValue > 0) {
    deductions.push(['INSS', '', formatCurrency(data.inssValue)]);
  }
  if (data.irrfValue > 0) {
    deductions.push(['IRRF', '', formatCurrency(data.irrfValue)]);
  }
  if (data.transportVoucher > 0) {
    deductions.push(['Vale Transporte', '6%', formatCurrency(data.transportVoucher)]);
  }
  if (data.mealVoucher > 0) {
    deductions.push(['Vale Refeição', '', formatCurrency(data.mealVoucher)]);
  }
  if (data.otherDeductions > 0) {
    deductions.push(['Outros Descontos', '', formatCurrency(data.otherDeductions)]);
  }

  // Calcular posição Y para a tabela
  let currentY = 98;

  // Tabela de Proventos
  autoTable(doc, {
    startY: currentY,
    head: [['PROVENTOS', 'REF', 'VALOR']],
    body: earnings,
    foot: [['TOTAL PROVENTOS', '', formatCurrency(data.grossSalary)]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
    footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 85,
  });

  // Tabela de Descontos (ao lado dos proventos)
  autoTable(doc, {
    startY: currentY,
    head: [['DESCONTOS', 'REF', 'VALOR']],
    body: deductions,
    foot: [['TOTAL DESCONTOS', '', formatCurrency(data.totalDeductions)]],
    theme: 'grid',
    headStyles: { fillColor: [192, 57, 43], fontSize: 8 },
    footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 110, right: 14 },
    tableWidth: 85,
  });

  // Salário líquido
  const finalY = Math.max(
    (doc as any).lastAutoTable?.finalY || 150,
    150
  ) + 10;

  doc.setFillColor(46, 204, 113);
  doc.rect(14, finalY, pageWidth - 28, 15, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SALÁRIO LÍQUIDO:', 20, finalY + 10);
  doc.text(formatCurrency(data.netSalary), pageWidth - 20, finalY + 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // FGTS
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Base FGTS: ${formatCurrency(data.fgtsBase)}`, 14, finalY + 28);
  doc.text(`FGTS do mês: ${formatCurrency(data.fgtsValue)}`, 14, finalY + 34);
  doc.text(`Data de pagamento: ${data.paymentDate}`, pageWidth - 14, finalY + 28, { align: 'right' });

  // Linha de assinatura
  doc.line(14, finalY + 55, 100, finalY + 55);
  doc.setFontSize(8);
  doc.text('Assinatura do funcionário', 57, finalY + 60, { align: 'center' });

  doc.line(110, finalY + 55, 196, finalY + 55);
  doc.text('Assinatura do empregador', 153, finalY + 60, { align: 'center' });

  // Rodapé
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Este documento foi gerado eletronicamente pelo Nautilus HR System', pageWidth / 2, 285, { align: 'center' });

  // Salvar PDF
  const fileName = `holerite_${data.employeeName.replace(/\s+/g, '_')}_${data.referenceMonth}.pdf`;
  doc.save(fileName);
}

// Exportar todos os holerites em um único PDF
export async function generateBatchPayslipsPDF(payslips: PayslipData[]): Promise<void> {
  const doc = await createPDF();
  
  payslips.forEach((data, index) => {
    if (index > 0) {
      doc.addPage();
    }
    
    // Gera cada página individualmente (simplificado)
    doc.setFontSize(14);
    doc.text(`Holerite - ${data.employeeName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Competência: ${data.referenceMonth}`, 14, 30);
    doc.text(`Salário Bruto: ${data.grossSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 40);
    doc.text(`Descontos: ${data.totalDeductions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 50);
    doc.text(`Salário Líquido: ${data.netSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 60);
  });

  doc.save(`holerites_${payslips[0]?.referenceMonth || 'batch'}.pdf`);
}
