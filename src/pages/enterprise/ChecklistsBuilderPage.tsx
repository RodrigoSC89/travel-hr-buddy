/**
 * Checklists Builder - Página dedicada
 * Construtor de checklists com IA para operações marítimas
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare, Plus, Search, Copy, Trash2, Edit, Eye,
  Sparkles, Download, Upload, Ship, Shield, Wrench
} from "lucide-react";

// Mock data
const existingChecklists = [
  { 
    id: 1, 
    name: "Pre-Departure Safety Checklist", 
    category: "Safety",
    items: 25,
    lastUsed: "2025-01-28",
    usageCount: 156,
    status: "active"
  },
  { 
    id: 2, 
    name: "PSC Inspection Readiness", 
    category: "Compliance",
    items: 45,
    lastUsed: "2025-01-25",
    usageCount: 89,
    status: "active"
  },
  { 
    id: 3, 
    name: "Engine Room Daily Check", 
    category: "Maintenance",
    items: 32,
    lastUsed: "2025-01-28",
    usageCount: 320,
    status: "active"
  },
  { 
    id: 4, 
    name: "Bridge Navigation Equipment", 
    category: "Navigation",
    items: 18,
    lastUsed: "2025-01-27",
    usageCount: 245,
    status: "active"
  },
  { 
    id: 5, 
    name: "Crew Onboarding Checklist", 
    category: "HR",
    items: 28,
    lastUsed: "2025-01-20",
    usageCount: 67,
    status: "active"
  },
];

const templates = [
  { name: "SOLAS Safety Equipment", category: "Safety", items: 35 },
  { name: "MARPOL Environmental", category: "Environmental", items: 28 },
  { name: "ISM Code Compliance", category: "Compliance", items: 42 },
  { name: "ISPS Security", category: "Security", items: 30 },
  { name: "Dry Dock Preparation", category: "Maintenance", items: 55 },
];

export default function ChecklistsBuilderPage() {
  const [selectedTab, setSelectedTab] = useState("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    // Simular geração
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setAiPrompt("");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Safety": return "bg-red-500/20 text-red-400";
      case "Compliance": return "bg-blue-500/20 text-blue-400";
      case "Maintenance": return "bg-orange-500/20 text-orange-400";
      case "Navigation": return "bg-purple-500/20 text-purple-400";
      case "HR": return "bg-green-500/20 text-green-400";
      case "Security": return "bg-yellow-500/20 text-yellow-400";
      case "Environmental": return "bg-teal-500/20 text-teal-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Safety": return <Shield className="h-5 w-5" />;
      case "Maintenance": return <Wrench className="h-5 w-5" />;
      default: return <Ship className="h-5 w-5" />;
    }
  };

  const filteredChecklists = existingChecklists.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Checklists Builder
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                IA
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Crie e gerencie checklists operacionais com assistência de IA
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Checklist
          </Button>
        </div>
      </div>

      {/* AI Generator */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerador de Checklists com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Descreva o checklist que você precisa... Ex: 'Checklist de inspeção pré-viagem para navio tanque com foco em segurança ISPS e conformidade MARPOL'"
              className="flex-1"
              rows={3}
            />
            <Button 
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="gap-2 self-end"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar checklists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChecklists.map((checklist) => (
              <Card key={checklist.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{checklist.name}</CardTitle>
                    <Badge className={getCategoryColor(checklist.category)}>
                      {checklist.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{checklist.items} itens</span>
                      <span>{checklist.usageCount} usos</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Último uso: {new Date(checklist.lastUsed).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Pré-configurados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      {getCategoryIcon(template.category)}
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.items} itens</p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        Usar Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{existingChecklists.length}</p>
                  <p className="text-muted-foreground">Checklists Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">877</p>
                  <p className="text-muted-foreground">Usos Este Mês</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">98%</p>
                  <p className="text-muted-foreground">Taxa de Conclusão</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
