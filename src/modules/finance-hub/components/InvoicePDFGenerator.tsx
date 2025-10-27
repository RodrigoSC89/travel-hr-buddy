import { Invoice } from "../hooks/useFinanceData";
import { formatCurrency, formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("NAUTILUS ONE", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Maritime Operations Management", 105, 28, { align: "center" });
  doc.text("contact@nautilusone.com | +1 (555) 0123-4567", 105, 33, { align: "center" });
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${invoice.invoice_type.toUpperCase()} INVOICE`, 20, 50);
  
  // Invoice Details - Left Side
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Number:", 20, 60);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoice_number, 55, 60);
  
  doc.setFont("helvetica", "bold");
  doc.text("Issue Date:", 20, 68);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoice.issue_date), 55, 68);
  
  if (invoice.due_date) {
    doc.setFont("helvetica", "bold");
    doc.text("Due Date:", 20, 76);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(invoice.due_date), 55, 76);
  }
  
  // Status Badge
  const statusY = 60;
  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 197, 94],
    pending: [234, 179, 8],
    overdue: [239, 68, 68],
    draft: [156, 163, 175],
    cancelled: [107, 114, 128]
  };
  
  const statusColor = statusColors[invoice.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(140, statusY - 5, 30, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(invoice.status.toUpperCase(), 155, statusY, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  // Customer/Vendor Information
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 92);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.customer_name || invoice.vendor_supplier || "N/A", 20, 100);
  
  // Line Items Table
  const tableStartY = 115;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["Description", "Quantity", "Unit Price", "Amount"]],
    body: [
      ["Service/Product", "1", formatCurrency(invoice.subtotal, invoice.currency), formatCurrency(invoice.subtotal, invoice.currency)]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" }
    }
  });
  
  // Calculate position after table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 30;
  
  // Totals Section
  const totalsX = 120;
  let currentY = finalY + 10;
  
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", totalsX, currentY);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), 190, currentY, { align: "right" });
  
  if (invoice.discount_amount > 0) {
    currentY += 7;
    doc.text("Discount:", totalsX, currentY);
    doc.text(`-${formatCurrency(invoice.discount_amount, invoice.currency)}`, 190, currentY, { align: "right" });
  }
  
  currentY += 7;
  doc.text("Tax:", totalsX, currentY);
  doc.text(formatCurrency(invoice.tax_amount, invoice.currency), 190, currentY, { align: "right" });
  
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Amount:", totalsX, currentY);
  doc.text(formatCurrency(invoice.total_amount, invoice.currency), 190, currentY, { align: "right" });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const footerY = 280;
  doc.text("Thank you for your business!", 105, footerY, { align: "center" });
  doc.text("For any questions, please contact our finance department.", 105, footerY + 5, { align: "center" });
  
  // Save PDF
  const fileName = `${invoice.invoice_number}_${invoice.invoice_type}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const previewInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  
  // Same generation logic as above
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("NAUTILUS ONE", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Maritime Operations Management", 105, 28, { align: "center" });
  
  // Open in new window for preview
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
