/**
 * Vessel CRUD Manager - Full CRUD operations for Digital Twin
 * Add, Edit, Delete, Archive vessels
 */

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Ship, 
  Save,
  X,
  Loader2,
  Copy
} from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  mmsi?: string;
  flag_state?: string;
  vessel_type?: string;
  status?: string;
  class_society?: string;
  gross_tonnage?: number;
  deadweight?: number;
  year_built?: number;
  created_at?: string;
  updated_at?: string;
}

interface VesselFormData {
  name: string;
  imo_number: string;
  mmsi: string;
  flag_state: string;
  vessel_type: string;
  status: string;
  class_society: string;
  gross_tonnage: string;
  deadweight: string;
  year_built: string;
}

const VESSEL_TYPES = [
  "PSV",
  "AHTS",
  "Tanker",
  "Container",
  "Bulk Carrier",
  "FPSO",
  "Platform",
  "Tugboat",
  "Other"
];

const VESSEL_STATUS = [
  { value: "active", label: "Ativo" },
  { value: "maintenance", label: "Em Manutenção" },
  { value: "docked", label: "Atracado" },
  { value: "sailing", label: "Navegando" },
  { value: "archived", label: "Arquivado" }
];

const CLASS_SOCIETIES = [
  "DNV",
  "Lloyd's Register",
  "Bureau Veritas",
  "ABS",
  "ClassNK",
  "RINA",
  "Other"
];

const initialFormData: VesselFormData = {
  name: "",
  imo_number: "",
  mmsi: "",
  flag_state: "",
  vessel_type: "",
  status: "active",
  class_society: "",
  gross_tonnage: "",
  deadweight: "",
  year_built: ""
};

interface VesselCRUDManagerProps {
  vessels: Vessel[];
  onRefresh: () => void;
}

export function VesselCRUDManager({ vessels, onRefresh }: VesselCRUDManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: VesselFormData) => {
      const insertData: Record<string, unknown> = {
        name: data.name,
        imo_number: data.imo_number || undefined,
        flag_state: data.flag_state || "Brasil",
        vessel_type: data.vessel_type || "PSV",
        status: data.status || "active",
        gross_tonnage: data.gross_tonnage ? parseInt(data.gross_tonnage) : undefined
      };
      const { error } = await supabase.from("vessels").insert(insertData as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Embarcação criada com sucesso!");
      setIsCreateOpen(false);
      setFormData(initialFormData);
      queryClient.invalidateQueries({ queryKey: ["vessels-list"] });
      onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao criar embarcação", { description: error.message });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VesselFormData }) => {
      const updateData: Record<string, unknown> = {
        name: data.name,
        imo_number: data.imo_number || undefined,
        flag_state: data.flag_state || undefined,
        vessel_type: data.vessel_type || undefined,
        status: data.status || "active",
        gross_tonnage: data.gross_tonnage ? parseInt(data.gross_tonnage) : undefined,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from("vessels").update(updateData as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Embarcação atualizada com sucesso!");
      setIsEditOpen(false);
      setSelectedVessel(null);
      setFormData(initialFormData);
      queryClient.invalidateQueries({ queryKey: ["vessels-list"] });
      onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar embarcação", { description: error.message });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vessels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Embarcação excluída com sucesso!");
      setIsDeleteOpen(false);
      setSelectedVessel(null);
      queryClient.invalidateQueries({ queryKey: ["vessels-list"] });
      onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao excluir embarcação", { description: error.message });
    }
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase.from("vessels").update({
        status: archive ? "archived" : "active",
        updated_at: new Date().toISOString()
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.archive ? "Embarcação arquivada!" : "Embarcação restaurada!");
      queryClient.invalidateQueries({ queryKey: ["vessels-list"] });
      onRefresh();
    },
    onError: (error) => {
      toast.error("Erro na operação", { description: error.message });
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (vessel: Vessel) => {
      const insertData: Record<string, unknown> = {
        name: `${vessel.name} (Cópia)`,
        flag_state: vessel.flag_state || "Brasil",
        vessel_type: vessel.vessel_type || "PSV",
        status: "active",
        gross_tonnage: vessel.gross_tonnage
      };
      const { error } = await supabase.from("vessels").insert(insertData as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Embarcação duplicada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["vessels-list"] });
      onRefresh();
    },
    onError: (error) => {
      toast.error("Erro ao duplicar embarcação", { description: error.message });
    }
  });

  const handleEdit = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setFormData({
      name: vessel.name || "",
      imo_number: vessel.imo_number || "",
      mmsi: vessel.mmsi || "",
      flag_state: vessel.flag_state || "",
      vessel_type: vessel.vessel_type || "",
      status: vessel.status || "active",
      class_society: vessel.class_society || "",
      gross_tonnage: vessel.gross_tonnage?.toString() || "",
      deadweight: vessel.deadweight?.toString() || "",
      year_built: vessel.year_built?.toString() || ""
    });
    setIsEditOpen(true);
  };

  const handleDelete = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setIsDeleteOpen(true);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Embarcação
        </Button>
      </div>

      {/* Vessels List with Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Embarcações ({vessels.length})
          </CardTitle>
          <CardDescription>
            Gerencie suas embarcações com CRUD completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vessels.length === 0 ? (
            <div className="text-center py-8">
              <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma embarcação cadastrada</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Embarcação
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {vessels.map((vessel) => (
                <div
                  key={vessel.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{vessel.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {vessel.imo_number && <span>IMO: {vessel.imo_number}</span>}
                        {vessel.vessel_type && <span>• {vessel.vessel_type}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={vessel.status === "archived" ? "secondary" : "default"}>
                      {VESSEL_STATUS.find(s => s.value === vessel.status)?.label || vessel.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateMutation.mutate(vessel)}
                        disabled={duplicateMutation.isPending}
                        title="Duplicar"
                        aria-label="Duplicar embarcação"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vessel)}
                        title="Editar"
                        aria-label="Editar embarcação"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => archiveMutation.mutate({ 
                          id: vessel.id, 
                          archive: vessel.status !== "archived" 
                        })}
                        disabled={archiveMutation.isPending}
                        title={vessel.status === "archived" ? "Restaurar" : "Arquivar"}
                        aria-label={vessel.status === "archived" ? "Restaurar embarcação" : "Arquivar embarcação"}
                      >
                        {vessel.status === "archived" ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vessel)}
                        className="text-destructive hover:text-destructive"
                        title="Excluir"
                        aria-label="Excluir embarcação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Embarcação</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar uma nova embarcação
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="MV Atlantic Star"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imo_number">IMO Number</Label>
              <Input
                id="imo_number"
                value={formData.imo_number}
                onChange={(e) => setFormData(prev => ({ ...prev, imo_number: e.target.value }))}
                placeholder="1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mmsi">MMSI</Label>
              <Input
                id="mmsi"
                value={formData.mmsi}
                onChange={(e) => setFormData(prev => ({ ...prev, mmsi: e.target.value }))}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag_state">Bandeira</Label>
              <Input
                id="flag_state"
                value={formData.flag_state}
                onChange={(e) => setFormData(prev => ({ ...prev, flag_state: e.target.value }))}
                placeholder="Brasil"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.vessel_type} onValueChange={(v) => setFormData(prev => ({ ...prev, vessel_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={formData.class_society} onValueChange={(v) => setFormData(prev => ({ ...prev, class_society: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sociedade classificadora" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SOCIETIES.map((cs) => (
                    <SelectItem key={cs} value={cs}>{cs}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gross_tonnage">Arqueação Bruta (GT)</Label>
              <Input
                id="gross_tonnage"
                type="number"
                value={formData.gross_tonnage}
                onChange={(e) => setFormData(prev => ({ ...prev, gross_tonnage: e.target.value }))}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadweight">Porte Bruto (DWT)</Label>
              <Input
                id="deadweight"
                type="number"
                value={formData.deadweight}
                onChange={(e) => setFormData(prev => ({ ...prev, deadweight: e.target.value }))}
                placeholder="3500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Ano de Construção</Label>
              <Input
                id="year_built"
                type="number"
                value={formData.year_built}
                onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
                placeholder="2020"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Criar Embarcação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Embarcação</DialogTitle>
            <DialogDescription>
              Atualize os dados da embarcação {selectedVessel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imo">IMO Number</Label>
              <Input
                id="edit-imo"
                value={formData.imo_number}
                onChange={(e) => setFormData(prev => ({ ...prev, imo_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mmsi">MMSI</Label>
              <Input
                id="edit-mmsi"
                value={formData.mmsi}
                onChange={(e) => setFormData(prev => ({ ...prev, mmsi: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-flag">Bandeira</Label>
              <Input
                id="edit-flag"
                value={formData.flag_state}
                onChange={(e) => setFormData(prev => ({ ...prev, flag_state: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.vessel_type} onValueChange={(v) => setFormData(prev => ({ ...prev, vessel_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={formData.class_society} onValueChange={(v) => setFormData(prev => ({ ...prev, class_society: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_SOCIETIES.map((cs) => (
                    <SelectItem key={cs} value={cs}>{cs}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gt">Arqueação Bruta</Label>
              <Input
                id="edit-gt"
                type="number"
                value={formData.gross_tonnage}
                onChange={(e) => setFormData(prev => ({ ...prev, gross_tonnage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dwt">Porte Bruto</Label>
              <Input
                id="edit-dwt"
                type="number"
                value={formData.deadweight}
                onChange={(e) => setFormData(prev => ({ ...prev, deadweight: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Ano</Label>
              <Input
                id="edit-year"
                type="number"
                value={formData.year_built}
                onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {VESSEL_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedVessel && updateMutation.mutate({ id: selectedVessel.id, data: formData })}
              disabled={!formData.name || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a embarcação "{selectedVessel?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVessel && deleteMutation.mutate(selectedVessel.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
