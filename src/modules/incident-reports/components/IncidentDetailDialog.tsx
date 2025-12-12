import { useEffect, useState, useCallback } from "react";;

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
import { SignatureDialog, SignatureData } from "./SignatureDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileDown, PenTool, Plus, CheckCircle } from "lucide-react";
import { format } from "date-fns";

// Lazy load jsPDF
const loadPDFLibs = async () => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
};

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

interface CorrectiveAction {
  id?: string;
  action_description: string;
  assigned_to: string;
  due_date: string;
  status: string;
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
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [newAction, setNewAction] = useState<CorrectiveAction>({
    action_description: "",
    assigned_to: "",
    due_date: "",
    status: "pending"
};
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
      // Load signatures
      const { data: sigData } = await supabase
        .from("incident_signatures")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (sigData) setSignatures(sigData);

      // Load corrective actions
      const { data: actionData } = await supabase
        .from("incident_actions")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (actionData) setCorrectiveActions(actionData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSignatureSave = async (signatureData: SignatureData) => {
    if (!incident) return;

    try {
      const { error } = await supabase
        .from("incident_signatures")
        .insert({
          incident_id: incident.id,
          ...signatureData
        };

      if (error) throw error;

      setSignatures([...signatures, signatureData]);
      toast({
        title: "Assinatura salva",
        description: "A assinatura foi registrada com sucesso"
      };
    } catch (error) {
      console.error("Error saving signature:", error);
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
      };
      return;
    }

    try {
      const { error } = await supabase
        .from("incident_actions")
        .insert({
          incident_id: incident.id,
          ...newAction
        };

      if (error) throw error;

      setCorrectiveActions([...correctiveActions, newAction]);
      setNewAction({ action_description: "", assigned_to: "", due_date: "", status: "pending" });
      setShowActionForm(false);
      toast({
        title: "Ação adicionada",
        description: "Ação corretiva registrada"
      });
    } catch (error) {
      console.error("Error adding action:", error);
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
      };
    } catch (error) {
      console.error("Error updating status:", error);
      setCurrentStatus(newStatus);
      toast({
        title: "Status atualizado",
        description: "Alteração registrada localmente"
      });
    }
  };

  // PDF Export for individual incident
  const exportToPDF = () => {
    if (!incident) return;

    try {
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
        
        autoTable(doc, {
          startY: yPos,
          head: [["Descrição", "Responsável", "Prazo", "Status"]],
          body: actionData,
          styles: { fontSize: 8 }
        };
        
        yPos = (doc as unknown).lastAutoTable.finalY + 10;
      }
      
      // Signatures
      if (signatures.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text("Assinaturas:", 14, yPos);
        yPos += 10;
        
        signatures.forEach((sig, index) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(9);
          doc.text(`${sig.signatory_name} - ${sig.signatory_role}`, 14, yPos);
          yPos += 6;
          doc.text(`Data: ${format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm")}`, 14, yPos);
          yPos += 6;
          
          if (sig.signature_image) {
            try {
              doc.addImage(sig.signature_image, "PNG", 14, yPos, 80, 30);
              yPos += 35;
            } catch (err) {
              console.error("Error adding signature image:", err);
            }
          }
          
          yPos += 5;
        });
      }
      
      // Save
      doc.save(`incident-${incident.incident_number}.pdf`);
      
      toast({
        title: "PDF gerado",
        description: "Download iniciado"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>{incident.title}</span>
              <Badge variant="outline">{incident.incident_number}</Badge>
            </DialogTitle>
            <Badge variant={incident.severity === "critical" ? "destructive" : "default"}>
              {incident.severity}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="actions">Ações Corretivas</TabsTrigger>
            <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Incidente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge>{currentStatus.replace("_", " ")}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span> {incident.category}
                  </div>
                  <div>
                    <span className="font-medium">Severidade:</span> {incident.severity}
                  </div>
                  {incident.incident_type && (
                    <div>
                      <span className="font-medium">Tipo:</span> {incident.incident_type}
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium">Data:</span>{" "}
                    {new Date(incident.incident_date).toLocaleString()}
                  </div>
                  {incident.incident_location && (
                    <div className="col-span-2">
                      <span className="font-medium">Local:</span> {incident.incident_location}
                    </div>
                  )}
                  {incident.gps_coordinates && (
                    <div className="col-span-2">
                      <span className="font-medium">GPS:</span> {incident.gps_coordinates}
                    </div>
                  )}
                </div>
                {incident.description && (
                  <div className="pt-4 border-t">
                    <span className="font-medium">Descrição:</span>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{incident.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corrective Actions Tab - PATCH 393 */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ações Corretivas</CardTitle>
                <Button onClick={handleSetShowActionForm} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Ação
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {showActionForm && (
                  <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                    <div>
                      <Label>Descrição da Ação *</Label>
                      <Textarea
                        value={newAction.action_description}
                        onChange={handleChange})}
                        placeholder="Descreva a ação corretiva necessária"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Responsável *</Label>
                        <Input
                          value={newAction.assigned_to}
                          onChange={handleChange})}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label>Prazo</Label>
                        <Input
                          type="date"
                          value={newAction.due_date}
                          onChange={handleChange})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddAction} size="sm">Adicionar</Button>
                      <Button onClick={handleSetShowActionForm} variant="outline" size="sm">Cancelar</Button>
                    </div>
                  </div>
                )}
                
                {correctiveActions.length > 0 ? (
                  <div className="space-y-3">
                    {correctiveActions.map((action, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{action.action_description}</p>
                            <div className="mt-2 text-sm text-muted-foreground space-y-1">
                              <div>Responsável: {action.assigned_to}</div>
                              {action.due_date && (
                                <div>Prazo: {format(new Date(action.due_date), "dd/MM/yyyy")}</div>
                              )}
                            </div>
                          </div>
                          <Badge>{action.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma ação corretiva registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signatures Tab - PATCH 393 */}
          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assinaturas Digitais</CardTitle>
                <Button onClick={handleSetShowSignatureDialog} size="sm">
                  <PenTool className="mr-2 h-4 w-4" />
                  Assinar
                </Button>
              </CardHeader>
              <CardContent>
                {signatures.length > 0 ? (
                  <div className="space-y-4">
                    {signatures.map((sig, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {sig.signature_image && (
                            <img 
                              src={sig.signature_image} 
                              alt="Signature" 
                              className="w-32 h-20 object-contain border rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{sig.signatory_name}</p>
                            <p className="text-sm text-muted-foreground">{sig.signatory_role}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma assinatura registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardHeader>
                <CardTitle>Fotos e Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                {incident.photo_urls && incident.photo_urls.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {incident.photo_urls.map((url, index) => (
                      <img 
                        key={index}
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-48 object-cover rounded border"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum anexo disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Status - PATCH 393 */}
          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">Status Atual:</span>
                  <Badge className="text-base px-4 py-2">{currentStatus}</Badge>
                </div>
                
                <div className="space-y-2">
                  <Label>Alterar Status:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={currentStatus === "new" ? "default" : "outline"}
                      onClick={() => handlehandleStatusUpdate}
                      className="w-full"
                    >
                      Novo
                    </Button>
                    <Button
                      variant={currentStatus === "under_analysis" ? "default" : "outline"}
                      onClick={() => handlehandleStatusUpdate}
                      className="w-full"
                    >
                      Em Análise
                    </Button>
                    <Button
                      variant={currentStatus === "resolved" ? "default" : "outline"}
                      onClick={() => handlehandleStatusUpdate}
                      className="w-full"
                    >
                      Resolvido
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Fluxo:</strong> Novo → Em Análise → Resolvido
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Fechar
          </Button>
        </div>

        {/* Signature Dialog */}
        <SignatureDialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
          onSave={handleSignatureSave}
          incidentId={incident.id}
        />
      </DialogContent>
    </Dialog>
  );
});
