/**
 * Templates Module - Supabase Integrated
 * Full CRUD with ai_document_templates table
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Search, Download, Eye, Plus, Copy, Ship, Shield, Users, Wrench,
  ClipboardCheck, FileCheck, AlertTriangle, BookOpen, Sparkles, Edit, Trash2,
  Check, X, Loader2, FileDown, Printer
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/useModuleHooks";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  lastModified: string;
  downloads: number;
  icon: React.ElementType;
  content?: string;
  variables?: string[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  operations: Ship,
  compliance: Shield,
  hr: Users,
  maintenance: Wrench,
  report: FileText,
  checklist: ClipboardCheck,
  inspection: FileCheck,
  log: BookOpen,
  default: FileText,
};

const CATEGORIES = [
  { id: "all", name: "Todos", icon: FileText },
  { id: "operations", name: "Operações", icon: Ship },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "hr", name: "RH", icon: Users },
  { id: "maintenance", name: "Manutenção", icon: Wrench },
];

const Templates = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "", description: "", category: "operations", type: "report", content: ""
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch templates from Supabase
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["document-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;

      return (data || []).map((t): Template => {
        const category = t.tags?.[0] || "operations";
        return {
          id: t.id,
          name: t.title,
          description: (t.content || "").slice(0, 120),
          category,
          type: t.template_type || "report",
          lastModified: t.updated_at?.slice(0, 10) || "",
          downloads: 0,
          icon: ICON_MAP[category] || ICON_MAP[t.template_type] || ICON_MAP.default,
          content: t.content,
          variables: Array.isArray(t.variables) ? (t.variables as unknown[]).map(String) : [],
        };
      });
    },
  });

  // ✅ INTEGRATED — Create template via event bus
  const createTemplateHook = useCreateTemplate();
  const createMutation = {
    mutate: (data: typeof newTemplate) => {
      createTemplateHook.mutate({ title: data.name, content: data.content, type: data.type, tags: [data.category] }, {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewTemplate({ name: "", description: "", category: "operations", type: "report", content: "" });
        },
      });
    },
    isPending: createTemplateHook.isPending,
  };

  // ✅ INTEGRATED — Update template via event bus
  const updateTemplateHook = useUpdateTemplate();
  const updateMutation = {
    mutate: ({ id, data }: { id: string; data: typeof newTemplate }) => {
      updateTemplateHook.mutate({ id, title: data.name, content: data.content, type: data.type, tags: [data.category] }, {
        onSuccess: () => setShowEditDialog(false),
      });
    },
    isPending: updateTemplateHook.isPending,
  };

  // ✅ INTEGRATED — Delete template via event bus
  const deleteTemplateHook = useDeleteTemplate();
  const deleteMutation = {
    mutate: (id: string) => deleteTemplateHook.mutate(id),
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const handleDownload = (template: Template) => {
    const blob = new Blob([template.content || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Download concluído: ${template.name}`);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleDuplicate = (template: Template) => {
    createMutation.mutate({
      name: `${template.name} (Cópia)`,
      description: template.description,
      category: template.category,
      type: template.type,
      content: template.content || "",
    });
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      content: template.content || ""
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTemplate) return;
    updateMutation.mutate({ id: selectedTemplate.id, data: newTemplate });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }
    createMutation.mutate(newTemplate);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const { data } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Gere um template marítimo profissional do tipo "${newTemplate.type}" para a categoria "${newTemplate.category}". Use formato Markdown com variáveis {{variavel}}.`,
          systemPrompt: "Você é um especialista em documentação marítima. Gere templates profissionais em PT-BR."
        }
      });
      if (data?.response) {
        setNewTemplate(prev => ({ ...prev, content: data.response }));
        toast.success("Template gerado com IA");
      }
    } catch {
      toast.error("Erro ao gerar com IA");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Templates de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            {templates.length} templates disponíveis — Supabase integrado
          </p>
        </div>
        <Button onClick={() => { setNewTemplate({ name: "", description: "", category: "operations", type: "report", content: "" }); setShowCreateDialog(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Template
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"} onClick={() => setSelectedCategory(cat.id)} className="gap-1">
              <cat.icon className="h-3 w-3" /> {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum template encontrado.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div key={template.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <template.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>Atualizado: {template.lastModified}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(template)} className="gap-1"><Eye className="h-3 w-3" />Ver</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(template)} className="gap-1"><Download className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)} className="gap-1"><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)} className="gap-1"><Copy className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(template.id)} className="gap-1"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">{selectedTemplate?.content}</pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Fechar</Button>
            {selectedTemplate && <Button onClick={() => handleDownload(selectedTemplate)} className="gap-1"><Download className="h-4 w-4" />Download</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
            <DialogDescription>Crie um novo template de documento marítimo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome</Label><Input value={newTemplate.name} onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Categoria</Label>
                <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="hr">RH</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Conteúdo (Markdown)</Label>
                <Button size="sm" variant="outline" onClick={handleGenerateAI} disabled={isGeneratingAI} className="gap-1">
                  {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Gerar com IA
                </Button>
              </div>
              <Textarea value={newTemplate.content} onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))} rows={10} className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateTemplate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={newTemplate.name} onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Conteúdo</Label>
              <Textarea value={newTemplate.content} onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))} rows={10} className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
