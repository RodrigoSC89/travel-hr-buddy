/**
 * PATCH 653 - Lazy loading for jsPDF
 */

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

export interface Certificate {
  id: string;
  certificate_number: string;
  course_title: string;
  issued_date: string;
  final_score: number;
  user_name: string;
}

export const generateCertificatePDF = async (certificate: Certificate): Promise<Blob> => {
  const jsPDF = await loadJsPDF();
  
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Border
  doc.setLineWidth(5);
  doc.setDrawColor(41, 128, 185);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner border
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Certificate Title
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text("Certificate of Completion", pageWidth / 2, 40, { align: "center" });

  // Presented to
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", pageWidth / 2, 60, { align: "center" });

  // Student Name
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(certificate.user_name, pageWidth / 2, 80, { align: "center" });

  // Has successfully completed
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("has successfully completed the course", pageWidth / 2, 95, { align: "center" });

  // Course Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(certificate.course_title, pageWidth / 2, 115, { align: "center" });

  // Score
  if (certificate.final_score) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Final Score: ${certificate.final_score}%`, pageWidth / 2, 130, { align: "center" });
  }

  // Date and Certificate Number
  doc.setFontSize(12);
  const issuedDate = new Date(certificate.issued_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.text(`Date: ${issuedDate}`, pageWidth / 4, 160, { align: "center" });
  doc.text(`Certificate No: ${certificate.certificate_number}`, (3 * pageWidth) / 4, 160, { align: "center" });

  // Signature line
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth / 2 - 40, 175, pageWidth / 2 + 40, 175);
  doc.setFontSize(10);
  doc.text("Authorized Signature", pageWidth / 2, 180, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "This certificate is issued by Travel HR Buddy Training Academy",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );

  return doc.output("blob");
};
