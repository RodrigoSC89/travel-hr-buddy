import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Star,
  Clock,
  User,
  Tags,
  Archive,
  Share,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "report" | "document" | "email" | "certificate";
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isPublic: boolean;
  tags: string[];
  content: string;
}

const TemplateManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  // Dados simulados
  React.useEffect(() => {
    const mockTemplates: Template[] = [
      {
        id: "1",
        name: "Relatório Mensal de Vendas",
        description: "Template padrão para relatórios mensais de performance de vendas",
        category: "business",
        type: "report",
        createdBy: "admin@empresa.com",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        usageCount: 45,
        isPublic: true,
        tags: ["vendas", "mensal", "kpi"],
        content:
          "# Relatório Mensal de Vendas\n\n## Período: {{periodo}}\n\n### Métricas Principais\n- Receita Total: {{receita}}\n- Número de Vendas: {{vendas}}",
      },
      {
        id: "2",
        name: "Certificado de Conclusão STCW",
        description: "Template oficial para certificados STCW básicos",
        category: "hr",
        type: "certificate",
        createdBy: "hr@empresa.com",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        usageCount: 123,
        isPublic: false,
        tags: ["certificado", "stcw", "maritimo"],
        content:
          "CERTIFICADO DE CONCLUSÃO\n\nCertificamos que {{nome}} concluiu com aproveitamento o curso {{curso}}",
      },
      {
        id: "3",
        name: "Email de Boas-vindas",
        description: "Email automático para novos funcionários",
        category: "hr",
        type: "email",
        createdBy: "hr@empresa.com",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        usageCount: 78,
        isPublic: true,
        tags: ["email", "boas-vindas", "onboarding"],
        content:
          "Assunto: Bem-vindo(a) à {{empresa}}!\n\nOlá {{nome}},\n\nSeja bem-vindo(a) à nossa equipe!",
      },
    ];
    setTemplates(mockTemplates);
  }, []);

  const categories = [
    { id: "all", name: "Todas as Categorias" },
    { id: "business", name: "Negócios" },
    { id: "hr", name: "Recursos Humanos" },
    { id: "finance", name: "Financeiro" },
    { id: "operations", name: "Operações" },
    { id: "maritime", name: "Marítimo" },
  ];

  const types = [
    { id: "all", name: "Todos os Tipos" },
    { id: "report", name: "Relatórios" },
    { id: "document", name: "Documentos" },
    { id: "email", name: "Emails" },
    { id: "certificate", name: "Certificados" },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesType = selectedType === "all" || template.type === selectedType;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "report":
      return <FileText className="w-4 h-4" />;
    case "document":
      return <FileText className="w-4 h-4" />;
    case "email":
      return <FileText className="w-4 h-4" />;
    case "certificate":
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
    case "report":
      return "text-blue-600 bg-blue-100";
    case "document":
      return "text-green-600 bg-green-100";
    case "email":
      return "text-purple-600 bg-purple-100";
    case "certificate":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-muted-foreground bg-secondary";
    }
  };

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      createdAt: new Date(),
      usageCount: 0,
      lastUsed: undefined,
    };
    setTemplates(prev => [newTemplate, ...prev]);
    toast({
      title: "Template duplicado",
      description: "Template copiado com sucesso",
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    toast({
      title: "Template removido",
      description: "Template excluído com sucesso",
    });
  };

  const handleUseTemplate = (template: Template) => {
    // Simular uso do template
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() } : t
      )
    );
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" foi usado com sucesso`,
    });
  };

  const getRelativeTime = (date?: Date) => {
    if (!date) return "Nunca";
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoje";
    if (diffInDays === 1) return "Ontem";
    if (diffInDays < 30) return `${diffInDays} dias atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
    return `${Math.floor(diffInDays / 365)} anos atrás`;
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
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
          <TabsTrigger value="popular">Mais Populares</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(template.type)} variant="secondary">
                            {template.type}
                          </Badge>
                          {template.isPublic && <Badge variant="outline">Público</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleUseTemplate(template)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{template.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{getRelativeTime(template.lastUsed)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usageCount} usos</span>
                      <span>Criado em {template.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Usar Template
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou criar um novo template
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredTemplates.map(template => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(template.type)}
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getTypeColor(template.type)} variant="secondary">
                          {template.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.usageCount} usos • {getRelativeTime(template.lastUsed)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Usar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 6)
              .map((template, index) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">Popular</span>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{template.usageCount} usos</span>
                      <Button size="sm" onClick={() => handleUseTemplate(template)}>
                        Usar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal/Form de Criação (simplificado para exemplo) */}
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
                  <Input placeholder="Digite o nome..." />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
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
                <Textarea placeholder="Descreva o template..." />
              </div>
              <div>
                <Label>Conteúdo do Template</Label>
                <Textarea placeholder="Digite o conteúdo do template aqui..." rows={8} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>Criar Template</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
