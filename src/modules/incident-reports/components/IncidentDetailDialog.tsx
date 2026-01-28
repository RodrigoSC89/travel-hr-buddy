/**
 * PATCH 879 - Incident Detail Dialog
 * Enhanced with signatures, corrective actions, and PDF export
 * Type-safe with fallbacks for missing tables
 */
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
import { logger } from "@/lib/logger";
import { FileDown, PenTool, Plus, CheckCircle, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

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

// Type-safe dynamic table access
type DynamicSupabaseClient = {
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const dynamicDb = supabase as unknown as DynamicSupabaseClient;

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
    status: "pending",
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
      // Load signatures from dynamic table (may not exist)
      const { data: sigData, error: sigError } = await dynamicDb
        .from("incident_signatures")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (sigError) {
        logger.warn("incident_signatures table may not exist:", sigError);
      } else if (sigData) {
        const mappedSigs: SignatureData[] = (sigData || []).map((row: Record<string, unknown>) => ({
          signatory_name: String(row.signatory_name || ""),
          signatory_role: String(row.signatory_role || ""),
          signature_image: String(row.signature_image || ""),
          signed_at: String(row.signed_at || new Date().toISOString()),
        }));
        setSignatures(mappedSigs);
      }

      // Load corrective actions from dynamic table (may not exist)
      const { data: actionData, error: actionError } = await dynamicDb
        .from("incident_actions")
        .select("*")
        .eq("incident_id", incident.id);
      
      if (actionError) {
        logger.warn("incident_actions table may not exist:", actionError);
      } else if (actionData) {
        const mappedActions: CorrectiveAction[] = (actionData || []).map((row: Record<string, unknown>) => ({
          id: String(row.id || ""),
          action_description: String(row.action_description || ""),
          assigned_to: String(row.assigned_to || ""),
          due_date: String(row.due_date || ""),
          status: String(row.status || "pending"),
        }));
        setCorrectiveActions(mappedActions);
      }
    } catch (error) {
      logger.error("Error loading data:", error);
    }
  };

  const handleSignatureSave = async (signatureData: SignatureData) => {
    if (!incident) return;

    try {
      const insertData = {
        incident_id: incident.id,
        signatory_name: signatureData.signatory_name,
        signatory_role: signatureData.signatory_role,
        signature_image: signatureData.signature_image,
        signed_at: signatureData.signed_at,
      } as Record<string, unknown>;

      const { error } = await dynamicDb
        .from("incident_signatures")
        .insert(insertData as never);

      if (error) throw error;

      setSignatures([...signatures, signatureData]);
      toast({
        title: "Assinatura salva",
        description: "A assinatura foi registrada com sucesso",
      });
    } catch (err) {
      logger.warn("Error saving signature (table may not exist):", { error: err });
      // Continue without database if it fails
      setSignatures([...signatures, signatureData]);
      toast({
        title: "Assinatura registrada",
        description: "Assinatura salva localmente",
      });
    }
  };

  const handleAddAction = async () => {
    if (!incident || !newAction.action_description || !newAction.assigned_to) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha descrição e responsável",
        variant: "destructive",
      });
      return;
    }

    try {
      const insertData = {
        incident_id: incident.id,
        action_description: newAction.action_description,
        assigned_to: newAction.assigned_to,
        due_date: newAction.due_date || null,
        status: newAction.status,
      } as Record<string, unknown>;

      const { error } = await dynamicDb
        .from("incident_actions")
        .insert(insertData as never);

      if (error) throw error;

      setCorrectiveActions([...correctiveActions, newAction]);
      setNewAction({ action_description: "", assigned_to: "", due_date: "", status: "pending" });
      setShowActionForm(false);
      toast({
        title: "Ação adicionada",
        description: "Ação corretiva registrada",
      });
    } catch (err) {
      logger.warn("Error adding action (table may not exist):", { error: err });
      // Continue without database if it fails
      setCorrectiveActions([...correctiveActions, { ...newAction, id: crypto.randomUUID() }]);
      setNewAction({ action_description: "", assigned_to: "", due_date: "", status: "pending" });
      setShowActionForm(false);
      toast({
        title: "Ação registrada",
        description: "Ação salva localmente",
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
        description: `Status alterado para: ${newStatus}`,
      });
    } catch (error) {
      logger.error("Error updating status:", error);
      setCurrentStatus(newStatus);
      toast({
        title: "Status atualizado",
        description: "Alteração registrada localmente",
      });
    }
  };

  // PDF Export for individual incident
  const exportToPDF = async () => {
    if (!incident) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      
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
          action.status,
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [["Descrição", "Responsável", "Prazo", "Status"]],
          body: actionData,
          styles: { fontSize: 8 },
        });
        
        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
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
        
        signatures.forEach((sig) => {
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
              logger.error("Error adding signature image:", err);
            }
          }
          
          yPos += 5;
        });
      }
      
      // Save
      doc.save(`incident-${incident.incident_number}.pdf`);
      
      toast({
        title: "PDF gerado",
        description: "Download iniciado",
      });
    } catch (error) {
      logger.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (!incident) return null;

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

          {/* Corrective Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ações Corretivas</CardTitle>
                <Button onClick={() => setShowActionForm(!showActionForm)} size="sm">
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
                        onChange={(e) => setNewAction({ ...newAction, action_description: e.target.value })}
                        placeholder="Descreva a ação corretiva necessária"
                        rows={3}
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
                    <div className="flex gap-2">
                      <Button onClick={handleAddAction} size="sm">Adicionar</Button>
                      <Button onClick={() => setShowActionForm(false)} variant="outline" size="sm">Cancelar</Button>
                    </div>
                  </div>
                )}
                
                {correctiveActions.length > 0 ? (
                  <div className="space-y-3">
                    {correctiveActions.map((action, index) => (
                      <div key={action.id || index} className="border rounded-lg p-4">
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

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assinaturas Digitais</CardTitle>
                <Button onClick={() => setShowSignatureDialog(true)} size="sm">
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
                              className="w-32 h-16 object-contain border rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{sig.signatory_name}</p>
                            <p className="text-sm text-muted-foreground">{sig.signatory_role}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Assinado em: {format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
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

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anexos e Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                {incident.photo_urls && incident.photo_urls.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {incident.photo_urls.map((url, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Anexo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum anexo registrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow do Incidente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["new", "investigating", "action_required", "resolved", "closed"].map((status) => (
                    <Button
                      key={status}
                      variant={currentStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(status)}
                    >
                      {status.replace("_", " ")}
                    </Button>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <Button onClick={exportToPDF} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Relatório PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <SignatureDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        onSave={handleSignatureSave}
        incidentId={incident?.id || ""}
      />
    </Dialog>
  );
};
