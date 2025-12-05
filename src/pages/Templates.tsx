import React, { useState, useMemo } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Plus, 
  Copy, 
  Ship, 
  Shield, 
  Users, 
  Wrench,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  lastModified: string;
  downloads: number;
  icon: React.ElementType;
}

const TEMPLATES: Template[] = [
  // Operações Marítimas
  {
    id: "1",
    name: "Relatório de Operações DP",
    description: "Template para relatório de operações com Posicionamento Dinâmico",
    category: "operations",
    type: "report",
    lastModified: "2024-12-01",
    downloads: 245,
    icon: Ship,
  },
  {
    id: "2",
    name: "Checklist Pré-Operação",
    description: "Checklist completo para inspeção pré-operacional da embarcação",
    category: "operations",
    type: "checklist",
    lastModified: "2024-12-03",
    downloads: 189,
    icon: ClipboardCheck,
  },
  {
    id: "3",
    name: "Log de Navegação Diário",
    description: "Template padrão para registro de navegação diária",
    category: "operations",
    type: "log",
    lastModified: "2024-11-28",
    downloads: 312,
    icon: BookOpen,
  },
  // Compliance & Segurança
  {
    id: "4",
    name: "Auditoria MLC 2006",
    description: "Checklist de conformidade com Maritime Labour Convention",
    category: "compliance",
    type: "audit",
    lastModified: "2024-12-04",
    downloads: 156,
    icon: Shield,
  },
  {
    id: "5",
    name: "Inspeção OVID",
    description: "Template de inspeção OCIMF/OVID completo",
    category: "compliance",
    type: "inspection",
    lastModified: "2024-12-02",
    downloads: 134,
    icon: FileCheck,
  },
  {
    id: "6",
    name: "Relatório de Não-Conformidade",
    description: "Documento para registro de não-conformidades e ações corretivas",
    category: "compliance",
    type: "report",
    lastModified: "2024-11-30",
    downloads: 98,
    icon: AlertTriangle,
  },
  // Recursos Humanos
  {
    id: "7",
    name: "Escala de Tripulação",
    description: "Template para planejamento de escalas de tripulação",
    category: "hr",
    type: "schedule",
    lastModified: "2024-12-01",
    downloads: 267,
    icon: Users,
  },
  {
    id: "8",
    name: "Avaliação de Competências",
    description: "Formulário de avaliação de competências da tripulação",
    category: "hr",
    type: "evaluation",
    lastModified: "2024-11-25",
    downloads: 89,
    icon: Users,
  },
  // Manutenção
  {
    id: "9",
    name: "Ordem de Serviço",
    description: "Template para abertura de ordens de serviço de manutenção",
    category: "maintenance",
    type: "work-order",
    lastModified: "2024-12-03",
    downloads: 345,
    icon: Wrench,
  },
  {
    id: "10",
    name: "Plano de Manutenção Preventiva",
    description: "Planejamento de manutenção preventiva por equipamento",
    category: "maintenance",
    type: "plan",
    lastModified: "2024-11-29",
    downloads: 178,
    icon: Wrench,
  },
];

const CATEGORIES = [
  { id: "all", name: "Todos", icon: FileText },
  { id: "operations", name: "Operações", icon: Ship },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "hr", name: "RH", icon: Users },
  { id: "maintenance", name: "Manutenção", icon: Wrench },
];

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleDownload = (template: Template) => {
    toast.success(`Download iniciado: ${template.name}`);
  };

  const handlePreview = (template: Template) => {
    toast.info(`Visualizando: ${template.name}`);
  };

  const handleDuplicate = (template: Template) => {
    toast.success(`Template duplicado: ${template.name}`);
  };

  return (
    <ModulePageWrapper gradient="green">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Biblioteca de Templates</h1>
            <p className="text-muted-foreground mt-1">
              Templates marítimos padronizados para operações, compliance e gestão
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredTemplates.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum template encontrado</h3>
                <p className="text-muted-foreground mt-1">
                  Tente ajustar os filtros ou criar um novo template
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>Atualizado: {new Date(template.lastModified).toLocaleDateString("pt-BR")}</span>
                          <span>{template.downloads} downloads</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleDuplicate(template)}
                          >
                            <Copy className="h-3 w-3" />
                            Duplicar
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="h-3 w-3" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{TEMPLATES.length}</p>
            <p className="text-sm text-muted-foreground">Templates Disponíveis</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">
              {TEMPLATES.reduce((acc, t) => acc + t.downloads, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Downloads Totais</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{CATEGORIES.length - 1}</p>
            <p className="text-sm text-muted-foreground">Categorias</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">100%</p>
            <p className="text-sm text-muted-foreground">Conformidade IMCA</p>
          </Card>
        </div>
      </div>
    </ModulePageWrapper>
  );
};

export default Templates;
