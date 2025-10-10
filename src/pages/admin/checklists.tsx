import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { IntelligentChecklistManager } from "@/components/checklists/intelligent-checklist-manager";
import { 
  ClipboardCheck,
  Plus,
  FileText,
  Download,
  BarChart3,
  History,
  Settings,
  Users,
  Search,
  Filter,
  Brain,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  itemCount: number;
  usageCount: number;
}

export default function AdminChecklistsPage() {
  const [activeTab, setActiveTab] = useState("checklists");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Mock templates data
  const templates: ChecklistTemplate[] = [
    {
      id: "1",
      name: "DP para DPO",
      description: "Checklist padrão para Dynamic Positioning Officer",
      category: "Operações Marítimas",
      itemCount: 45,
      usageCount: 127
    },
    {
      id: "2",
      name: "Rotina de Máquinas",
      description: "Verificação diária de equipamentos de máquinas",
      category: "Manutenção",
      itemCount: 32,
      usageCount: 89
    },
    {
      id: "3",
      name: "Rotina Náutica",
      description: "Checklist de verificações náuticas diárias",
      category: "Navegação",
      itemCount: 28,
      usageCount: 156
    },
    {
      id: "4",
      name: "Segurança e Meio Ambiente",
      description: "Verificações de segurança e conformidade ambiental",
      category: "Segurança",
      itemCount: 38,
      usageCount: 92
    }
  ];

  // Mock statistics
  const stats = {
    totalChecklists: 1247,
    activeToday: 23,
    completedToday: 18,
    avgCompletionRate: 96,
    pendingReview: 5
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Seu relatório está sendo preparado...",
    });
  };

  const handleNewChecklist = () => {
    toast({
      title: "Novo Checklist",
      description: "Abrindo formulário de criação...",
    });
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="green">
        <ModuleHeader
          icon={ClipboardCheck}
          title="Checklists Inteligentes"
          description="Sistema avançado de gestão de checklists com IA e automação"
          gradient="green"
          badges={[
            { icon: Brain, label: "IA Integrada" },
            { icon: Shield, label: "Auditoria Completa" },
            { icon: CheckCircle, label: `${stats.completedToday} Hoje` }
          ]}
        />

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalChecklists}</p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos Hoje</p>
                    <p className="text-2xl font-bold text-success">{stats.activeToday}</p>
                  </div>
                  <Clock className="h-8 w-8 text-success/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-info">{stats.completedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-info/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                    <p className="text-2xl font-bold text-purple-500">{stats.avgCompletionRate}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendente Revisão</p>
                    <p className="text-2xl font-bold text-warning">{stats.pendingReview}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="checklists" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden md:inline">Checklists</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden md:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>

            {/* Checklists Tab */}
            <TabsContent value="checklists" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gerenciador de Checklists</CardTitle>
                      <CardDescription>
                        Crie, gerencie e monitore checklists com análise de IA
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleNewChecklist} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Checklist
                      </Button>
                      <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <IntelligentChecklistManager />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Templates Reutilizáveis</CardTitle>
                      <CardDescription>
                        Modelos pré-configurados para diferentes tipos de operações
                      </CardDescription>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {template.itemCount} itens
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Usado {template.usageCount}x
                              </span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" className="flex-1">
                                Usar Template
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics e Relatórios
                  </CardTitle>
                  <CardDescription>
                    Visualize métricas e tendências de uso dos checklists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Checklists por Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Concluídos</span>
                              <Badge className="bg-success">876</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Em Andamento</span>
                              <Badge className="bg-info">234</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Rascunho</span>
                              <Badge variant="outline">137</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Tempo Médio de Conclusão</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">24min</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ↓ 12% desde último mês
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Issues Encontrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Críticos</span>
                              <Badge variant="destructive">3</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Médios</span>
                              <Badge className="bg-warning">12</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Baixos</span>
                              <Badge variant="outline">28</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-info/30 bg-info/5">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Análise de IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          A IA detectou um padrão de não conformidade no sistema de alarmes em 15% dos checklists.
                          Recomenda-se treinamento adicional da equipe ou revisão do procedimento padrão.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Alterações
                  </CardTitle>
                  <CardDescription>
                    Rastreabilidade completa de todas as modificações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      📝 Todas as alterações em checklists são registradas automaticamente com:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                      <li>Timestamp exato da modificação</li>
                      <li>Usuário responsável pela alteração</li>
                      <li>Campos modificados (antes/depois)</li>
                      <li>IP de origem e dispositivo</li>
                      <li>Assinatura digital para auditoria</li>
                    </ul>
                    <Card className="border-warning/30 bg-warning/5 mt-4">
                      <CardContent className="p-4">
                        <p className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4 text-warning" />
                          <strong>Conformidade:</strong> Sistema atende requisitos ISO 9001 e normas marítimas internacionais
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
