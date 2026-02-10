/**
 * MLC Report Generator Component
 * Professional PDF export with logo, digital signature, and action plan
 * Based on ILO MLC 2006 inspection standards
 * PATCH 861: Added email sending via Resend
 */

import React, { useState, useRef } from 'react';
import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  FileDown, Download, FileText, CheckCircle, XCircle, AlertTriangle,
  Pen, RefreshCw, Ship, Calendar, User, MapPin, Shield, Scale,
  Mail, Send, Loader2
} from 'lucide-react';
import { MLC_2022_TITLES, getItemById, type MLCCheckItem } from '@/data/mlc-2022-checklist';
import { logger } from '@/lib/logger';

interface ChecklistAnswer {
  status: 'compliant' | 'non-compliant' | 'na' | null;
  observation: string;
  evidence: string[];
  photos: string[];
  aiAssisted: boolean;
}

interface InspectionData {
  vesselName: string;
  imo: string;
  flag: string;
  port: string;
  inspectorName: string;
  startDate: string;
  answers: Record<string, ChecklistAnswer>;
}

interface NonConformity {
  itemId: string;
  title: string;
  regulation: string;
  observation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  correctiveAction: string;
  responsible: string;
  deadline: string;
}

interface MLCReportGeneratorProps {
  inspectionData: InspectionData;
  nonConformities?: NonConformity[];
}

export const MLCReportGenerator: React.FC<MLCReportGeneratorProps> = ({
  inspectionData,
  nonConformities = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [masterSignature, setMasterSignature] = useState<string | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [actionPlanNotes, setActionPlanNotes] = useState('');
  
  // Email form state
  const [shipownerEmail, setShipownerEmail] = useState('');
  const [shipownerName, setShipownerName] = useState('');
  const [flagStateEmail, setFlagStateEmail] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState('');
  
  const inspectorSigRef = useRef<SignatureCanvas>(null);
  const masterSigRef = useRef<SignatureCanvas>(null);

  // Calculate statistics
  const totalItems = Object.keys(inspectionData.answers).length;
  const compliantItems = Object.values(inspectionData.answers).filter(a => a.status === 'compliant').length;
  const nonCompliantItems = Object.values(inspectionData.answers).filter(a => a.status === 'non-compliant').length;
  const naItems = Object.values(inspectionData.answers).filter(a => a.status === 'na').length;
  const applicableItems = compliantItems + nonCompliantItems;
  const complianceScore = applicableItems > 0 ? Math.round((compliantItems / applicableItems) * 100) : 0;

  const clearInspectorSignature = () => {
    inspectorSigRef.current?.clear();
    setInspectorSignature(null);
  };

  const clearMasterSignature = () => {
    masterSigRef.current?.clear();
    setMasterSignature(null);
  };

  const saveInspectorSignature = () => {
    if (inspectorSigRef.current && !inspectorSigRef.current.isEmpty()) {
      setInspectorSignature(inspectorSigRef.current.toDataURL('image/png'));
    }
  };

  const saveMasterSignature = () => {
    if (masterSigRef.current && !masterSigRef.current.isEmpty()) {
      setMasterSignature(masterSigRef.current.toDataURL('image/png'));
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const JsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      const pdf = new JsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // ============================================
      // COVER PAGE
      // ============================================
      
      // Header gradient background
      pdf.setFillColor(0, 82, 147); // ILO Blue
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      // Secondary accent
      pdf.setFillColor(0, 123, 193);
      pdf.rect(0, 55, pageWidth, 5, 'F');

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MLC 2006 INSPECTION REPORT', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Maritime Labour Convention 2006', pageWidth / 2, 35, { align: 'center' });
      pdf.text('(as amended through 2022)', pageWidth / 2, 42, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Report Generated: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 52, { align: 'center' });

      // Vessel Information Box
      let y = 75;
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, y - 5, contentWidth, 55, 3, 3, 'F');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 82, 147);
      pdf.text('VESSEL INFORMATION', margin + 5, y + 5);
      
      y += 15;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const vesselData = [
        ['Vessel Name:', inspectionData.vesselName || 'N/A'],
        ['IMO Number:', inspectionData.imo || 'N/A'],
        ['Flag State:', inspectionData.flag || 'N/A'],
        ['Port of Inspection:', inspectionData.port || 'N/A'],
        ['Inspector:', inspectionData.inspectorName || 'N/A'],
        ['Inspection Date:', inspectionData.startDate || new Date().toISOString().split('T')[0]],
      ];

      vesselData.forEach((row, index) => {
        const xPos = margin + 5 + (index % 2) * (contentWidth / 2);
        const yPos = y + Math.floor(index / 2) * 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text(row[0], xPos, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(row[1], xPos + 35, yPos);
      });

      // Compliance Score Box
      y = 145;
      const scoreColor = complianceScore >= 90 ? [34, 139, 34] : complianceScore >= 70 ? [255, 165, 0] : [220, 53, 69];
      
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.roundedRect(pageWidth / 2 - 30, y, 60, 35, 5, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${complianceScore}%`, pageWidth / 2, y + 22, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('COMPLIANCE', pageWidth / 2, y + 32, { align: 'center' });

      // Summary Statistics
      y = 195;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSPECTION SUMMARY', margin, y);
      
      y += 10;
      autoTable(pdf, {
        startY: y,
        head: [['Metric', 'Count', 'Status']],
        body: [
          ['Total Items Inspected', totalItems.toString(), '✓'],
          ['Compliant Items', compliantItems.toString(), complianceScore >= 70 ? '✓' : '⚠'],
          ['Non-Compliant Items', nonCompliantItems.toString(), nonCompliantItems > 0 ? '⚠' : '✓'],
          ['Not Applicable', naItems.toString(), '-'],
          ['Compliance Score', `${complianceScore}%`, complianceScore >= 90 ? '✓' : complianceScore >= 70 ? '⚠' : '✗'],
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 82, 147], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
        margin: { left: margin, right: margin },
      });

      // Executive Summary (if provided)
      if (executiveSummary) {
        y = (pdf as any).lastAutoTable.finalY + 15;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 82, 147);
        pdf.text('EXECUTIVE SUMMARY', margin, y);
        
        y += 8;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const summaryLines = pdf.splitTextToSize(executiveSummary, contentWidth);
        pdf.text(summaryLines, margin, y);
      }

      // ============================================
      // RESULTS BY MLC TITLE
      // ============================================
      pdf.addPage();
      y = 20;
      
      // Header
      pdf.setFillColor(0, 82, 147);
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSPECTION RESULTS BY MLC TITLE', pageWidth / 2, 10, { align: 'center' });

      y = 25;
      pdf.setTextColor(0, 0, 0);

      MLC_2022_TITLES.forEach((title) => {
        // Calculate title statistics
        let titleCompliant = 0;
        let titleNonCompliant = 0;
        let titleNA = 0;

        title.regulations.forEach(reg => {
          reg.items.forEach(item => {
            const answer = inspectionData.answers[item.id];
            if (answer?.status === 'compliant') titleCompliant++;
            else if (answer?.status === 'non-compliant') titleNonCompliant++;
            else if (answer?.status === 'na') titleNA++;
          });
        });

        const titleTotal = titleCompliant + titleNonCompliant;
        const titleScore = titleTotal > 0 ? Math.round((titleCompliant / titleTotal) * 100) : 0;

        // Check if need new page
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = 20;
        }

        // Title header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 3, contentWidth, 10, 'F');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 82, 147);
        pdf.text(`Title ${title.number}: ${title.title}`, margin + 3, y + 4);
        
        // Score badge
        const badgeColor = titleScore >= 90 ? [34, 139, 34] : titleScore >= 70 ? [255, 165, 0] : [220, 53, 69];
        pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        pdf.roundedRect(pageWidth - margin - 25, y - 2, 22, 8, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(`${titleScore}%`, pageWidth - margin - 14, y + 4, { align: 'center' });

        y += 12;
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Compliant: ${titleCompliant} | Non-Compliant: ${titleNonCompliant} | N/A: ${titleNA}`, margin + 3, y);
        
        y += 10;
      });

      // ============================================
      // NON-CONFORMITIES DETAIL
      // ============================================
      const ncsFromAnswers = Object.entries(inspectionData.answers)
        .filter(([_, answer]) => answer.status === 'non-compliant')
        .map(([itemId, answer]) => {
          const item = getItemById(itemId);
          return {
            itemId,
            title: item?.title || itemId,
            regulation: item?.regulation || '-',
            observation: answer.observation || 'Não conforme - verificação necessária',
          };
        });

      if (ncsFromAnswers.length > 0) {
        pdf.addPage();
        y = 20;

        pdf.setFillColor(220, 53, 69);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`NON-CONFORMITIES (${ncsFromAnswers.length})`, pageWidth / 2, 10, { align: 'center' });

        y = 25;
        
        const ncTableData = ncsFromAnswers.map((nc, index) => [
          (index + 1).toString(),
          nc.itemId,
          nc.title.substring(0, 40) + (nc.title.length > 40 ? '...' : ''),
          nc.observation.substring(0, 60) + (nc.observation.length > 60 ? '...' : ''),
        ]);

        autoTable(pdf, {
          startY: y,
          head: [['#', 'Item', 'Description', 'Observation']],
          body: ncTableData,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20 },
            2: { cellWidth: 60 },
            3: { cellWidth: 80 },
          },
          margin: { left: margin, right: margin },
        });
      }

      // ============================================
      // ACTION PLAN
      // ============================================
      if (ncsFromAnswers.length > 0 || actionPlanNotes) {
        pdf.addPage();
        y = 20;

        pdf.setFillColor(255, 165, 0);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CORRECTIVE ACTION PLAN', pageWidth / 2, 10, { align: 'center' });

        y = 25;

        if (ncsFromAnswers.length > 0) {
          const actionPlanData = ncsFromAnswers.map((nc, index) => {
            const item = getItemById(nc.itemId);
            return [
              (index + 1).toString(),
              nc.itemId,
              nc.title.substring(0, 30) + '...',
              'Immediate verification and correction required',
              'Ship Owner / Operator',
              '14 days',
              'Open',
            ];
          });

          autoTable(pdf, {
            startY: y,
            head: [['#', 'Item', 'Issue', 'Action', 'Responsible', 'Deadline', 'Status']],
            body: actionPlanData,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [255, 165, 0], textColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 8, halign: 'center' },
              1: { cellWidth: 15 },
              2: { cellWidth: 35 },
              3: { cellWidth: 50 },
              4: { cellWidth: 30 },
              5: { cellWidth: 18 },
              6: { cellWidth: 15, halign: 'center' },
            },
            margin: { left: margin, right: margin },
          });
        }

        if (actionPlanNotes) {
          y = (pdf as any).lastAutoTable?.finalY || y + 10;
          y += 15;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Additional Notes:', margin, y);
          
          y += 8;
          pdf.setFont('helvetica', 'normal');
          const notesLines = pdf.splitTextToSize(actionPlanNotes, contentWidth);
          pdf.text(notesLines, margin, y);
        }
      }

      // ============================================
      // SIGNATURES PAGE
      // ============================================
      pdf.addPage();
      y = 20;

      pdf.setFillColor(0, 82, 147);
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DECLARATION & SIGNATURES', pageWidth / 2, 10, { align: 'center' });

      y = 30;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const declaration = `This report documents the findings of the MLC 2006 inspection conducted on the vessel named above. The inspection was carried out in accordance with the requirements of the Maritime Labour Convention, 2006 (as amended) and applicable flag State requirements.

The undersigned parties hereby confirm that:
1. The inspection was conducted fairly and thoroughly
2. All findings are accurately documented
3. The vessel's Master was informed of all non-conformities found
4. The corrective action plan has been discussed and agreed upon`;

      const declLines = pdf.splitTextToSize(declaration, contentWidth);
      pdf.text(declLines, margin, y);

      y += 55;

      // Signature boxes
      const sigBoxWidth = (contentWidth - 20) / 2;
      
      // Inspector signature
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, y, sigBoxWidth, 50);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Inspector Signature', margin + sigBoxWidth / 2, y + 8, { align: 'center' });
      
      if (inspectorSignature) {
        pdf.addImage(inspectorSignature, 'PNG', margin + 10, y + 12, sigBoxWidth - 20, 25);
      }
      
      pdf.line(margin + 10, y + 42, margin + sigBoxWidth - 10, y + 42);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(inspectionData.inspectorName || 'Inspector Name', margin + sigBoxWidth / 2, y + 48, { align: 'center' });

      // Master signature
      const masterX = margin + sigBoxWidth + 20;
      pdf.rect(masterX, y, sigBoxWidth, 50);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Master's Signature", masterX + sigBoxWidth / 2, y + 8, { align: 'center' });
      
      if (masterSignature) {
        pdf.addImage(masterSignature, 'PNG', masterX + 10, y + 12, sigBoxWidth - 20, 25);
      }
      
      pdf.line(masterX + 10, y + 42, masterX + sigBoxWidth - 10, y + 42);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text("Vessel Master", masterX + sigBoxWidth / 2, y + 48, { align: 'center' });

      // Date and place
      y += 65;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
      pdf.text(`Place: ${inspectionData.port || 'N/A'}`, pageWidth / 2, y);

      // ============================================
      // FOOTER ON ALL PAGES
      // ============================================
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(0, 82, 147);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('MLC 2006 Inspection Report - Nautilus One Maritime HR Platform', margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      // Save PDF
      const filename = `MLC-Report-${inspectionData.vesselName?.replace(/\s+/g, '-') || 'Vessel'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast.success('Relatório PDF gerado com sucesso!', {
        description: `Arquivo: ${filename}`
      });

    } catch (error) {
      logger.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF', {
        description: 'Verifique os dados e tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate PDF and return base64
  const generatePDFBase64 = async (): Promise<string> => {
    const JsPDF = await getJsPDF();
    const autoTable = await getAutoTable();
    const pdf = new JsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Simplified cover page for email attachment
    pdf.setFillColor(0, 82, 147);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    pdf.setFillColor(0, 123, 193);
    pdf.rect(0, 55, pageWidth, 5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MLC 2006 INSPECTION REPORT', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Maritime Labour Convention 2006 (as amended 2022)', pageWidth / 2, 38, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 52, { align: 'center' });

    // Vessel info
    let y = 75;
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y - 5, contentWidth, 45, 3, 3, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 82, 147);
    pdf.text('VESSEL INFORMATION', margin + 5, y + 5);
    
    y += 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Vessel: ${inspectionData.vesselName || 'N/A'}`, margin + 5, y);
    pdf.text(`IMO: ${inspectionData.imo || 'N/A'}`, pageWidth / 2, y);
    y += 8;
    pdf.text(`Flag: ${inspectionData.flag || 'N/A'}`, margin + 5, y);
    pdf.text(`Port: ${inspectionData.port || 'N/A'}`, pageWidth / 2, y);
    y += 8;
    pdf.text(`Inspector: ${inspectionData.inspectorName || 'N/A'}`, margin + 5, y);
    pdf.text(`Date: ${inspectionData.startDate}`, pageWidth / 2, y);

    // Compliance score
    y = 135;
    const scoreColor = complianceScore >= 90 ? [34, 139, 34] : complianceScore >= 70 ? [255, 165, 0] : [220, 53, 69];
    pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.roundedRect(pageWidth / 2 - 30, y, 60, 35, 5, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${complianceScore}%`, pageWidth / 2, y + 22, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text('COMPLIANCE', pageWidth / 2, y + 32, { align: 'center' });

    // Summary table
    y = 185;
    pdf.setTextColor(0, 0, 0);
    autoTable(pdf, {
      startY: y,
      head: [['Metric', 'Count']],
      body: [
        ['Total Items', totalItems.toString()],
        ['Compliant', compliantItems.toString()],
        ['Non-Compliant', nonCompliantItems.toString()],
        ['N/A', naItems.toString()],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 82, 147] },
      margin: { left: margin, right: margin },
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('MLC 2006 Inspection Report - Nautilus One Maritime HR Platform', margin, pageHeight - 10);
    pdf.text('Page 1 of 1', pageWidth - margin, pageHeight - 10, { align: 'right' });

    // Return base64 without data URI prefix
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    return pdfBase64;
  };

  // Send report via email with PDF attachment
  const sendReportByEmail = async () => {
    if (!shipownerEmail) {
      toast.error('Informe o email do armador');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Generate PDF first
      toast.info('Gerando PDF para anexo...');
      const pdfBase64 = await generatePDFBase64();
      const filename = `MLC-Report-${inspectionData.vesselName?.replace(/\s+/g, '-') || 'Vessel'}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Build non-conformities list
      const ncsFromAnswers = Object.entries(inspectionData.answers)
        .filter(([_, answer]) => answer.status === 'non-compliant')
        .map(([itemId]) => {
          const item = getItemById(itemId);
          return {
            itemId,
            title: item?.title || itemId,
            severity: 'medium' as const,
            correctiveAction: 'Immediate verification required',
            deadline: '14 days',
          };
        });

      // Parse additional emails
      const additionalRecipients = additionalEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.includes('@'));

      // Call edge function with PDF attachment
      const { error } = await supabase.functions.invoke('send-mlc-report', {
        body: {
          shipownerEmail,
          shipownerName: shipownerName || 'Ship Owner',
          flagStateEmail: flagStateEmail || undefined,
          additionalRecipients: additionalRecipients.length > 0 ? additionalRecipients : undefined,
          vesselName: inspectionData.vesselName,
          imoNumber: inspectionData.imo,
          flagState: inspectionData.flag,
          portOfInspection: inspectionData.port,
          inspectorName: inspectionData.inspectorName,
          inspectionDate: inspectionData.startDate,
          complianceScore,
          totalItems,
          compliantItems,
          nonCompliantItems,
          naItems,
          nonConformities: ncsFromAnswers,
          additionalNotes: executiveSummary || undefined,
          // PDF attachment
          pdfAttachment: pdfBase64,
          pdfFilename: filename,
        },
      });

      if (error) throw error;

      toast.success('Relatório enviado por email com PDF anexo!', {
        description: `Enviado para ${shipownerEmail}${flagStateEmail ? ` e ${flagStateEmail}` : ''}`,
      });

      setShowEmailDialog(false);
    } catch (error) {
      logger.error('Error sending email:', error);
      toast.error('Erro ao enviar email', {
        description: 'Verifique os endereços e tente novamente.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Gerador de Relatório MLC
          </CardTitle>
          <CardDescription>
            Gere relatório PDF profissional da inspeção com assinaturas digitais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{compliantItems}</div>
              <div className="text-xs text-muted-foreground">Conforme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{nonCompliantItems}</div>
              <div className="text-xs text-muted-foreground">Não Conforme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{naItems}</div>
              <div className="text-xs text-muted-foreground">N/A</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${complianceScore >= 90 ? 'text-green-500' : complianceScore >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
                {complianceScore}%
              </div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>

          <Separator />

          {/* Executive Summary */}
          <div className="space-y-2">
            <Label>Resumo Executivo (opcional)</Label>
            <Textarea
              placeholder="Descreva as principais conclusões da inspeção..."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Plan Notes */}
          <div className="space-y-2">
            <Label>Notas do Plano de Ação (opcional)</Label>
            <Textarea
              placeholder="Observações adicionais sobre o plano de ação..."
              value={actionPlanNotes}
              onChange={(e) => setActionPlanNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Separator />

          {/* Signatures */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              Assinaturas Digitais
            </Label>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Inspector Signature */}
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Assinatura do Inspetor</span>
                  {inspectorSignature && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Assinado
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Pen className="h-4 w-4 mr-2" />
                      {inspectorSignature ? 'Editar Assinatura' : 'Adicionar Assinatura'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assinatura do Inspetor</DialogTitle>
                    </DialogHeader>
                    <div className="border rounded-lg bg-white">
                      <SignatureCanvas
                        ref={inspectorSigRef}
                        canvasProps={{
                          width: 400,
                          height: 150,
                          className: 'signature-canvas',
                        }}
                        backgroundColor="white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={clearInspectorSignature}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Limpar
                      </Button>
                      <Button onClick={saveInspectorSignature}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Salvar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Master Signature */}
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Assinatura do Comandante</span>
                  {masterSignature && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Assinado
                    </Badge>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Pen className="h-4 w-4 mr-2" />
                      {masterSignature ? 'Editar Assinatura' : 'Adicionar Assinatura'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assinatura do Comandante</DialogTitle>
                    </DialogHeader>
                    <div className="border rounded-lg bg-white">
                      <SignatureCanvas
                        ref={masterSigRef}
                        canvasProps={{
                          width: 400,
                          height: 150,
                          className: 'signature-canvas',
                        }}
                        backgroundColor="white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={clearMasterSignature}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Limpar
                      </Button>
                      <Button onClick={saveMasterSignature}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Salvar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Separator />

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={generatePDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Baixar PDF
                </>
              )}
            </Button>

            {/* Email Button */}
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar por Email
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Enviar Relatório MLC por Email
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipownerEmail">Email do Armador *</Label>
                    <Input
                      id="shipownerEmail"
                      type="email"
                      placeholder="armador@empresa.com"
                      value={shipownerEmail}
                      onChange={(e) => setShipownerEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipownerName">Nome do Armador</Label>
                    <Input
                      id="shipownerName"
                      placeholder="Nome do Armador"
                      value={shipownerName}
                      onChange={(e) => setShipownerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flagStateEmail">Email do Flag State (opcional)</Label>
                    <Input
                      id="flagStateEmail"
                      type="email"
                      placeholder="flagstate@maritime.gov"
                      value={flagStateEmail}
                      onChange={(e) => setFlagStateEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalEmails">Emails Adicionais (separados por vírgula)</Label>
                    <Input
                      id="additionalEmails"
                      placeholder="email1@example.com, email2@example.com"
                      value={additionalEmails}
                      onChange={(e) => setAdditionalEmails(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Embarcação:</span>
                      <span className="font-medium">{inspectionData.vesselName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score:</span>
                      <span className={`font-medium ${complianceScore >= 90 ? 'text-green-500' : complianceScore >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
                        {complianceScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Não Conformidades:</span>
                      <span className="font-medium text-red-500">{nonCompliantItems}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={sendReportByEmail}
                    disabled={isSendingEmail || !shipownerEmail}
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Relatório
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
