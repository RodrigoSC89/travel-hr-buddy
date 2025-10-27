/**
 * Finance Hub Export Service
 * Handles PDF and CSV export of financial reports
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialTransaction, Invoice, FinancialSummary, BudgetCategory } from '../hooks/useFinanceData';

export interface FinanceReportData {
  summary: FinancialSummary;
  transactions: FinancialTransaction[];
  invoices: Invoice[];
  categories: BudgetCategory[];
  dateRange: {
    from: string;
    to: string;
  };
}

export class FinanceExportService {
  /**
   * Export financial report to PDF
   */
  static exportToPDF(data: FinanceReportData, filename: string = 'financial-report.pdf'): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Period: ${new Date(data.dateRange.from).toLocaleDateString()} - ${new Date(data.dateRange.to).toLocaleDateString()}`,
      pageWidth / 2,
      28,
      { align: 'center' }
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 33, { align: 'center' });
    
    let yPos = 45;
    
    // Financial Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Income', this.formatCurrency(data.summary.totalIncome)],
      ['Total Expenses', this.formatCurrency(data.summary.totalExpenses)],
      ['Net Profit/Loss', this.formatCurrency(data.summary.netProfit)],
      ['Total Transactions', data.summary.transactionCount.toString()],
      ['Pending Invoices', data.summary.pendingInvoices.toString()],
      ['Overdue Invoices', data.summary.overdueInvoices.toString()],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    // Recent Transactions Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Transactions', 14, yPos);
    yPos += 8;
    
    const transactionRows = data.transactions.slice(0, 20).map(t => [
      new Date(t.transaction_date).toLocaleDateString(),
      t.description || '-',
      t.transaction_type.toUpperCase(),
      this.formatCurrency(t.amount),
      t.status.toUpperCase()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Description', 'Type', 'Amount', 'Status']],
      body: transactionRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });
    
    // Add page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }
    
    // Add a new page for invoices if we have any
    if (data.invoices.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoices Summary', 14, yPos);
      yPos += 8;
      
      const invoiceRows = data.invoices.slice(0, 20).map(inv => [
        inv.invoice_number,
        new Date(inv.issue_date).toLocaleDateString(),
        inv.invoice_type.toUpperCase(),
        inv.customer_name || inv.vendor_supplier || '-',
        this.formatCurrency(inv.total_amount),
        inv.status.toUpperCase()
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Invoice #', 'Issue Date', 'Type', 'Customer/Vendor', 'Amount', 'Status']],
        body: invoiceRows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 25 }
        },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Save the PDF
    doc.save(filename);
  }
  
  /**
   * Export financial data to CSV
   */
  static exportToCSV(data: FinanceReportData, filename: string = 'financial-report.csv'): void {
    let csvContent = '';
    
    // Summary section
    csvContent += 'FINANCIAL SUMMARY\n';
    csvContent += `Period,${data.dateRange.from},${data.dateRange.to}\n`;
    csvContent += `Generated,${new Date().toISOString()}\n`;
    csvContent += '\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Income,${data.summary.totalIncome}\n`;
    csvContent += `Total Expenses,${data.summary.totalExpenses}\n`;
    csvContent += `Net Profit/Loss,${data.summary.netProfit}\n`;
    csvContent += `Total Transactions,${data.summary.transactionCount}\n`;
    csvContent += `Pending Invoices,${data.summary.pendingInvoices}\n`;
    csvContent += `Overdue Invoices,${data.summary.overdueInvoices}\n`;
    csvContent += '\n\n';
    
    // Transactions section
    csvContent += 'TRANSACTIONS\n';
    csvContent += 'ID,Date,Type,Amount,Currency,Description,Status,Vendor/Supplier\n';
    data.transactions.forEach(t => {
      csvContent += `${t.id},${t.transaction_date},${t.transaction_type},${t.amount},${t.currency},"${this.escapeCsvField(t.description || '')}",${t.status},"${this.escapeCsvField(t.vendor_supplier || '')}"\n`;
    });
    csvContent += '\n\n';
    
    // Invoices section
    csvContent += 'INVOICES\n';
    csvContent += 'ID,Invoice Number,Type,Issue Date,Due Date,Status,Customer,Vendor,Subtotal,Tax,Discount,Total,Currency\n';
    data.invoices.forEach(inv => {
      csvContent += `${inv.id},${inv.invoice_number},${inv.invoice_type},${inv.issue_date},${inv.due_date || ''},${inv.status},"${this.escapeCsvField(inv.customer_name || '')}","${this.escapeCsvField(inv.vendor_supplier || '')}",${inv.subtotal},${inv.tax_amount},${inv.discount_amount},${inv.total_amount},${inv.currency}\n`;
    });
    csvContent += '\n\n';
    
    // Budget categories section
    csvContent += 'BUDGET CATEGORIES\n';
    csvContent += 'ID,Name,Type,Budget Allocated,Budget Period,Active\n';
    data.categories.forEach(cat => {
      csvContent += `${cat.id},"${this.escapeCsvField(cat.name)}",${cat.category_type},${cat.budget_allocated || 0},${cat.budget_period || ''},${cat.is_active}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Export transactions only to CSV
   */
  static exportTransactionsToCSV(transactions: FinancialTransaction[], filename: string = 'transactions.csv'): void {
    let csvContent = 'ID,Date,Type,Amount,Currency,Description,Status,Payment Method,Vendor/Supplier\n';
    
    transactions.forEach(t => {
      csvContent += `${t.id},${t.transaction_date},${t.transaction_type},${t.amount},${t.currency},"${this.escapeCsvField(t.description || '')}",${t.status},${t.payment_method || ''},"${this.escapeCsvField(t.vendor_supplier || '')}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Export invoices only to CSV
   */
  static exportInvoicesToCSV(invoices: Invoice[], filename: string = 'invoices.csv'): void {
    let csvContent = 'ID,Invoice Number,Type,Issue Date,Due Date,Paid Date,Status,Customer,Vendor,Subtotal,Tax,Discount,Total,Currency,Payment Terms\n';
    
    invoices.forEach(inv => {
      csvContent += `${inv.id},${inv.invoice_number},${inv.invoice_type},${inv.issue_date},${inv.due_date || ''},${inv.paid_date || ''},${inv.status},"${this.escapeCsvField(inv.customer_name || '')}","${this.escapeCsvField(inv.vendor_supplier || '')}",${inv.subtotal},${inv.tax_amount},${inv.discount_amount},${inv.total_amount},${inv.currency},"${this.escapeCsvField(inv.payment_terms || '')}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Helper to format currency
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  /**
   * Helper to escape CSV fields that contain commas or quotes
   */
  private static escapeCsvField(field: string): string {
    if (field.includes('"')) {
      field = field.replace(/"/g, '""');
    }
    return field;
  }
}
