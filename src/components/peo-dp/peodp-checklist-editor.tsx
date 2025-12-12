/**
import { useState, useCallback } from "react";;
 * PEO-DP Checklist Editor
 * Editor para criar/atualizar requisitos do checklist PEO-DP anualmente
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  FileText,
  Calendar,
  Settings
} from "lucide-react";
import {
  type PEODPRequirement,
  type PEODPSection,
  type PEODPChecklistVersion,
  PEODP_SECTIONS,
  PEODP_DEFAULT_REQUIREMENTS
} from "@/types/peodp-checklist";
import { toast } from "sonner";

interface PEODPChecklistEditorProps {
  onSave?: (version: PEODPChecklistVersion) => void;
  existingVersion?: PEODPChecklistVersion;
}

export const PEODPChecklistEditor = memo(function({ onSave, existingVersion }: PEODPChecklistEditorProps) {
  const currentYear = new Date().getFullYear();
  
  const [version, setVersion] = useState<Partial<PEODPChecklistVersion>>({
    year: existingVersion?.year || currentYear,
    version: existingVersion?.version || "1.0",
    effectiveDate: existingVersion?.effectiveDate || new Date().toISOString().split("T")[0],
    notes: existingVersion?.notes || "",
    requirements: existingVersion?.requirements || [...PEODP_DEFAULT_REQUIREMENTS]
  });

  const [editingReq, setEditingReq] = useState<PEODPRequirement | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<PEODPSection>("gestao");

  const [newReq, setNewReq] = useState<Partial<PEODPRequirement>>({
    section: "gestao",
    code: "",
    title: "",
    description: "",
    reference: "",
    mandatory: true,
    weight: 5
  });

  const handleAddRequirement = () => {
    if (!newReq.code || !newReq.title || !newReq.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const req: PEODPRequirement = {
      id: `req-${newReq.code}`,
      section: newReq.section as PEODPSection,
      code: newReq.code!,
      title: newReq.title!,
      description: newReq.description!,
      reference: newReq.reference || undefined,
      mandatory: newReq.mandatory ?? true,
      weight: newReq.weight ?? 5
    };

    setVersion(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), req]
    }));

    setNewReq({
      section: "gestao",
      code: "",
      title: "",
      description: "",
      reference: "",
      mandatory: true,
      weight: 5
    });

    setIsAddDialogOpen(false);
    toast.success("Requisito adicionado");
  });

  const handleUpdateRequirement = () => {
    if (!editingReq) return;

    setVersion(prev => ({
      ...prev,
      requirements: prev.requirements?.map(r => 
        r.id === editingReq.id ? editingReq : r
      )
    }));

    setEditingReq(null);
    toast.success("Requisito atualizado");
  };

  const handleDeleteRequirement = (reqId: string) => {
    setVersion(prev => ({
      ...prev,
      requirements: prev.requirements?.filter(r => r.id !== reqId)
    }));
    toast.success("Requisito removido");
  };

  const handleSave = () => {
    const fullVersion: PEODPChecklistVersion = {
      id: existingVersion?.id || `checklist-${version.year}-${Date.now()}`,
      year: version.year!,
      version: version.version!,
      effectiveDate: version.effectiveDate!,
      requirements: version.requirements || [],
      notes: version.notes,
      createdAt: existingVersion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave?.(fullVersion);
    toast.success(`Checklist PEO-DP ${version.year} salvo`);
  };

  const handleExport = () => {
    const data = JSON.stringify(version, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peodp-checklist-${version.year}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Checklist exportado");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setVersion(data);
        toast.success("Checklist importado");
      } catch {
        toast.error("Erro ao importar arquivo");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyFromPrevious = () => {
    setVersion(prev => ({
      ...prev,
      requirements: [...PEODP_DEFAULT_REQUIREMENTS]
    }));
    toast.success("Requisitos do ano anterior copiados");
  };

  const filteredRequirements = version.requirements?.filter(r => r.section === selectedSection) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Editor de Checklist PEO-DP
              </CardTitle>
              <CardDescription>
                Crie e atualize os requisitos do checklist PEO-DP anualmente
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyFromPrevious}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar do Padrão
              </Button>
              <label>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                value={version.year}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versionNum">Versão</Label>
              <Input
                id="versionNum"
                value={version.version}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Data de Vigência</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={version.effectiveDate}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Total de Requisitos</Label>
              <div className="text-2xl font-bold">{version.requirements?.length || 0}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="notes">Notas da Versão</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre esta versão do checklist..."
              value={version.notes}
              onChange={handleChange}))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section selector and requirements table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as PEODPSection}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PEODP_SECTIONS.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.code} - {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {filteredRequirements.length} requisitos
              </Badge>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Requisito
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Requisito</DialogTitle>
                  <DialogDescription>
                    Adicione um novo requisito ao checklist PEO-DP
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seção</Label>
                      <Select 
                        value={newReq.section} 
                        onValueChange={(v) => setNewReq(prev => ({ ...prev, section: v as PEODPSection }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PEODP_SECTIONS.map(section => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.code} - {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Código *</Label>
                      <Input
                        placeholder="Ex: 3.2.25"
                        value={newReq.code}
                        onChange={handleChange}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      placeholder="Título do requisito"
                      value={newReq.title}
                      onChange={handleChange}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      placeholder="Descrição detalhada do requisito..."
                      value={newReq.description}
                      onChange={handleChange}))}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Referência</Label>
                      <Input
                        placeholder="Ex: IMCA M 117"
                        value={newReq.reference}
                        onChange={handleChange}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (1-10)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={newReq.weight}
                        onChange={handleChange}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Obrigatório</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          checked={newReq.mandatory}
                          onCheckedChange={(checked) => setNewReq(prev => ({ ...prev, mandatory: checked }))}
                        />
                        <span className="text-sm">{newReq.mandatory ? "Sim" : "Não"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleSetIsAddDialogOpen}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddRequirement}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-[120px]">Referência</TableHead>
                  <TableHead className="w-[80px]">Peso</TableHead>
                  <TableHead className="w-[100px]">Obrigatório</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono">{req.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {req.reference && (
                        <Badge variant="secondary" className="text-xs">
                          {req.reference}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{req.weight}</TableCell>
                    <TableCell>
                      {req.mandatory ? (
                        <Badge variant="destructive" className="text-xs">Sim</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSetEditingReq}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlehandleDeleteRequirement}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editingReq} onOpenChange={() => setEditingReq(null}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Requisito</DialogTitle>
          </DialogHeader>
          {editingReq && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seção</Label>
                  <Select 
                    value={editingReq.section} 
                    onValueChange={(v) => setEditingReq({ ...editingReq, section: v as PEODPSection })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEODP_SECTIONS.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.code} - {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={editingReq.code}
                    onChange={handleChange})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={editingReq.title}
                  onChange={handleChange})}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingReq.description}
                  onChange={handleChange})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Referência</Label>
                  <Input
                    value={editingReq.reference || ""}
                    onChange={handleChange})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={editingReq.weight}
                    onChange={handleChange})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Obrigatório</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={editingReq.mandatory}
                      onCheckedChange={(checked) => setEditingReq({ ...editingReq, mandatory: checked })}
                    />
                    <span className="text-sm">{editingReq.mandatory ? "Sim" : "Não"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleSetEditingReq}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRequirement}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Checklist {version.year}
        </Button>
      </div>
    </div>
  );
}
