/**
 * Template Manager - Zero Mock Policy
 * Data from ai_document_templates table
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Plus, Edit, Copy, Trash2, Eye, Download,
  Upload, Search, Star, Clock, User, Share
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TemplateManager = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("document");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["ai-document-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_document_templates")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ai_document_templates").insert({
        title: formName,
        template_type: formType,
        content: formContent || "",
        tags: [],
        user_id: user?.id,
        is_private: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-document-templates"] });
      setShowCreateForm(false);
      setFormName(""); setFormType("document"); setFormDesc(""); setFormContent("");
      toast.success("Template criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar template"),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_document_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-document-templates"] });
      toast.success("Template removido");
    },
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template: any) => {
      const { error } = await supabase.from("ai_document_templates").insert({
        title: `${template.title} (Cópia)`,
        template_type: template.template_type,
        content: template.content,
        tags: template.tags || [],
        user_id: user?.id,
        is_private: template.is_private,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-document-templates"] });
      toast.success("Template duplicado com sucesso");
    },
  });

  const categories = [
    { id: "all", name: "Todas as Categorias" },
    { id: "report", name: "Relatórios" },
    { id: "document", name: "Documentos" },
    { id: "email", name: "Emails" },
    { id: "certificate", name: "Certificados" },
  ];

  const filteredTemplates = templates.filter((t: any) => {
    const matchesType = selectedType === "all" || t.template_type === selectedType;
    const matchesCategory = selectedCategory === "all" || t.template_type === selectedCategory;
    const matchesSearch = !searchTerm || 
      (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesCategory && matchesSearch;
  });

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 30) return `${diffDays} dias atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Gerenciador de Templates
          </h1>
          <p className="text-muted-foreground">
            Crie, gerencie e reutilize templates para documentos, relatórios e emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Buscar templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{template.template_type}</Badge>
                            {!template.is_private && <Badge variant="outline">Público</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(template.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(template.tags as string[]).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(template.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" onClick={() => toast.success(`Template "${template.title}" aplicado`)}>
                        Usar Template
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => duplicateTemplate.mutate(template)} aria-label="Duplicar">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTemplate.mutate(template.id)} aria-label="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou criar um novo template</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredTemplates.map((template: any) => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-4 h-4" />
                    <div>
                      <h3 className="font-semibold">{template.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{template.template_type}</Badge>
                        <span className="text-xs text-muted-foreground">{getRelativeTime(template.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => toast.success(`Template "${template.title}" aplicado`)}>Usar</Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate.mutate(template)} aria-label="Duplicar">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modal de Criação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Criar Novo Template</CardTitle>
              <CardDescription>Defina as propriedades do seu template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Template</Label>
                  <Input placeholder="Digite o nome..." value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report">Relatório</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="certificate">Certificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva o template..." value={formDesc} onChange={e => setFormDesc(e.target.value)} />
              </div>
              <div>
                <Label>Conteúdo do Template</Label>
                <Textarea placeholder="Digite o conteúdo do template aqui..." rows={8} value={formContent} onChange={e => setFormContent(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
                <Button onClick={() => createTemplate.mutate()} disabled={!formName}>Criar Template</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
