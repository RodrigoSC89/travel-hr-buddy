import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  FolderPlus,
  ClipboardList,
  Download,
  Upload
} from "lucide-react";

export interface CustomChecklistItem {
  id: string;
  categoryCode: string;
  question: string;
  isImperative: boolean;
  evidence: string;
  standards: string[];
  applicableDPClass: ("DP1" | "DP2" | "DP3")[];
  criticality: "Alta" | "Média" | "Baixa";
  createdAt: Date;
  createdBy?: string;
}

export interface CustomCategory {
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface Props {
  customItems: CustomChecklistItem[];
  customCategories: CustomCategory[];
  onAddItem: (item: CustomChecklistItem) => void;
  onEditItem: (item: CustomChecklistItem) => void;
  onDeleteItem: (id: string) => void;
  onAddCategory: (category: CustomCategory) => void;
  onDeleteCategory: (code: string) => void;
}

const STANDARD_OPTIONS = [
  "IMCA M103", "IMCA M117", "IMCA M166", "IMCA M182", "IMCA M190",
  "IMCA M206", "IMCA M205", "IMCA M109", "IMCA M220", "IMCA M140",
  "IMO MSC.1/Circ.1580", "IMO MSC/Circ.645", "IMO MSC/Circ.738",
  "STCW 2010", "NORMAM-13", "DNV-RU-SHIP", "MTS DP Guidance", "NI DPO Scheme"
];

export function IMCAAuditManager({
  customItems,
  customCategories,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddCategory,
  onDeleteCategory
}: Props) {
  const { toast } = useToast();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomChecklistItem | null>(null);

  // Form state for new item
  const [newItem, setNewItem] = useState<Partial<CustomChecklistItem>>({
    categoryCode: "",
    question: "",
    isImperative: false,
    evidence: "",
    standards: [],
    applicableDPClass: ["DP1", "DP2", "DP3"],
    criticality: "Média"
  });

  // Form state for new category
  const [newCategory, setNewCategory] = useState<Partial<CustomCategory>>({
    code: "",
    name: "",
    description: "",
    icon: "clipboard-list"
  });

  const handleAddItem = () => {
    if (!newItem.categoryCode || !newItem.question) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha categoria e pergunta.",
        variant: "destructive"
      });
      return;
    }

    const item: CustomChecklistItem = {
      id: `custom-${Date.now()}`,
      categoryCode: newItem.categoryCode!,
      question: newItem.question!,
      isImperative: newItem.isImperative || false,
      evidence: newItem.evidence || "",
      standards: newItem.standards || [],
      applicableDPClass: newItem.applicableDPClass || ["DP1", "DP2", "DP3"],
      criticality: newItem.criticality || "Média",
      createdAt: new Date()
    };

    onAddItem(item);
    setNewItem({
      categoryCode: "",
      question: "",
      isImperative: false,
      evidence: "",
      standards: [],
      applicableDPClass: ["DP1", "DP2", "DP3"],
      criticality: "Média"
    });
    setIsAddItemOpen(false);

    toast({
      title: "Item adicionado",
      description: "Novo item de checklist adicionado com sucesso."
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    onEditItem(editingItem);
    setEditingItem(null);
    toast({
      title: "Item atualizado",
      description: "Item de checklist atualizado com sucesso."
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.code || !newCategory.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha código e nome da categoria.",
        variant: "destructive"
      });
      return;
    }

    onAddCategory(newCategory as CustomCategory);
    setNewCategory({ code: "", name: "", description: "", icon: "clipboard-list" });
    setIsAddCategoryOpen(false);

    toast({
      title: "Categoria criada",
      description: "Nova categoria de auditoria criada com sucesso."
    });
  };

  const handleExportItems = () => {
    const exportData = {
      categories: customCategories,
      items: customItems,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imca-audit-custom-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Itens customizados exportados com sucesso."
    });
  };

  const toggleStandard = (std: string) => {
    if (editingItem) {
      const standards = editingItem.standards.includes(std)
        ? editingItem.standards.filter(s => s !== std)
        : [...editingItem.standards, std];
      setEditingItem({ ...editingItem, standards });
    } else {
      const standards = (newItem.standards || []).includes(std)
        ? (newItem.standards || []).filter(s => s !== std)
        : [...(newItem.standards || []), std];
      setNewItem({ ...newItem, standards });
    }
  };

  const toggleDPClass = (dpClass: "DP1" | "DP2" | "DP3") => {
    if (editingItem) {
      const classes = editingItem.applicableDPClass.includes(dpClass)
        ? editingItem.applicableDPClass.filter(c => c !== dpClass)
        : [...editingItem.applicableDPClass, dpClass];
      setEditingItem({ ...editingItem, applicableDPClass: classes });
    } else {
      const classes = (newItem.applicableDPClass || []).includes(dpClass)
        ? (newItem.applicableDPClass || []).filter(c => c !== dpClass)
        : [...(newItem.applicableDPClass || []), dpClass];
      setNewItem({ ...newItem, applicableDPClass: classes });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Item de Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Adicionar Item ao Checklist
              </DialogTitle>
              <DialogDescription>
                Crie um novo item de auditoria com referências normativas
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select 
                      value={newItem.categoryCode} 
                      onValueChange={v => setNewItem({ ...newItem, categoryCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASOG">ASOG/CAMO</SelectItem>
                        <SelectItem value="DOC">Documentação</SelectItem>
                        <SelectItem value="MNT">Manutenção</SelectItem>
                        <SelectItem value="INF">Infraestrutura</SelectItem>
                        <SelectItem value="COMP">Competência DP</SelectItem>
                        <SelectItem value="MON">Monitoramento</SelectItem>
                        <SelectItem value="EMG">Emergências</SelectItem>
                        <SelectItem value="TEC">Técnica DP</SelectItem>
                        <SelectItem value="CPD">CPD/Desenvolvimento</SelectItem>
                        {customCategories.map(cat => (
                          <SelectItem key={cat.code} value={cat.code}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Criticidade</Label>
                    <Select 
                      value={newItem.criticality} 
                      onValueChange={v => setNewItem({ ...newItem, criticality: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pergunta/Requisito *</Label>
                  <Textarea 
                    value={newItem.question || ""}
                    onChange={e => setNewItem({ ...newItem, question: e.target.value })}
                    placeholder="Descreva o requisito de auditoria..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Evidência Esperada</Label>
                  <Textarea 
                    value={newItem.evidence || ""}
                    onChange={e => setNewItem({ ...newItem, evidence: e.target.value })}
                    placeholder="Documentos, registros ou verificações necessárias..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Classes DP Aplicáveis</Label>
                  <div className="flex gap-2">
                    {(["DP1", "DP2", "DP3"] as const).map(dp => (
                      <Button
                        key={dp}
                        type="button"
                        variant={(newItem.applicableDPClass || []).includes(dp) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDPClass(dp)}
                      >
                        {dp}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newItem.isImperative || false}
                    onCheckedChange={v => setNewItem({ ...newItem, isImperative: v })}
                  />
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Item Impeditivo (NC impede operação)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Normas de Referência</Label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_OPTIONS.map(std => (
                      <Badge
                        key={std}
                        variant={(newItem.standards || []).includes(std) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleStandard(std)}
                      >
                        {std}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma categoria personalizada para agrupamento de itens
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input 
                    value={newCategory.code || ""}
                    onChange={e => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: CUST"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input 
                    value={newCategory.name || ""}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Nome da categoria"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={newCategory.description || ""}
                  onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Descrição opcional..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCategory} className="gap-2">
                <FolderPlus className="h-4 w-4" />
                Criar Categoria
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="gap-2" onClick={handleExportItems}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Custom Categories */}
      {customCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Categorias Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customCategories.map(cat => (
                <Badge key={cat.code} variant="secondary" className="gap-2 py-1.5 px-3">
                  <span className="font-mono text-xs">{cat.code}</span>
                  <span>{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => onDeleteCategory(cat.code)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Itens Customizados ({customItems.length})
          </CardTitle>
          <CardDescription>
            Itens adicionados manualmente ao checklist de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item customizado ainda.</p>
              <p className="text-sm">Clique em "Novo Item de Checklist" para adicionar.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {customItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-lg border ${item.isImperative ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{item.categoryCode}</Badge>
                          <Badge variant={item.criticality === "Alta" ? "destructive" : item.criticality === "Média" ? "default" : "secondary"}>
                            {item.criticality}
                          </Badge>
                          {item.isImperative && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Impeditivo
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            {item.applicableDPClass.map(dp => (
                              <Badge key={dp} variant="secondary" className="text-xs">{dp}</Badge>
                            ))}
                          </div>
                        </div>
                        <p className="font-medium">{item.question}</p>
                        {item.evidence && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Evidência:</strong> {item.evidence}
                          </p>
                        )}
                        {item.standards.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.standards.map(std => (
                              <Badge key={std} variant="outline" className="text-xs">{std}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            onDeleteItem(item.id);
                            toast({ title: "Item removido" });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Item de Checklist</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={editingItem.categoryCode} 
                      onValueChange={v => setEditingItem({ ...editingItem, categoryCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASOG">ASOG/CAMO</SelectItem>
                        <SelectItem value="DOC">Documentação</SelectItem>
                        <SelectItem value="MNT">Manutenção</SelectItem>
                        <SelectItem value="INF">Infraestrutura</SelectItem>
                        <SelectItem value="COMP">Competência DP</SelectItem>
                        <SelectItem value="MON">Monitoramento</SelectItem>
                        <SelectItem value="EMG">Emergências</SelectItem>
                        <SelectItem value="TEC">Técnica DP</SelectItem>
                        <SelectItem value="CPD">CPD/Desenvolvimento</SelectItem>
                        {customCategories.map(cat => (
                          <SelectItem key={cat.code} value={cat.code}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Criticidade</Label>
                    <Select 
                      value={editingItem.criticality} 
                      onValueChange={v => setEditingItem({ ...editingItem, criticality: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pergunta/Requisito</Label>
                  <Textarea 
                    value={editingItem.question}
                    onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Evidência Esperada</Label>
                  <Textarea 
                    value={editingItem.evidence}
                    onChange={e => setEditingItem({ ...editingItem, evidence: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Classes DP Aplicáveis</Label>
                  <div className="flex gap-2">
                    {(["DP1", "DP2", "DP3"] as const).map(dp => (
                      <Button
                        key={dp}
                        type="button"
                        variant={editingItem.applicableDPClass.includes(dp) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDPClass(dp)}
                      >
                        {dp}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.isImperative}
                    onCheckedChange={v => setEditingItem({ ...editingItem, isImperative: v })}
                  />
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Item Impeditivo
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Normas de Referência</Label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_OPTIONS.map(std => (
                      <Badge
                        key={std}
                        variant={editingItem.standards.includes(std) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleStandard(std)}
                      >
                        {std}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateItem} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
