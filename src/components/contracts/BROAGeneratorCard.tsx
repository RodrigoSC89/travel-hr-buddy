/**
 * BROAGeneratorCard - Gerador de BROA com IA
 * Boletim de Registro de Ocorrências e Avarias - Padrão Marinha/ANTAQ
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getJsPDF } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';
import {
  FileCheck, Brain, Download, Eye, Loader2, Ship, Calendar,
  User, Signature, AlertTriangle, Clock, CheckCircle, XCircle,
  FileText, Printer, Share2, Plus
} from "lucide-react";

interface DowntimeEvent {
  id: string;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  reason: string | null;
  reason_category: string | null;
  impact_level: string | null;
}

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  mmsi?: string;
  flag_state?: string;
}

interface Contract {
  id: string;
  contract_number: string;
  client_name: string;
}

interface BROARecord {
  broa_number: string;
  content: string;
  vessel_name: string;
  occurrence_date: string;
  system_affected: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'finalized';
  signatures_required: Array<{ role: string; signed: boolean; signed_at?: string }>;
  generated_at: string;
  cause_analysis?: string;
  corrective_actions?: string[];
}

interface BROAGeneratorCardProps {
  events: DowntimeEvent[];
  vessels?: Vessel[];
  contracts?: Contract[];
  onBROAGenerated?: (broa: BROARecord) => void;
}

export function BROAGeneratorCard({ events, vessels = [], contracts = [], onBROAGenerated }: BROAGeneratorCardProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [broaRecords, setBroaRecords] = useState<BROARecord[]>([]);
  const [selectedBROA, setSelectedBROA] = useState<BROARecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    vessel_name: '',
    occurrence_description: '',
    system_affected: '',
    corrective_actions: ''
  });

  const generateBROA = async (event: DowntimeEvent) => {
    setGenerating(event.id);

    try {
      const vessel = vessels[0] || { 
        name: 'Embarcação Principal', 
        imo_number: 'IMO-0000000',
        mmsi: '000000000',
        flag_state: 'Brasil'
      };
      
      const contract = contracts[0];

      const { data, error } = await supabase.functions.invoke('generate-broa', {
        body: {
          downtime_event: {
            start_time: event.start_time,
            end_time: event.end_time,
            reason: event.reason,
            system_affected: event.reason_category,
            impact_level: event.impact_level,
            duration_hours: event.duration_hours
          },
          vessel: {
            name: vessel.name,
            imo_number: vessel.imo_number,
            mmsi: vessel.mmsi,
            flag_state: vessel.flag_state
          },
          contract: contract ? {
            contract_number: contract.contract_number,
            client: contract.client_name
          } : null,
          evidence_files: []
        }
      });

      if (error) throw error;

      const broaRecord: BROARecord = {
        broa_number: data.broa_number,
        content: data.content,
        vessel_name: data.vessel_name,
        occurrence_date: data.occurrence_date,
        system_affected: data.system_affected,
        status: 'draft',
        signatures_required: data.signatures_required,
        generated_at: data.generated_at,
        cause_analysis: data.cause_analysis,
        corrective_actions: data.corrective_actions
      };

      setBroaRecords(prev => [broaRecord, ...prev]);
      setSelectedBROA(broaRecord);
      setShowPreview(true);
      
      toast.success(`BROA ${broaRecord.broa_number} gerado com sucesso!`);
      onBROAGenerated?.(broaRecord);

    } catch (error) {
      logger.error("BROA generation error:", error);
      toast.error("Erro ao gerar BROA");
    } finally {
      setGenerating(null);
    }
  };

  const exportToPDF = async (broa: BROARecord) => {
    const JsPDF = await getJsPDF();
    const doc = new JsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BROA - BOLETIM DE REGISTRO DE OCORRÊNCIAS E AVARIAS', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nº: ${broa.broa_number}`, pageWidth / 2, 28, { align: 'center' });
    
    // Vessel Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA EMBARCAÇÃO', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${broa.vessel_name}`, 14, 48);
    doc.text(`Data da Ocorrência: ${new Date(broa.occurrence_date).toLocaleDateString('pt-BR')}`, 14, 54);
    doc.text(`Sistema Afetado: ${broa.system_affected || 'N/A'}`, 14, 60);
    
    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIÇÃO DA OCORRÊNCIA', 14, 74);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const splitContent = doc.splitTextToSize(broa.content, pageWidth - 28);
    doc.text(splitContent, 14, 82);
    
    // Footer with signatures
    const signatureY = doc.internal.pageSize.getHeight() - 50;
    doc.setFontSize(9);
    doc.text('ASSINATURAS:', 14, signatureY);
    
    broa.signatures_required.forEach((sig, idx) => {
      const x = 14 + (idx * 60);
      doc.text('________________________', x, signatureY + 15);
      doc.text(sig.role, x, signatureY + 22);
    });
    
    doc.save(`${broa.broa_number}.pdf`);
    toast.success('BROA exportado para PDF');
  };

  const getStatusBadge = (status: BROARecord['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Aprovado</Badge>;
      case 'finalized':
        return <Badge variant="default">Finalizado</Badge>;
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      'mechanical': 'Mecânico',
      'electrical': 'Elétrico',
      'weather': 'Clima',
      'operational': 'Operacional',
      'regulatory': 'Regulatório',
      'other': 'Outro'
    };
    return labels[category || ''] || category || 'N/A';
  };

  const pendingEvents = events.filter(e => 
    !broaRecords.some(b => b.occurrence_date === e.start_time)
  );

  return (
    <>
      <Card className="border-green-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                BROA - Gerador com IA
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Boletim de Registro de Ocorrências e Avarias conforme padrão ANTAQ/Marinha
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowManualForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Eventos para gerar BROA */}
          {pendingEvents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Eventos Pendentes de BROA ({pendingEvents.length})
              </h4>
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {pendingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          event.impact_level === 'critical' ? 'bg-red-500/20' : 
                          event.impact_level === 'high' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            event.impact_level === 'critical' ? 'text-red-500' : 
                            event.impact_level === 'high' ? 'text-orange-500' : 'text-yellow-500'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {event.reason || 'Ocorrência não especificada'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.duration_hours ? `${event.duration_hours.toFixed(1)}h` : 'N/A'}
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(event.reason_category)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generateBROA(event)}
                        disabled={generating === event.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {generating === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-1" />
                            Gerar BROA
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <Separator />

          {/* BROAs Gerados */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-green-500" />
              BROAs Gerados ({broaRecords.length})
            </h4>
            
            {broaRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum BROA gerado ainda</p>
                <p className="text-xs mt-1">Selecione um evento acima para gerar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {broaRecords.map((broa) => (
                  <div 
                    key={broa.broa_number}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{broa.broa_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {broa.vessel_name} • {new Date(broa.occurrence_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(broa.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedBROA(broa); setShowPreview(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportToPDF(broa)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingEvents.length === 0 && broaRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum evento de downtime para gerar BROA</p>
              <p className="text-xs mt-1">Registre eventos de downtime primeiro</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-500" />
              {selectedBROA?.broa_number || 'BROA'}
            </DialogTitle>
          </DialogHeader>
          {selectedBROA && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Embarcação</Label>
                    <p className="font-medium">{selectedBROA.vessel_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Data da Ocorrência</Label>
                    <p className="font-medium">
                      {new Date(selectedBROA.occurrence_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sistema Afetado</Label>
                    <p className="font-medium">{getCategoryLabel(selectedBROA.system_affected)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedBROA.status)}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h5 className="text-sm font-medium mb-2">Descrição da Ocorrência</h5>
                  <p className="text-sm whitespace-pre-wrap">{selectedBROA.content}</p>
                </div>

                {/* Cause Analysis */}
                {selectedBROA.cause_analysis && (
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      Análise de Causa
                    </h5>
                    <p className="text-sm">{selectedBROA.cause_analysis}</p>
                  </div>
                )}

                {/* Corrective Actions */}
                {selectedBROA.corrective_actions && selectedBROA.corrective_actions.length > 0 && (
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-500">
                      <CheckCircle className="h-4 w-4" />
                      Ações Corretivas
                    </h5>
                    <ul className="space-y-1">
                      {selectedBROA.corrective_actions.map((action, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Signatures */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <h5 className="text-sm font-medium mb-3">Assinaturas Requeridas</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedBROA.signatures_required.map((sig, idx) => (
                      <div key={idx} className="text-center p-3 border rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                          {sig.signed ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{sig.role}</p>
                        <Badge variant={sig.signed ? 'default' : 'outline'} className="mt-1">
                          {sig.signed ? 'Assinado' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
            <Button variant="outline" onClick={() => selectedBROA && exportToPDF(selectedBROA)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={() => {
              if (!selectedBROA) return;
              const updated = { ...selectedBROA };
              const pending = updated.signatures_required.find(s => !s.signed);
              if (pending) {
                pending.signed = true;
                pending.signed_at = new Date().toISOString();
                setSelectedBROA({ ...updated });
                setBroaRecords(prev => prev.map(b => b.broa_number === updated.broa_number ? updated : b));
                toast.success(`Assinatura de "${pending.role}" registrada`);
                if (updated.signatures_required.every(s => s.signed)) {
                  updated.status = 'finalized';
                  setSelectedBROA({ ...updated });
                  toast.success('BROA finalizado — todas as assinaturas coletadas');
                }
              } else {
                toast.info('Todas as assinaturas já foram coletadas');
              }
            }}>
              <Signature className="h-4 w-4 mr-2" />
              Assinar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Form Dialog */}
      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar BROA Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Embarcação</Label>
              <Input 
                placeholder="Ex: Vessel Neptune"
                value={manualData.vessel_name}
                onChange={(e) => setManualData(prev => ({ ...prev, vessel_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sistema Afetado</Label>
              <Input 
                placeholder="Ex: Motor Principal"
                value={manualData.system_affected}
                onChange={(e) => setManualData(prev => ({ ...prev, system_affected: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição da Ocorrência</Label>
              <Textarea 
                placeholder="Descreva detalhadamente a ocorrência..."
                rows={4}
                value={manualData.occurrence_description}
                onChange={(e) => setManualData(prev => ({ ...prev, occurrence_description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ações Corretivas</Label>
              <Textarea 
                placeholder="Descreva as ações tomadas..."
                rows={3}
                value={manualData.corrective_actions}
                onChange={(e) => setManualData(prev => ({ ...prev, corrective_actions: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={() => {
              const manualBROA: BROARecord = {
                broa_number: `BROA-${Date.now()}-MAN`,
                content: manualData.occurrence_description,
                vessel_name: manualData.vessel_name || 'Embarcação',
                occurrence_date: new Date().toISOString(),
                system_affected: manualData.system_affected,
                status: 'draft',
                signatures_required: [
                  { role: 'Comandante', signed: false },
                  { role: 'Chefe de Máquinas', signed: false },
                  { role: 'Oficial de Serviço', signed: false }
                ],
                generated_at: new Date().toISOString(),
                corrective_actions: manualData.corrective_actions ? [manualData.corrective_actions] : []
              };
              setBroaRecords(prev => [manualBROA, ...prev]);
              setShowManualForm(false);
              toast.success('BROA criado manualmente');
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Criar BROA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BROAGeneratorCard;
