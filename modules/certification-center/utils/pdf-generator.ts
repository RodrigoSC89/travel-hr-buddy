/**
 * PDF Export Utility
 * PATCH 151.0 - Certificate PDF generation with QR Code
 */

import jsPDF from "jspdf";
import { CertificationData } from "../types";

/**
 * Generate PDF certificate with QR code
 */
export const generateCertificatePDF = async (certificate: CertificationData): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  
  // Header
  pdf.setFillColor(0, 51, 102);
  pdf.rect(0, 0, pageWidth, 40, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text("DIGITAL CERTIFICATE", pageWidth / 2, 20, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.text(`${certificate.type} Certification`, pageWidth / 2, 30, { align: "center" });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Certificate ID and Hash
  let yPos = 55;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Certificate ID:", margin, yPos);
  pdf.setFont("helvetica", "normal");
  pdf.text(certificate.id, margin + 40, yPos);
  
  yPos += 10;
  pdf.setFont("helvetica", "bold");
  pdf.text("Hash (SHA-256):", margin, yPos);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(certificate.hash, margin + 40, yPos);
  
  // Vessel Information
  yPos += 15;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("VESSEL INFORMATION", margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Vessel Name: ${certificate.vesselName}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`IMO Number: ${certificate.imoNumber}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Vessel ID: ${certificate.vesselId}`, margin, yPos);
  
  // Certification Details
  yPos += 15;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("CERTIFICATION DETAILS", margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Issued By: ${certificate.issuedBy}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Issue Date: ${new Date(certificate.issuedDate).toLocaleDateString()}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Expiry Date: ${new Date(certificate.expiryDate).toLocaleDateString()}`, margin, yPos);
  
  // Operation Details
  yPos += 15;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("OPERATION DETAILS", margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Port: ${certificate.operationDetails.portName}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Operation Type: ${certificate.operationDetails.operationType}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Inspector: ${certificate.operationDetails.inspectorName}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Inspection Date: ${new Date(certificate.operationDetails.inspectionDate).toLocaleDateString()}`, margin, yPos);
  
  yPos += 7;
  pdf.text(`Status: ${certificate.operationDetails.status.toUpperCase()}`, margin, yPos);
  
  // Findings
  if (certificate.operationDetails.findings.length > 0) {
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Findings:", margin, yPos);
    pdf.setFont("helvetica", "normal");
    
    certificate.operationDetails.findings.forEach((finding, index) => {
      yPos += 7;
      pdf.text(`${index + 1}. ${finding}`, margin + 5, yPos);
    });
  }
  
  // QR Code
  const qrSize = 60;
  const qrX = pageWidth - margin - qrSize;
  const qrY = 55;
  
  if (certificate.qrCode) {
    pdf.addImage(certificate.qrCode, "PNG", qrX, qrY, qrSize, qrSize);
  }
  
  pdf.setFontSize(8);
  pdf.text("Scan to validate", qrX + qrSize / 2, qrY + qrSize + 5, { align: "center" });
  
  // Validation URL
  yPos = pdf.internal.pageSize.getHeight() - 30;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Validation URL:", margin, yPos);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 255);
  pdf.text(certificate.validationUrl, margin, yPos + 5);
  
  // Footer
  pdf.setTextColor(128, 128, 128);
  pdf.setFontSize(8);
  const footerY = pdf.internal.pageSize.getHeight() - 15;
  pdf.text("This is a digitally issued certificate with cryptographic validation.", pageWidth / 2, footerY, { align: "center" });
  pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: "center" });
  
  // Return as blob
  return pdf.output("blob");
};

/**
 * Download certificate PDF
 */
export const downloadCertificatePDF = async (certificate: CertificationData) => {
  const blob = await generateCertificatePDF(certificate);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${certificate.id}_${certificate.type}_Certificate.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
