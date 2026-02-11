import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, Edit, Trash2, Save, Eye, 
  BookOpen, Video, FileText, Users,
  Download, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: "tutorial" | "faq" | "guide" | "video";
  module: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  author_id?: string;
  created_at: Date;
  updated_at: Date;
  views: number;
  rating: number;
  helpful_votes?: number;
  steps?: unknown[];
  metadata?: Record<string, unknown>;
}

interface Analytics {
  totalItems: number;
  publishedItems: number;
  totalViews: number;
  topModules: { module: string; count: number }[];
  topContent: KnowledgeItem[];
}

export const KnowledgeManagement: React.FC = () => {
  const { toast } = useToast();
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalItems: 0,
    publishedItems: 0,
    totalViews: 0,
    topModules: [],
    topContent: []
  });

  const modules = [
    { id: "all", name: "Todos os Módulos" },
    { id: "maritime", name: "Sistema Marítimo" },
    { id: "hr", name: "Recursos Humanos" },
    { id: "travel", name: "Viagens" },
    { id: "reservations", name: "Reservas" },
    { id: "price-alerts", name: "Alertas de Preço" },
    { id: "reports", name: "Relatórios" }
  ];

  const contentTypes = [
    { id: "all", name: "Todos os Tipos" },
    { id: "tutorial", name: "Tutorial" },
    { id: "faq", name: "FAQ" },
    { id: "guide", name: "Guia" },
    { id: "video", name: "Vídeo" }
  ];

  const loadKnowledgeItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedData: KnowledgeItem[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as "tutorial" | "faq" | "guide" | "video",
        module: item.module,
        tags: Array.isArray(item.tags) ? item.tags : [],
        difficulty: item.difficulty as "beginner" | "intermediate" | "advanced",
        status: item.status as "draft" | "published" | "archived",
        author_id: item.author_id ?? undefined,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        views: item.views || 0,
        rating: item.rating || 0,
        helpful_votes: item.helpful_votes || 0,
        steps: Array.isArray(item.steps) ? item.steps : [],
        metadata: typeof item.metadata === "object" && item.metadata !== null && !Array.isArray(item.metadata) 
          ? item.metadata as Record<string, unknown>
          : {}
      })) || [];

      setKnowledgeItems(formattedData);
      
      // Calcular analytics
      const totalItems = formattedData.length;
      const publishedItems = formattedData.filter(item => item.status === "published").length;
      const totalViews = formattedData.reduce((sum, item) => sum + item.views, 0);
      
      const moduleCount = formattedData.reduce((acc, item) => {
        acc[item.module] = (acc[item.module] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topModules = Object.entries(moduleCount)
        .map(([module, count]) => ({ module, count }))
        .sort((a, b) => b.count - a.count);
      
      const topContent = formattedData
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setAnalytics({
        totalItems,
        publishedItems,
        totalViews,
        topModules,
        topContent
      });

    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os itens da base de conhecimento",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadKnowledgeItems();
  }, [loadKnowledgeItems]);

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesModule = selectedModule === "all" || item.module === selectedModule;
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  const handleCreateNew = () => {
    setEditingItem({
      id: "",
      title: "",
      content: "",
      type: "tutorial",
      module: "maritime",
      tags: [],
      difficulty: "beginner",
      status: "draft",
      author_id: undefined,
      created_at: new Date(),
      updated_at: new Date(),
      views: 0,
      rating: 0,
      helpful_votes: 0,
      steps: [],
      metadata: {}
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      if (editingItem.id) {
        // Atualizar item existente
        const { error } = await supabase
          .from("knowledge_base")
          .update({
            title: editingItem.title,
            content: editingItem.content,
            type: editingItem.type,
            module: editingItem.module,
            tags: editingItem.tags,
            difficulty: editingItem.difficulty,
            status: editingItem.status,
            steps: JSON.parse(JSON.stringify(editingItem.steps || [])),
            metadata: JSON.parse(JSON.stringify(editingItem.metadata || {})),
            updated_at: new Date().toISOString()
          })
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "Item atualizado",
          description: "O conteúdo foi atualizado com sucesso",
        });
      } else {
        // Criar novo item
        const { error } = await supabase
          .from("knowledge_base")
          .insert([{
            title: editingItem.title,
            content: editingItem.content,
            type: editingItem.type,
            module: editingItem.module,
            tags: editingItem.tags,
            difficulty: editingItem.difficulty,
            status: editingItem.status,
            author_id: null,
            steps: JSON.parse(JSON.stringify(editingItem.steps || [])),
            metadata: JSON.parse(JSON.stringify(editingItem.metadata || {}))
          }]);

        if (error) throw error;

        toast({
          title: "Item criado",
          description: "Novo conteúdo adicionado à base de conhecimento",
        });
      }
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      loadKnowledgeItems(); // Recarregar dados
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        const { error } = await supabase
          .from("knowledge_base")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Item excluído",
          description: "O conteúdo foi removido da base de conhecimento",
        });

        loadKnowledgeItems(); // Recarregar dados
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o item",
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(knowledgeItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "knowledge-base.json";
    link.click();
    
    toast({
      title: "Exportação iniciada",
      description: "Base de conhecimento exportada com sucesso",
    });
  };

  const getModuleName = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.name || moduleId;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "tutorial": return <BookOpen className="w-4 h-4" />;
    case "video": return <Video className="w-4 h-4" />;
    case "faq": return <FileText className="w-4 h-4" />;
    case "guide": return <Users className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
    case "beginner": return "bg-success";
    case "intermediate": return "bg-warning";
    case "advanced": return "bg-status-error";
    default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "published": return "bg-success";
    case "draft": return "bg-warning";
    case "archived": return "bg-muted";
    default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Conhecimento</h1>
            <p className="text-muted-foreground">
              Gerencie tutoriais, FAQs e conteúdo da Central de Ajuda
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Conteúdo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">📚 Conteúdo</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar por título, conteúdo ou tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Conteúdo */}
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge className={`${getStatusColor(item.status)} text-card-foreground`}>
                            {item.status}
                          </Badge>
                          <Badge className={`${getDifficultyColor(item.difficulty)} text-card-foreground`}>
                            {item.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">{item.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📁 {getModuleName(item.module)}</span>
                          <span>👁️ {item.views} visualizações</span>
                          <span>⭐ {item.rating.toFixed(1)}</span>
                          <span>📅 {item.updated_at.toLocaleDateString("pt-BR")}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Itens</p>
                      <p className="text-2xl font-bold">{analytics.totalItems}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Publicados</p>
                      <p className="text-2xl font-bold">{analytics.publishedItems}</p>
                    </div>
                    <Eye className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Visualizações</p>
                      <p className="text-2xl font-bold">{analytics.totalViews}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-info" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                      <p className="text-2xl font-bold">94%</p>
                    </div>
                    <Users className="w-8 h-8 text-accent-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Módulos Mais Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topModules.map((module) => (
                      <div key={module.module} className="flex items-center justify-between">
                        <span className="font-medium">{getModuleName(module.module)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(module.count / analytics.totalItems) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{module.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Mais Visualizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topContent.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{getModuleName(item.module)}</p>
                        </div>
                        <Badge variant="outline">{item.views} views</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Base de Conhecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-publicação</label>
                    <Select defaultValue="manual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="auto">Automática</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notificações</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="important">Importantes</SelectItem>
                        <SelectItem value="none">Nenhuma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? "Editar Conteúdo" : "Novo Conteúdo"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do conteúdo da base de conhecimento
              </DialogDescription>
            </DialogHeader>
            
            {editingItem && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Título do conteúdo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select 
                      value={editingItem.type} 
                      onValueChange={(value: "tutorial" | "faq" | "guide" | "video") => setEditingItem({ ...editingItem, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="guide">Guia</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Módulo</label>
                    <Select 
                      value={editingItem.module} 
                      onValueChange={(value) => setEditingItem({ ...editingItem, module: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.filter(m => m.id !== "all").map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dificuldade</label>
                    <Select 
                      value={editingItem.difficulty} 
                      onValueChange={(value: "beginner" | "intermediate" | "advanced") => setEditingItem({ ...editingItem, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={editingItem.status} 
                      onValueChange={(value: "draft" | "published" | "archived") => setEditingItem({ ...editingItem, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                  <Input
                    value={editingItem.tags.join(", ")}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Conteúdo</label>
                  <Textarea
                    value={editingItem.content}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    placeholder="Conteúdo do item"
                    rows={8}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default KnowledgeManagement;