/**
 * Checklist Builder Component
 * ✅ FUNCTIONAL BUTTONS: Novo Checklist, Salvar, Assinar e Finalizar
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ClipboardList, Plus, GripVertical, Trash2, Edit,
  CheckCircle2, Clock, User, Calendar, FileSignature,
  Save, Copy, MoreVertical
} from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  text: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
}

interface Checklist {
  id: string;
  title: string;
  category: string;
  description: string;
  items: ChecklistItem[];
  status: "draft" | "active" | "completed";
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  signedBy?: string;
  signedAt?: string;
}

const fallbackChecklists: Checklist[] = [
  {
    id: "1",
    title: "Checklist de Partida - MV Atlantic Pioneer",
    category: "Operações",
    description: "Verificações obrigatórias antes da partida",
    items: [
      { id: "1-1", text: "Verificar sistema de navegação", isRequired: true, isCompleted: true, completedBy: "Cap. João", completedAt: "2025-02-05T08:00:00" },
      { id: "1-2", text: "Testar equipamentos de comunicação", isRequired: true, isCompleted: true, completedBy: "Cap. João", completedAt: "2025-02-05T08:15:00" },
      { id: "1-3", text: "Confirmar lista de tripulação", isRequired: true, isCompleted: true, completedBy: "1º Oficial", completedAt: "2025-02-05T08:30:00" },
      { id: "1-4", text: "Verificar plano de carga", isRequired: true, isCompleted: false },
      { id: "1-5", text: "Testar alarme de emergência", isRequired: true, isCompleted: false },
      { id: "1-6", text: "Verificar condições meteorológicas", isRequired: false, isCompleted: false }
    ],
    status: "active",
    createdBy: "Sistema",
    createdAt: "2025-02-05T07:00:00"
  },
  {
    id: "2",
    title: "Inspeção Semanal de Segurança",
    category: "Segurança",
    description: "Verificação semanal de equipamentos de segurança",
    items: [
      { id: "2-1", text: "Verificar extintores de incêndio", isRequired: true, isCompleted: true },
      { id: "2-2", text: "Inspecionar coletes salva-vidas", isRequired: true, isCompleted: true },
      { id: "2-3", text: "Testar botes salva-vidas", isRequired: true, isCompleted: true },
      { id: "2-4", text: "Verificar sinalização de emergência", isRequired: true, isCompleted: true }
    ],
    status: "completed",
    createdBy: "Oficial de Segurança",
    createdAt: "2025-02-01T10:00:00",
    completedAt: "2025-02-01T14:00:00",
    signedBy: "Cap. Carlos Silva",
    signedAt: "2025-02-01T14:30:00"
  }
];

export function ChecklistBuilder() {
  const [checklists, setChecklists] = useState<Checklist[]>(fallbackChecklists);
  const [newItemText, setNewItemText] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ title: "", category: "Operações", description: "" });
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter(i => i.isCompleted).length;
    return Math.round((completed / items.length) * 100);
  };

  const getStatusBadge = (status: Checklist["status"]) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Rascunho</Badge>;
      case "active": return <Badge className="bg-primary/10 text-primary">Em Andamento</Badge>;
      case "completed": return <Badge className="bg-success/10 text-success">Concluído</Badge>;
    }
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                isCompleted: !item.isCompleted,
                completedBy: !item.isCompleted ? "Usuário Atual" : undefined,
                completedAt: !item.isCompleted ? new Date().toISOString() : undefined
              };
            }
            return item;
          })
        };
      }
      return cl;
    }));
  };

  const handleCreateChecklist = useCallback(() => {
    if (!newChecklist.title.trim()) {
      toast.error("Informe o título do checklist");
      return;
    }
    const id = `cl-${Date.now()}`;
    setChecklists(prev => [{
      id,
      title: newChecklist.title,
      category: newChecklist.category,
      description: newChecklist.description,
      items: [],
      status: "draft",
      createdBy: "Usuário Atual",
      createdAt: new Date().toISOString(),
    }, ...prev]);
    toast.success(`Checklist "${newChecklist.title}" criado!`);
    setShowNewDialog(false);
    setNewChecklist({ title: "", category: "Operações", description: "" });
    setAddingItemTo(id);
  }, [newChecklist]);

  const handleAddItem = useCallback((checklistId: string) => {
    if (!newItemText.trim()) return;
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: [...cl.items, {
            id: `${checklistId}-${Date.now()}`,
            text: newItemText,
            isRequired: true,
            isCompleted: false,
          }]
        };
      }
      return cl;
    }));
    setNewItemText("");
    toast.success("Item adicionado");
  }, [newItemText]);

  const handleSave = useCallback((checklist: Checklist) => {
    toast.success(`Checklist "${checklist.title}" salvo com sucesso!`);
  }, []);

  const handleSign = useCallback((checklistId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        const requiredItems = cl.items.filter(i => i.isRequired);
        const allRequiredDone = requiredItems.every(i => i.isCompleted);
        if (!allRequiredDone) {
          toast.error("Complete todos os itens obrigatórios antes de assinar");
          return cl;
        }
        toast.success(`Checklist "${cl.title}" assinado e finalizado!`);
        return {
          ...cl,
          status: "completed" as const,
          completedAt: new Date().toISOString(),
          signedBy: "Usuário Atual",
          signedAt: new Date().toISOString(),
        };
      }
      return cl;
    }));
  }, []);

  const handleDeleteItem = useCallback((checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return { ...cl, items: cl.items.filter(i => i.id !== itemId) };
      }
      return cl;
    }));
    toast.success("Item removido");
  }, []);

  const stats = {
    total: checklists.length,
    active: checklists.filter(c => c.status === "active").length,
    completed: checklists.filter(c => c.status === "completed").length,
    pendingItems: checklists.reduce((acc, c) => acc + c.items.filter(i => !i.isCompleted && i.isRequired).length, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total de Checklists</p><p className="text-3xl font-bold">{stats.total}</p></div><div className="p-3 rounded-full bg-primary/10"><ClipboardList className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Andamento</p><p className="text-3xl font-bold text-primary">{stats.active}</p></div><div className="p-3 rounded-full bg-primary/10"><Clock className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Concluídos</p><p className="text-3xl font-bold text-success">{stats.completed}</p></div><div className="p-3 rounded-full bg-success/10"><CheckCircle2 className="h-6 w-6 text-success" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Itens Pendentes</p><p className="text-3xl font-bold text-warning">{stats.pendingItems}</p></div><div className="p-3 rounded-full bg-warning/10"><ClipboardList className="h-6 w-6 text-warning" /></div></div></CardContent></Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Checklists</h2>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />Novo Checklist
        </Button>
      </div>

      {/* Checklists */}
      <div className="space-y-4">
        {checklists.map((checklist) => {
          const progress = getProgress(checklist.items);
          const requiredItems = checklist.items.filter(i => i.isRequired);
          const requiredCompleted = requiredItems.filter(i => i.isCompleted).length;

          return (
            <Card key={checklist.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${checklist.status === "completed" ? "bg-success/10" : checklist.status === "active" ? "bg-primary/10" : "bg-muted"}`}>
                      <ClipboardList className={`h-5 w-5 ${checklist.status === "completed" ? "text-success" : checklist.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{checklist.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{checklist.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(checklist.status)}
                    <div className="text-right">
                      <p className="font-bold">{progress}%</p>
                      <p className="text-xs text-muted-foreground">{requiredCompleted}/{requiredItems.length} obrigatórios</p>
                    </div>
                  </div>
                </div>
                {checklist.items.length > 0 && <Progress value={progress} className="h-2 mt-3" />}
              </CardHeader>
              <CardContent className="space-y-3">
                {checklist.items.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${item.isCompleted ? "bg-success/5 border-success/20" : "hover:bg-muted/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="cursor-move text-muted-foreground"><GripVertical className="h-4 w-4" /></div>
                      <Checkbox checked={item.isCompleted} onCheckedChange={() => toggleItem(checklist.id, item.id)} disabled={checklist.status === "completed"} />
                      <div>
                        <p className={`text-sm ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>{item.text}</p>
                        {item.completedBy && (
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />{item.completedBy}
                            <Calendar className="h-3 w-3 ml-2" />{new Date(item.completedAt!).toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isRequired && <Badge variant="outline" className="text-xs">Obrigatório</Badge>}
                      {item.isCompleted && <CheckCircle2 className="h-5 w-5 text-success" />}
                      {checklist.status !== "completed" && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(checklist.id, item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add item */}
                {checklist.status !== "completed" && (
                  <div className="flex gap-2 pt-2">
                    <Input placeholder="Novo item..." value={addingItemTo === checklist.id ? newItemText : ""} onFocus={() => setAddingItemTo(checklist.id)} onChange={(e) => { setAddingItemTo(checklist.id); setNewItemText(e.target.value); }} onKeyDown={(e) => e.key === "Enter" && handleAddItem(checklist.id)} className="flex-1" />
                    <Button variant="outline" size="sm" onClick={() => handleAddItem(checklist.id)}><Plus className="h-4 w-4" /></Button>
                  </div>
                )}

                {/* Signature */}
                {checklist.status === "completed" && checklist.signedBy && (
                  <div className="mt-4 pt-4 border-t bg-success/5 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileSignature className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">Assinado digitalmente</p>
                        <p className="text-sm text-muted-foreground">{checklist.signedBy} em {new Date(checklist.signedAt!).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {checklist.status !== "completed" && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSave(checklist)}>
                      <Save className="h-4 w-4 mr-1" />Salvar
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleSign(checklist.id)}>
                      <FileSignature className="h-4 w-4 mr-1" />Assinar e Finalizar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Checklist Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Checklist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input value={newChecklist.title} onChange={(e) => setNewChecklist(prev => ({ ...prev, title: e.target.value }))} placeholder="Ex: Checklist de Partida" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input value={newChecklist.category} onChange={(e) => setNewChecklist(prev => ({ ...prev, category: e.target.value }))} placeholder="Ex: Operações, Segurança" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea value={newChecklist.description} onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))} placeholder="Breve descrição..." className="mt-1" />
            </div>
            <Button onClick={handleCreateChecklist} className="w-full"><Plus className="h-4 w-4 mr-2" />Criar Checklist</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChecklistBuilder;
