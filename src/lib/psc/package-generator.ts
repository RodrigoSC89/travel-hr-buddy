/**
 * PSC Package Generator
 * PATCH 850 - Geração de pacotes de inspeção PSC
 */

import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PSCInspection {
  id: string;
  organization_id: string;
  vessel_id: string;
  inspection_date: string;
  port_name: string;
  port_country: string;
  port_state_authority?: string;
  inspection_type: 'initial' | 'expanded' | 'concentrated' | 'follow_up';
  inspection_focus?: string[];
  detention: boolean;
  detention_reason?: string;
  deficiencies_count: number;
  report_file_path?: string;
  risk_score?: number;
  created_at: string;
  updated_at: string;
}

export interface PSCDeficiency {
  id: string;
  inspection_id: string;
  deficiency_code: string;
  deficiency_description: string;
  category?: string;
  severity: 'observation' | 'deficiency' | 'detainable';
  action_code?: string;
  corrective_action?: string;
  corrective_deadline?: string;
  corrected_at?: string;
  verified_at?: string;
  verified_by?: string;
  evidence_files?: string[];
  status: 'open' | 'in_progress' | 'corrected' | 'verified' | 'closed';
  created_at: string;
}

// Required documents by inspection type
const REQUIRED_DOCUMENTS: Record<string, string[]> = {
  initial: [
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
  ],
  expanded: [
    'All initial inspection documents',
    'ISM Manual',
    'Safety Management System procedures',
    'Emergency procedures',
    'Drill records',
    'Maintenance records',
    'Rest hour records',
    'Training records',
    'Medical certificates',
  ],
  concentrated: [
    'Focus area documentation',
    'Relevant certificates',
    'Maintenance history for focus area',
    'Inspection records',
    'Deficiency correction evidence',
  ],
  follow_up: [
    'Previous inspection report',
    'Deficiency correction evidence',
    'Verification documents',
    'Updated certificates if applicable',
  ],
};

/**
 * Create a new PSC inspection record
 */
export async function createInspection(
  data: Omit<PSCInspection, 'id' | 'created_at' | 'updated_at'>
): Promise<PSCInspection | null> {
  const { data: inspection, error } = await supabase
    .from('psc_inspections')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Failed to create inspection:', error);
    return null;
  }

  return inspection as unknown as PSCInspection;
}

/**
 * Get inspections for a vessel
 */
export async function getVesselInspections(
  vesselId: string
): Promise<PSCInspection[]> {
  const { data, error } = await supabase
    .from('psc_inspections')
    .select('*')
    .eq('vessel_id', vesselId)
    .order('inspection_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch inspections:', error);
    return [];
  }

  return data as unknown as PSCInspection[];
}

/**
 * Add deficiency to inspection
 */
export async function addDeficiency(
  data: Omit<PSCDeficiency, 'id' | 'created_at'>
): Promise<PSCDeficiency | null> {
  const { data: deficiency, error } = await supabase
    .from('psc_deficiencies')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Failed to add deficiency:', error);
    return null;
  }

  // Update deficiency count manually
  try {
    const { data: inspection } = await supabase
      .from('psc_inspections')
      .select('deficiencies_count')
      .eq('id', data.inspection_id)
      .single();
    
    if (inspection) {
      await supabase
        .from('psc_inspections')
        .update({ deficiencies_count: (inspection.deficiencies_count || 0) + 1 })
        .eq('id', data.inspection_id);
    }
  } catch (e) {
    console.error('Failed to update deficiency count:', e);
  }

  return deficiency as unknown as PSCDeficiency;
}

/**
 * Get deficiencies for an inspection
 */
export async function getDeficiencies(
  inspectionId: string
): Promise<PSCDeficiency[]> {
  const { data, error } = await supabase
    .from('psc_deficiencies')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch deficiencies:', error);
    return [];
  }

  return data as unknown as PSCDeficiency[];
}

/**
 * Update deficiency status
 */
export async function updateDeficiencyStatus(
  deficiencyId: string,
  status: PSCDeficiency['status'],
  updates?: Partial<Pick<PSCDeficiency, 'corrective_action' | 'corrected_at' | 'verified_at' | 'verified_by'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('psc_deficiencies')
    .update({ status, ...updates })
    .eq('id', deficiencyId);

  if (error) {
    console.error('Failed to update deficiency:', error);
    return false;
  }

  return true;
}

/**
 * Calculate PSC risk score
 */
export function calculateRiskScore(
  inspections: PSCInspection[],
  deficiencies: PSCDeficiency[]
): number {
  if (inspections.length === 0) return 0;

  let score = 100;

  // Deduct for detentions (major impact)
  const detentions = inspections.filter(i => i.detention).length;
  score -= detentions * 20;

  // Deduct for deficiencies
  const detainableCount = deficiencies.filter(d => d.severity === 'detainable').length;
  const deficiencyCount = deficiencies.filter(d => d.severity === 'deficiency').length;
  const observationCount = deficiencies.filter(d => d.severity === 'observation').length;

  score -= detainableCount * 10;
  score -= deficiencyCount * 5;
  score -= observationCount * 2;

  // Bonus for closed deficiencies
  const closedCount = deficiencies.filter(d => d.status === 'closed').length;
  score += closedCount * 3;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get required documents for inspection type
 */
export function getRequiredDocuments(
  inspectionType: PSCInspection['inspection_type'],
  focusAreas?: string[]
): string[] {
  const base = REQUIRED_DOCUMENTS[inspectionType] || REQUIRED_DOCUMENTS.initial;
  
  if (focusAreas && focusAreas.length > 0) {
    // Add focus-specific documents
    const focusDocuments = focusAreas.flatMap(area => {
      switch (area.toLowerCase()) {
        case 'safety':
          return ['Life-saving equipment records', 'Fire drill records', 'Safety equipment inspection records'];
        case 'security':
          return ['ISPS Code documents', 'Ship Security Plan', 'Security drill records'];
        case 'pollution':
          return ['Garbage Record Book', 'Ballast Water Management Plan', 'SOPEP'];
        case 'crew':
          return ['Working hour records', 'Training certificates', 'Medical fitness certificates'];
        default:
          return [];
      }
    });
    
    return [...base, ...focusDocuments];
  }
  
  return base;
}

/**
 * Generate PSC inspection package as PDF
 */
export async function generatePDFPackage(
  inspection: PSCInspection,
  deficiencies: PSCDeficiency[],
  vesselName: string
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.text('PSC INSPECTION PACKAGE', pageWidth / 2, 20, { align: 'center' });

  // Vessel and inspection info
  doc.setFontSize(12);
  doc.text(`Vessel: ${vesselName}`, 20, 35);
  doc.text(`Port: ${inspection.port_name}, ${inspection.port_country}`, 20, 42);
  doc.text(`Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`, 20, 49);
  doc.text(`Type: ${inspection.inspection_type.toUpperCase()}`, 20, 56);
  doc.text(`Status: ${inspection.detention ? 'DETAINED' : 'CLEARED'}`, 20, 63);

  // Required documents checklist
  doc.setFontSize(14);
  doc.text('Required Documents Checklist', 20, 80);

  const requiredDocs = getRequiredDocuments(inspection.inspection_type, inspection.inspection_focus || undefined);
  const checklistData = requiredDocs.map((doc, idx) => [
    (idx + 1).toString(),
    doc,
    '☐ Ready',
    '',
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['#', 'Document', 'Status', 'Notes']],
    body: checklistData,
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
  });

  // Deficiencies section if any
  if (deficiencies.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Deficiencies Summary', 20, 20);

    const deficiencyData = deficiencies.map((def, idx) => [
      (idx + 1).toString(),
      def.deficiency_code,
      def.deficiency_description.substring(0, 50) + '...',
      def.severity.toUpperCase(),
      def.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Code', 'Description', 'Severity', 'Status']],
      body: deficiencyData,
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated: ${new Date().toISOString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Generate complete PSC package as ZIP
 */
export async function generateZIPPackage(
  inspection: PSCInspection,
  deficiencies: PSCDeficiency[],
  vesselName: string,
  documents?: Array<{ name: string; data: Blob }>
): Promise<Blob> {
  const zip = new JSZip();

  // Add PDF summary
  const pdfBlob = await generatePDFPackage(inspection, deficiencies, vesselName);
  zip.file('inspection_summary.pdf', pdfBlob);

  // Add deficiencies CSV
  if (deficiencies.length > 0) {
    const csvContent = generateDeficienciesCSV(deficiencies);
    zip.file('deficiencies.csv', csvContent);
  }

  // Add required documents checklist
  const checklist = getRequiredDocuments(inspection.inspection_type, inspection.inspection_focus || undefined);
  zip.file('documents_checklist.txt', checklist.join('\n'));

  // Add any provided documents
  if (documents) {
    const docsFolder = zip.folder('documents');
    for (const doc of documents) {
      docsFolder?.file(doc.name, doc.data);
    }
  }

  // Add metadata JSON
  const metadata = {
    inspection,
    deficiencies,
    vesselName,
    generatedAt: new Date().toISOString(),
    documentCount: documents?.length || 0,
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate deficiencies as CSV
 */
function generateDeficienciesCSV(deficiencies: PSCDeficiency[]): string {
  const headers = [
    'Code',
    'Description',
    'Category',
    'Severity',
    'Status',
    'Action Code',
    'Corrective Action',
    'Deadline',
    'Corrected At',
    'Verified At',
  ];

  const rows = deficiencies.map(d => [
    d.deficiency_code,
    `"${d.deficiency_description.replace(/"/g, '""')}"`,
    d.category || '',
    d.severity,
    d.status,
    d.action_code || '',
    d.corrective_action ? `"${d.corrective_action.replace(/"/g, '""')}"` : '',
    d.corrective_deadline || '',
    d.corrected_at || '',
    d.verified_at || '',
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export inspection history to CSV
 */
export function exportInspectionsCSV(inspections: PSCInspection[]): string {
  const headers = [
    'Date',
    'Port',
    'Country',
    'Type',
    'Detention',
    'Deficiencies',
    'Risk Score',
  ];

  const rows = inspections.map(i => [
    i.inspection_date,
    i.port_name,
    i.port_country,
    i.inspection_type,
    i.detention ? 'Yes' : 'No',
    i.deficiencies_count.toString(),
    i.risk_score?.toString() || '',
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
