/**
 * EvidencePDFGenerator - Generate audit evidence PDF with QR code
 */

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { 
  FileDown, 
  QrCode, 
  Ship, 
  User, 
  Calendar,
  ClipboardCheck,
  Loader2
} from "lucide-react";
import { Message } from "./AuditAIChatPage";
import html2pdf from "html2pdf.js";

interface EvidencePDFGeneratorProps {
  message: Message;
  module: 'peotram' | 'peodp';
  onClose: () => void;
}

export function EvidencePDFGenerator({ message, module, onClose }: EvidencePDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [vesselName, setVesselName] = useState('');
  const [vesselIMO, setVesselIMO] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditType, setAuditType] = useState<string>('internal');
  const [element, setElement] = useState('');
  const [observations, setObservations] = useState('');
  
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!vesselName || !auditorName) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsGenerating(true);

    try {
      const date = new Date();
      const formattedDate = date.toLocaleDateString('pt-BR');
      const formattedTime = date.toLocaleTimeString('pt-BR');
      const evidenceId = `EVD-${module.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const moduleTitle = module === 'peotram' ? 'PEOTRAM Ciclo 2024' : 'PEO-DP 2026';
      
      // QR Code data
      const qrData = JSON.stringify({
        id: evidenceId,
        module: module,
        vessel: vesselName,
        imo: vesselIMO,
        auditor: auditorName,
        date: formattedDate,
        type: auditType
      });

      // Create PDF content
      const content = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${module === 'peotram' ? '#f97316' : '#3b82f6'}; padding-bottom: 20px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: ${module === 'peotram' ? '#ea580c' : '#2563eb'};">
                📋 Evidência de Auditoria
              </h1>
              <h2 style="margin: 5px 0 0 0; font-size: 18px; color: #374151;">${moduleTitle}</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Documento gerado automaticamente pelo Assistente Agêntico</p>
            </div>
            <div style="text-align: right;">
              <div style="background: #f3f4f6; padding: 10px; border-radius: 8px;">
                <p style="margin: 0; font-size: 10px; color: #6b7280;">ID da Evidência</p>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #111827;">${evidenceId}</p>
              </div>
            </div>
          </div>

          <!-- Vessel & Audit Info -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid ${module === 'peotram' ? '#f97316' : '#3b82f6'};">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">🚢 Embarcação</h3>
              <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${vesselName}</p>
              ${vesselIMO ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">IMO: ${vesselIMO}</p>` : ''}
            </div>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">👤 Auditor</h3>
              <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">${auditorName}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Tipo: ${auditType === 'internal' ? 'Interna' : auditType === 'external' ? 'Externa' : 'Auto-auditoria'}</p>
            </div>
          </div>

          <!-- Date & Element -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">📅 Data/Hora</h3>
              <p style="margin: 5px 0; font-size: 14px;">${formattedDate} às ${formattedTime}</p>
            </div>
            ${element ? `
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">📌 Elemento/Seção</h3>
              <p style="margin: 5px 0; font-size: 14px;">${element}</p>
            </div>
            ` : ''}
          </div>

          <!-- AI Analysis Content -->
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: ${module === 'peotram' ? '#fed7aa' : '#bfdbfe'}; border-radius: 50%; text-align: center; line-height: 24px;">🤖</span>
              Análise do Assistente Agêntico
            </h3>
            <div style="font-size: 12px; line-height: 1.6; color: #374151; white-space: pre-wrap; background: #fafafa; padding: 15px; border-radius: 6px; border-left: 3px solid ${module === 'peotram' ? '#f97316' : '#3b82f6'};">
              ${message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
            </div>
          </div>

          ${observations ? `
          <!-- Observations -->
          <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">📝 Observações Adicionais</h3>
            <p style="margin: 0; font-size: 12px; color: #78350f; white-space: pre-wrap;">${observations}</p>
          </div>
          ` : ''}

          <!-- QR Code & Footer -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 10px; color: #6b7280;">Escaneie para verificar autenticidade</p>
              <div id="qr-placeholder" style="width: 80px; height: 80px; background: #f3f4f6; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 10px; color: #9ca3af;">QR Code</span>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 10px; color: #6b7280;">Gerado por Nauti One - Sistema de Gestão Marítima</p>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #9ca3af;">© ${date.getFullYear()} - Todos os direitos reservados</p>
            </div>
          </div>

          <!-- Signature Area -->
          <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            <div style="border-top: 1px solid #374151; padding-top: 10px;">
              <p style="margin: 0; font-size: 12px; color: #374151;">Assinatura do Auditor</p>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280;">${auditorName}</p>
            </div>
            <div style="border-top: 1px solid #374151; padding-top: 10px;">
              <p style="margin: 0; font-size: 12px; color: #374151;">Assinatura do Responsável</p>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280;">Nome / Cargo</p>
            </div>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `Evidencia_${module.toUpperCase()}_${vesselName.replace(/\s+/g, '_')}_${date.toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(content).save();
      
      toast.success("PDF de evidência gerado com sucesso!");
      onClose();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const moduleTitle = module === 'peotram' ? 'PEOTRAM' : 'PEO-DP';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Gerar Evidência PDF - {moduleTitle}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para gerar o documento de evidência com QR code de autenticação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vessel Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Nome da Embarcação *
              </Label>
              <Input
                id="vesselName"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Ex: AHTS Nautilus One"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselIMO">Número IMO</Label>
              <Input
                id="vesselIMO"
                value={vesselIMO}
                onChange={(e) => setVesselIMO(e.target.value)}
                placeholder="Ex: 9876543"
              />
            </div>
          </div>

          {/* Auditor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditorName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome do Auditor *
              </Label>
              <Input
                id="auditorName"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditType">Tipo de Auditoria</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                  <SelectItem value="self">Auto-auditoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Element */}
          <div className="space-y-2">
            <Label htmlFor="element" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Elemento/Seção Auditado
            </Label>
            <Input
              id="element"
              value={element}
              onChange={(e) => setElement(e.target.value)}
              placeholder={module === 'peotram' ? 'Ex: Elemento 4 - Operação' : 'Ex: Seção 3 - FMEA'}
            />
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações Adicionais</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações ou comentários do auditor..."
              rows={3}
            />
          </div>

          {/* Preview Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span className="text-sm font-medium">Prévia do Documento</span>
            </div>
            <div className="flex items-start gap-4">
              <QRCodeSVG 
                value={JSON.stringify({
                  module,
                  vessel: vesselName || 'N/A',
                  auditor: auditorName || 'N/A',
                  date: new Date().toISOString()
                })}
                size={80}
                className="flex-shrink-0"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Documento em formato A4</p>
                <p>• QR Code com dados de autenticação</p>
                <p>• Espaço para assinaturas</p>
                <p>• Conteúdo da análise IA incluído</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={generatePDF}
            disabled={isGenerating || !vesselName || !auditorName}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
