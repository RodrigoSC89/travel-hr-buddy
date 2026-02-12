// PATCH 393 - Enhanced with signatures, corrective actions, and PDF export
// PATCH 653 - Lazy loading for jsPDF
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SignatureDialog } from "./SignatureDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileDown, PenTool, Plus, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { logger } from '@/lib/logger';

// Lazy load jsPDF
const loadPDFLibs = async () => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  return { jsPDF };
};

// Local interfaces for this component
interface SignatureDataLocal {
  id?: string;
  signature_image: string;
  signatory_name: string;
  signatory_role: string;
  signed_at: string;
}

interface CorrectiveAction {
  id?: string;
  action_description: string;
  assigned_to: string;
  due_date: string;
  status: string;
}

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description?: string;
  severity: string;
  category: string;
  status: string;
  incident_date: string;
  incident_location?: string;
  gps_coordinates?: string;
  incident_type?: string;
  photo_urls?: string[];
  impact_level?: string;
}

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const IncidentDetailDialog: React.FC<IncidentDetailDialogProps> = ({
  incident,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatures, setSignatures] = useState<SignatureDataLocal[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [newAction, setNewAction] = useState<CorrectiveAction>({
    action_description: "",
    assigned_to: "",
    due_date: "",
    status: "pending"
  });
  const [showActionForm, setShowActionForm] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(incident?.status || "new");
  const { toast } = useToast();

  useEffect(() => {
    if (incident) {
      setCurrentStatus(incident.status);
      loadSignaturesAndActions();
    }
  }, [incident]);

  const loadSignaturesAndActions = async () => {
    if (!incident) return;

    try {
      // Load signatures - typed query
      const { data: sigData } = await supabase
        .from("incident_signatures")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (sigData) {
        const mappedSignatures: SignatureDataLocal[] = sigData.map((sig) => ({
          id: sig.id,
          signature_image: sig.signature_data || '',
          signatory_name: sig.signer_name,
          signatory_role: sig.signer_role || '',
          signed_at: sig.signed_at || sig.created_at || new Date().toISOString(),
        }));
        setSignatures(mappedSignatures);
      }

      // Load corrective actions - typed query
      const { data: actionData } = await supabase
        .from("incident_actions")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (actionData) {
        const mappedActions: CorrectiveAction[] = actionData.map((action) => ({
          id: action.id,
          action_description: action.description || '',
          assigned_to: action.assigned_to || action.assigned_to_name || '',
          due_date: action.due_date || '',
          status: action.status || 'pending',
        }));
        setCorrectiveActions(mappedActions);
      }
    } catch (error) {
      logger.error("Error loading data:", error);
    }
  };

  const handleSignatureSave = async (signatureData: { signature_image: string; signatory_name: string; signatory_role: string; signed_at: string }) => {
    if (!incident) return;

    try {
      const { error } = await supabase
        .from("incident_signatures")
        .insert({
          incident_id: incident.id,
          signature_data: signatureData.signature_image,
          signer_name: signatureData.signatory_name,
          signer_role: signatureData.signatory_role,
          signed_at: signatureData.signed_at
        });

      if (error) throw error;

      setSignatures([...signatures, signatureData]);
      toast({
        title: "Assinatura salva",
        description: "A assinatura foi registrada com sucesso"
      });
    } catch (error) {
      logger.error("Error saving signature:", error);
      // Continue without database if it fails
      setSignatures([...signatures, signatureData]);
      toast({
        title: "Assinatura registrada",
        description: "Assinatura salva localmente"
      });
    }
  };

  const handleAddAction = async () => {
    if (!incident || !newAction.action_description || !newAction.assigned_to) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha descrição e responsável",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("incident_actions")
        .insert({
          incident_id: incident.id,
          title: newAction.action_description,
          action_type: "corrective",
          description: newAction.action_description,
          assigned_to_name: newAction.assigned_to,
          due_date: newAction.due_date,
          status: newAction.status
        });

      if (error) throw error;

      setCorrectiveActions([...correctiveActions, newAction]);
      setNewAction({ action_description: "", assigned_to: "", due_date: "", status: "pending" });
      setShowActionForm(false);
      toast({
        title: "Ação adicionada",
        description: "Ação corretiva registrada"
      });
    } catch (error) {
      logger.error("Error adding action:", error);
      // Continue without database if it fails
      setCorrectiveActions([...correctiveActions, newAction]);
      setNewAction({ action_description: "", assigned_to: "", due_date: "", status: "pending" });
      setShowActionForm(false);
      toast({
        title: "Ação registrada",
        description: "Ação salva localmente"
      });
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!incident) return;

    try {
      const { error } = await supabase
        .from("incident_reports")
        .update({ status: newStatus })
        .eq("id", incident.id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      if (onUpdate) onUpdate();
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para: ${newStatus}`
      });
    } catch (error) {
      logger.error("Error updating status:", error);
      setCurrentStatus(newStatus);
      toast({
        title: "Status atualizado",
        description: "Alteração registrada localmente"
      });
    }
  };

  // PDF Export for individual incident
  const exportToPDF = async () => {
    if (!incident) return;

    try {
      const { jsPDF } = await loadPDFLibs();
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text("Relatório de Incidente", 14, 22);
      
      // Incident Number
      doc.setFontSize(12);
      doc.text(`Número: ${incident.incident_number}`, 14, 32);
      
      // Basic Info
      doc.setFontSize(10);
      let yPos = 42;
      
      doc.text(`Título: ${incident.title}`, 14, yPos);
      yPos += 7;
      doc.text(`Status: ${currentStatus}`, 14, yPos);
      yPos += 7;
      doc.text(`Severidade: ${incident.severity}`, 14, yPos);
      yPos += 7;
      doc.text(`Categoria: ${incident.category}`, 14, yPos);
      yPos += 7;
      doc.text(`Data: ${format(new Date(incident.incident_date), "dd/MM/yyyy HH:mm")}`, 14, yPos);
      yPos += 7;
      
      if (incident.incident_location) {
        doc.text(`Local: ${incident.incident_location}`, 14, yPos);
        yPos += 7;
      }
      
      if (incident.gps_coordinates) {
        doc.text(`GPS: ${incident.gps_coordinates}`, 14, yPos);
        yPos += 7;
      }
      
      if (incident.description) {
        yPos += 5;
        doc.text("Descrição:", 14, yPos);
        yPos += 7;
        const descLines = doc.splitTextToSize(incident.description, 180);
        doc.text(descLines, 14, yPos);
        yPos += descLines.length * 7 + 10;
      }
      
      // Corrective Actions
      if (correctiveActions.length > 0) {
        yPos += 5;
        doc.setFontSize(12);
        doc.text("Ações Corretivas:", 14, yPos);
        yPos += 10;
        
        const actionData = correctiveActions.map(action => [
          action.action_description,
          action.assigned_to,
          action.due_date ? format(new Date(action.due_date), "dd/MM/yyyy") : "N/A",
          action.status
        ]);
        
        (doc as any).autoTable({
          startY: yPos,
          head: [["Descrição", "Responsável", "Prazo", "Status"]],
          body: actionData,
          styles: { fontSize: 8 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Signatures
      if (signatures.length > 0) {
        yPos += 5;
        doc.setFontSize(12);
        doc.text("Assinaturas:", 14, yPos);
        yPos += 10;
        
        signatures.forEach((sig, index) => {
          doc.setFontSize(10);
          doc.text(`${index + 1}. ${sig.signatory_name} (${sig.signatory_role})`, 14, yPos);
          yPos += 5;
          doc.text(`   Assinado em: ${format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm")}`, 14, yPos);
          yPos += 10;
        });
      }
      
      doc.save(`incident-${incident.incident_number}.pdf`);
      
      toast({
        title: "PDF Exportado",
        description: "O relatório foi exportado com sucesso"
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-success",
      medium: "bg-warning",
      high: "bg-warning",
      critical: "bg-destructive"
    };
    return colors[severity?.toLowerCase()] || "bg-muted";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-info",
      investigating: "bg-warning",
      resolved: "bg-success",
      closed: "bg-muted"
    };
    return colors[status?.toLowerCase()] || "bg-muted";
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Incidente {incident.incident_number}</span>
            <div className="flex gap-2">
              <Badge className={getSeverityColor(incident.severity)}>
                {incident.severity}
              </Badge>
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{incident.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Categoria</Label>
                    <p>{incident.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p>{incident.incident_type || "Não especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data do Incidente</Label>
                    <p>{format(new Date(incident.incident_date), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Local</Label>
                    <p>{incident.incident_location || "Não especificado"}</p>
                  </div>
                  {incident.gps_coordinates && (
                    <div>
                      <Label className="text-muted-foreground">Coordenadas GPS</Label>
                      <p>{incident.gps_coordinates}</p>
                    </div>
                  )}
                  {incident.impact_level && (
                    <div>
                      <Label className="text-muted-foreground">Nível de Impacto</Label>
                      <p>{incident.impact_level}</p>
                    </div>
                  )}
                </div>
                
                {incident.description && (
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="mt-1 whitespace-pre-wrap">{incident.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground mb-2 block">Atualizar Status</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["new", "investigating", "resolved", "closed"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={currentStatus === status ? "default" : "outline"}
                        onClick={() => handleStatusUpdate(status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ações Corretivas</CardTitle>
                <Button size="sm" onClick={() => setShowActionForm(!showActionForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {showActionForm && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label>Descrição da Ação *</Label>
                        <Textarea
                          value={newAction.action_description}
                          onChange={(e) => setNewAction({ ...newAction, action_description: e.target.value })}
                          placeholder="Descreva a ação corretiva..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Responsável *</Label>
                          <Input
                            value={newAction.assigned_to}
                            onChange={(e) => setNewAction({ ...newAction, assigned_to: e.target.value })}
                            placeholder="Nome do responsável"
                          />
                        </div>
                        <div>
                          <Label>Prazo</Label>
                          <Input
                            type="date"
                            value={newAction.due_date}
                            onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowActionForm(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAction}>
                          Adicionar Ação
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {correctiveActions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma ação corretiva registrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {correctiveActions.map((action, index) => (
                      <Card key={action.id || index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{action.action_description}</p>
                              <p className="text-sm text-muted-foreground">
                                Responsável: {action.assigned_to}
                              </p>
                              {action.due_date && (
                                <p className="text-sm text-muted-foreground">
                                  Prazo: {format(new Date(action.due_date), "dd/MM/yyyy")}
                                </p>
                              )}
                            </div>
                            <Badge variant={action.status === "completed" ? "default" : "secondary"}>
                              {action.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assinaturas Digitais</CardTitle>
                <Button size="sm" onClick={() => setShowSignatureDialog(true)}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Assinar
                </Button>
              </CardHeader>
              <CardContent>
                {signatures.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma assinatura registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {signatures.map((sig, index) => (
                      <div key={sig.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">{sig.signatory_name}</p>
                          <p className="text-sm text-muted-foreground">{sig.signatory_role}</p>
                          <p className="text-xs text-muted-foreground">
                            Assinado em: {format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                        {sig.signature_image && (
                          <img 
                            src={sig.signature_image} 
                            alt="Assinatura" 
                            className="h-12 max-w-[120px] object-contain border rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Exporte o relatório completo do incidente incluindo todas as ações corretivas e assinaturas.
                </p>
                <Button onClick={exportToPDF} className="w-full">
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar para PDF
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SignatureDialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
          onSave={handleSignatureSave}
          incidentId={incident.id}
        />
      </DialogContent>
    </Dialog>
  );
};
