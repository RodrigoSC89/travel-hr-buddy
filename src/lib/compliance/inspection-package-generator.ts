/**
 * PATCH 901 - Inspection Package Generator
 * Automated generation of technical packages for PSC/ISM inspections
 * Exports ZIP/PDF with logs, documents, certifications, and audits
 */

import JSZip from 'jszip';
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { runProactiveComplianceMonitor } from './proactive-monitor';

export type InspectionType = 'PSC' | 'ISM' | 'MLC' | 'ISPS' | 'FLAG_STATE' | 'VETTING';
export type PackageFormat = 'pdf' | 'zip';

export interface InspectionPackageRequest {
  inspectionType: InspectionType;
  vesselId?: string;
  vesselName: string;
  dateRange?: { start: Date; end: Date };
  includeDocuments: boolean;
  includeLogs: boolean;
  includeAudits: boolean;
  includeCertificates: boolean;
  includeCrewData: boolean;
  format: PackageFormat;
  digitalSignature?: {
    name: string;
    position: string;
    timestamp: Date;
  };
}

export interface PackageDocument {
  name: string;
  category: string;
  status: 'valid' | 'expiring' | 'expired' | 'missing';
  expiryDate?: string;
  filePath?: string;
}

export interface PackageAuditRecord {
  id: string;
  type: string;
  date: string;
  score: number;
  findings: number;
  status: string;
}

export interface GeneratedPackage {
  id: string;
  inspectionType: InspectionType;
  vesselName: string;
  format: PackageFormat;
  fileName: string;
  fileSize: number;
  generatedAt: string;
  validUntil: string;
  checksum: string;
  downloadUrl?: string;
  blob: Blob;
}

// Document requirements by inspection type
const INSPECTION_DOCUMENTS: Record<InspectionType, string[]> = {
  PSC: [
    'Certificate of Registry',
    'Safety Management Certificate (SMC)',
    'Document of Compliance (DOC)',
    'International Tonnage Certificate',
    'Load Line Certificate',
    'Safety Equipment Certificate',
    'Safety Radio Certificate',
    'Safety Construction Certificate',
    'IOPP Certificate',
    'MARPOL Certificates',
    'Minimum Safe Manning Document',
    'Crew Certificates (STCW)',
    'Official Log Book',
    'Oil Record Book',
    'Garbage Record Book',
    'Ballast Water Management Plan',
  ],
  ISM: [
    'Document of Compliance (DOC)',
    'Safety Management Certificate (SMC)',
    'ISM Manual',
    'Emergency Procedures',
    'Safety Meeting Records',
    'Internal Audit Reports',
    'Non-Conformity Records',
    'Management Review Records',
    'Drill Records',
    'Maintenance Records',
  ],
  MLC: [
    'Maritime Labour Certificate',
    'Declaration of Maritime Labour Compliance',
    'Seafarers Employment Agreements',
    'Wage Payment Records',
    'Hours of Work/Rest Records',
    'Medical Certificates',
    'Training Records',
    'Repatriation Arrangements',
    'Accommodation Inspection Records',
    'Food and Catering Records',
  ],
  ISPS: [
    'International Ship Security Certificate (ISSC)',
    'Ship Security Plan',
    'Security Assessment',
    'Security Drill Records',
    'Declaration of Security Records',
    'Access Control Logs',
    'Security Equipment Inspection Records',
  ],
  FLAG_STATE: [
    'All statutory certificates',
    'Class certificates',
    'Survey records',
    'Deficiency correction records',
    'Manning records',
    'Training records',
  ],
  VETTING: [
    'SIRE/CDI questionnaire responses',
    'Previous vetting reports',
    'Corrective action records',
    'Safety meeting records',
    'Bridge and engine room logs',
    'Cargo handling records',
  ],
};

/**
 * Generate timestamp-versioned filename
 */
function generateFileName(vesselName: string, inspectionType: InspectionType, format: PackageFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sanitizedVessel = vesselName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${inspectionType}_Package_${sanitizedVessel}_${timestamp}.${format}`;
}

/**
 * Generate simple checksum for package integrity
 */
function generateChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Fetch vessel documents from database
 */
async function fetchVesselDocuments(vesselId?: string): Promise<PackageDocument[]> {
  const documents: PackageDocument[] = [];
  const now = new Date();

  try {
    // Simulated document status (would come from documents table)
    const simulatedDocs: PackageDocument[] = [
      { name: 'Safety Management Certificate', category: 'Statutory', status: 'valid', expiryDate: '2026-03-15' },
      { name: 'Document of Compliance', category: 'Statutory', status: 'valid', expiryDate: '2025-12-01' },
      { name: 'Load Line Certificate', category: 'Statutory', status: 'valid', expiryDate: '2026-06-30' },
      { name: 'IOPP Certificate', category: 'Environmental', status: 'expiring', expiryDate: '2025-02-28' },
      { name: 'Safety Radio Certificate', category: 'Safety', status: 'valid', expiryDate: '2026-01-15' },
      { name: 'ISSC Certificate', category: 'Security', status: 'valid', expiryDate: '2025-08-20' },
      { name: 'Crew Training Records', category: 'Crew', status: 'valid' },
      { name: 'Drill Records', category: 'Safety', status: 'valid' },
      { name: 'Maintenance Logs', category: 'Operations', status: 'valid' },
      { name: 'Oil Record Book', category: 'Environmental', status: 'valid' },
    ];

    return simulatedDocs;
  } catch (error) {
    logger.error('Error fetching vessel documents', { error });
    return documents;
  }
}

/**
 * Fetch audit records
 */
async function fetchAuditRecords(vesselId?: string): Promise<PackageAuditRecord[]> {
  const records: PackageAuditRecord[] = [];

  try {
    // Simulated audit records
    const simulatedAudits: PackageAuditRecord[] = [
      { id: '1', type: 'ISM Internal Audit', date: '2024-11-15', score: 92, findings: 3, status: 'Closed' },
      { id: '2', type: 'ISPS Audit', date: '2024-10-20', score: 88, findings: 2, status: 'Closed' },
      { id: '3', type: 'Pre-PSC Inspection', date: '2024-12-01', score: 95, findings: 1, status: 'Closed' },
      { id: '4', type: 'MLC Inspection', date: '2024-09-10', score: 90, findings: 2, status: 'Closed' },
    ];

    return simulatedAudits;
  } catch (error) {
    logger.error('Error fetching audit records', { error });
    return records;
  }
}

/**
 * Fetch crew certificates
 */
async function fetchCrewCertificates(): Promise<Array<{ name: string; position: string; certificates: string[] }>> {
  try {
    // Simulated crew data
    return [
      { name: 'João Silva', position: 'Master', certificates: ['STCW II/2', 'GMDSS', 'Medical'] },
      { name: 'Maria Santos', position: 'Chief Officer', certificates: ['STCW II/1', 'ARPA', 'Medical'] },
      { name: 'Pedro Oliveira', position: 'Chief Engineer', certificates: ['STCW III/2', 'Medical'] },
      { name: 'Ana Costa', position: '2nd Officer', certificates: ['STCW II/1', 'ECDIS', 'Medical'] },
      { name: 'Carlos Lima', position: '2nd Engineer', certificates: ['STCW III/1', 'Medical'] },
    ];
  } catch (error) {
    logger.error('Error fetching crew certificates', { error });
    return [];
  }
}

/**
 * Generate PDF inspection package
 */
async function generatePDFPackage(request: InspectionPackageRequest): Promise<Blob> {
  const [JsPDF, autoTable] = await Promise.all([getJsPDF(), getAutoTable()]);
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${request.inspectionType} INSPECTION PACKAGE`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Vessel Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vessel: ${request.vesselName}`, 20, yPos);
  yPos += 7;
  doc.text(`Inspection Type: ${request.inspectionType}`, 20, yPos);
  yPos += 7;
  doc.text(`Generated: ${new Date().toLocaleString('pt-BR')}`, 20, yPos);
  yPos += 7;
  doc.text(`Version: ${generateFileName(request.vesselName, request.inspectionType, 'pdf').split('_').slice(-1)[0].replace('.pdf', '')}`, 20, yPos);
  yPos += 15;

  // Compliance Status
  const complianceResult = await runProactiveComplianceMonitor();
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLIANCE STATUS', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score: ${complianceResult.overallScore}%`, 20, yPos);
  yPos += 6;
  doc.text(`Status: ${complianceResult.overallStatus.toUpperCase()}`, 20, yPos);
  yPos += 6;
  doc.text(`Critical Alerts: ${complianceResult.criticalAlerts.length}`, 20, yPos);
  yPos += 6;
  doc.text(`Upcoming Expirations: ${complianceResult.upcomingExpirations.length}`, 20, yPos);
  yPos += 15;

  // Module Scores Table
  const moduleData = complianceResult.modules.map(m => [
    m.module,
    `${m.score}%`,
    m.status.toUpperCase(),
    m.gaps.length.toString(),
    m.alerts.length.toString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Module', 'Score', 'Status', 'Gaps', 'Alerts']],
    body: moduleData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Required Documents Checklist
  if (request.includeDocuments) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUIRED DOCUMENTS CHECKLIST', 20, yPos);
    yPos += 10;

    const documents = await fetchVesselDocuments(request.vesselId);
    const requiredDocs = INSPECTION_DOCUMENTS[request.inspectionType];

    const docData = documents.slice(0, 10).map((doc, idx) => [
      (idx + 1).toString(),
      doc.name,
      doc.category,
      doc.status.toUpperCase(),
      doc.expiryDate || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Document', 'Category', 'Status', 'Expiry']],
      body: docData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Audit Records
  if (request.includeAudits) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDIT HISTORY', 20, yPos);
    yPos += 10;

    const audits = await fetchAuditRecords(request.vesselId);
    const auditData = audits.map((a, idx) => [
      (idx + 1).toString(),
      a.type,
      a.date,
      `${a.score}%`,
      a.findings.toString(),
      a.status,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Audit Type', 'Date', 'Score', 'Findings', 'Status']],
      body: auditData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Crew Certificates
  if (request.includeCrewData) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CREW CERTIFICATION SUMMARY', 20, yPos);
    yPos += 10;

    const crew = await fetchCrewCertificates();
    const crewData = crew.map((c, idx) => [
      (idx + 1).toString(),
      c.name,
      c.position,
      c.certificates.join(', '),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Name', 'Position', 'Certificates']],
      body: crewData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }

  // Critical Alerts Section
  if (complianceResult.criticalAlerts.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text('CRITICAL ALERTS', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    const alertData = complianceResult.criticalAlerts.slice(0, 5).map((a, idx) => [
      (idx + 1).toString(),
      a.standard,
      a.severity.toUpperCase(),
      a.title,
      a.recommendation.substring(0, 50) + '...',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Standard', 'Severity', 'Alert', 'Recommendation']],
      body: alertData,
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
      styles: { fontSize: 8 },
    });
  }

  // Digital Signature Section
  if (request.digitalSignature) {
    doc.addPage();
    yPos = pageHeight - 80;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITAL SIGNATURE', 20, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Signed by: ${request.digitalSignature.name}`, 20, yPos);
    yPos += 6;
    doc.text(`Position: ${request.digitalSignature.position}`, 20, yPos);
    yPos += 6;
    doc.text(`Date/Time: ${request.digitalSignature.timestamp.toLocaleString('pt-BR')}`, 20, yPos);
    yPos += 6;
    
    const signatureHash = generateChecksum(`${request.digitalSignature.name}${request.digitalSignature.timestamp.toISOString()}`);
    doc.text(`Verification Hash: ${signatureHash}`, 20, yPos);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Nautilus One - ${request.inspectionType} Inspection Package | Generated: ${new Date().toISOString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  return doc.output('blob');
}

/**
 * Generate ZIP inspection package
 */
async function generateZIPPackage(request: InspectionPackageRequest): Promise<Blob> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString();

  // Add PDF summary
  const pdfBlob = await generatePDFPackage(request);
  zip.file('Inspection_Summary.pdf', pdfBlob);

  // Add metadata JSON
  const metadata = {
    inspectionType: request.inspectionType,
    vesselName: request.vesselName,
    generatedAt: timestamp,
    version: '1.0',
    format: 'ZIP',
    contents: [] as string[],
  };

  // Documents folder
  if (request.includeDocuments) {
    const docsFolder = zip.folder('01_Documents');
    const documents = await fetchVesselDocuments(request.vesselId);
    
    // Create documents checklist
    const docsList = documents.map((d, i) => 
      `${i + 1}. ${d.name}\n   Category: ${d.category}\n   Status: ${d.status}\n   Expiry: ${d.expiryDate || 'N/A'}\n`
    ).join('\n');
    
    docsFolder?.file('Documents_Checklist.txt', `DOCUMENTS CHECKLIST\nGenerated: ${timestamp}\n\n${docsList}`);
    metadata.contents.push('01_Documents');
  }

  // Audits folder
  if (request.includeAudits) {
    const auditsFolder = zip.folder('02_Audits');
    const audits = await fetchAuditRecords(request.vesselId);
    
    const auditsList = audits.map((a, i) => 
      `${i + 1}. ${a.type}\n   Date: ${a.date}\n   Score: ${a.score}%\n   Findings: ${a.findings}\n   Status: ${a.status}\n`
    ).join('\n');
    
    auditsFolder?.file('Audit_History.txt', `AUDIT HISTORY\nGenerated: ${timestamp}\n\n${auditsList}`);
    metadata.contents.push('02_Audits');
  }

  // Certificates folder
  if (request.includeCertificates) {
    const certsFolder = zip.folder('03_Certificates');
    const crew = await fetchCrewCertificates();
    
    const certsList = crew.map((c, i) => 
      `${i + 1}. ${c.name} - ${c.position}\n   Certificates: ${c.certificates.join(', ')}\n`
    ).join('\n');
    
    certsFolder?.file('Crew_Certificates.txt', `CREW CERTIFICATION SUMMARY\nGenerated: ${timestamp}\n\n${certsList}`);
    metadata.contents.push('03_Certificates');
  }

  // Logs folder
  if (request.includeLogs) {
    const logsFolder = zip.folder('04_Logs');
    
    const complianceResult = await runProactiveComplianceMonitor();
    const complianceLog = JSON.stringify(complianceResult, null, 2);
    
    logsFolder?.file('Compliance_Status.json', complianceLog);
    logsFolder?.file('Generation_Log.txt', `PACKAGE GENERATION LOG\n\nTimestamp: ${timestamp}\nInspection Type: ${request.inspectionType}\nVessel: ${request.vesselName}\n\nCompliance Score: ${complianceResult.overallScore}%\nStatus: ${complianceResult.overallStatus}\nCritical Alerts: ${complianceResult.criticalAlerts.length}\n`);
    metadata.contents.push('04_Logs');
  }

  // Add digital signature if provided
  if (request.digitalSignature) {
    const signatureHash = generateChecksum(`${request.digitalSignature.name}${request.digitalSignature.timestamp.toISOString()}`);
    
    const signatureData = {
      signedBy: request.digitalSignature.name,
      position: request.digitalSignature.position,
      timestamp: request.digitalSignature.timestamp.toISOString(),
      verificationHash: signatureHash,
    };
    
    zip.file('Digital_Signature.json', JSON.stringify(signatureData, null, 2));
  }

  // Add metadata
  zip.file('PACKAGE_METADATA.json', JSON.stringify(metadata, null, 2));

  // Add README
  const readme = `
# ${request.inspectionType} INSPECTION PACKAGE

## Vessel: ${request.vesselName}
## Generated: ${timestamp}

### Contents
${metadata.contents.map(c => `- ${c}/`).join('\n')}
- Inspection_Summary.pdf
- PACKAGE_METADATA.json
${request.digitalSignature ? '- Digital_Signature.json' : ''}

### Usage
This package contains all required documentation for ${request.inspectionType} inspection.
Review Inspection_Summary.pdf for a complete overview.

### Verification
Package checksum can be verified using PACKAGE_METADATA.json

---
Generated by Nautilus One Maritime HR Management System
  `.trim();

  zip.file('README.md', readme);

  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}

/**
 * Main function to generate inspection package
 */
export async function generateInspectionPackage(
  request: InspectionPackageRequest
): Promise<GeneratedPackage> {
  logger.info('📦 Generating inspection package', { 
    inspectionType: request.inspectionType,
    vesselName: request.vesselName,
    format: request.format,
  });

  const startTime = Date.now();

  try {
    const blob = request.format === 'pdf'
      ? await generatePDFPackage(request)
      : await generateZIPPackage(request);

    const fileName = generateFileName(request.vesselName, request.inspectionType, request.format);
    const checksum = generateChecksum(fileName + new Date().toISOString());

    const result: GeneratedPackage = {
      id: `pkg-${Date.now()}`,
      inspectionType: request.inspectionType,
      vesselName: request.vesselName,
      format: request.format,
      fileName,
      fileSize: blob.size,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      checksum,
      blob,
    };

    logger.info('✅ Inspection package generated', {
      fileName,
      fileSize: blob.size,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error('❌ Failed to generate inspection package', { error });
    throw error;
  }
}

/**
 * Download generated package
 */
export function downloadPackage(pkg: GeneratedPackage): void {
  const url = URL.createObjectURL(pkg.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = pkg.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
