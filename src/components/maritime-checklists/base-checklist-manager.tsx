import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Ship, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMaritimeChecklists } from "@/hooks/use-maritime-checklists";
import type { Checklist, ChecklistTemplate } from "./checklist-types";

// Mock data will be replaced by real Supabase data
const mockChecklists: Checklist[] = [];

const mockTemplates: ChecklistTemplate[] = [
  {
    id: "template-1",
    name: "DP Inspection Template",
    type: "dp",
    version: "2.0",
    description: "Template padrão para inspeção de Dynamic Positioning",
    items: [],
    estimatedDuration: 240,
    frequency: "monthly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV"],
    requiredCertifications: ["DPO"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-2",
    name: "Machine Routine Template",
    type: "machine_routine",
    version: "1.5",
    description: "Template para rotina de inspeção de máquinas",
    items: [],
    estimatedDuration: 180,
    frequency: "weekly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Chief Engineer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-3",
    name: "Nautical Routine Template",
    type: "nautical_routine",
    version: "1.0",
    description: "Template para rotina náutica",
    items: [],
    estimatedDuration: 120,
    frequency: "daily",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Captain", "Officer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-4",
    name: "Safety Inspection Template",
    type: "safety",
    version: "2.1",
    description: "Template para inspeção de segurança",
    items: [],
    estimatedDuration: 200,
    frequency: "weekly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Safety Officer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-5",
    name: "Environmental Assessment Template",
    type: "environmental",
    version: "1.3",
    description: "Template para avaliação ambiental",
    items: [],
    estimatedDuration: 150,
    frequency: "monthly",
    applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
    requiredCertifications: ["Environmental Officer"],
    dependencies: [],
    active: true,
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface BaseChecklistManagerProps {
  vesselId?: string;
  userId: string;
  userRole: string;
  onChecklistSelect: (checklist: Checklist) => void;
  onTemplateSelect: (template: ChecklistTemplate) => void;
}

export const BaseChecklistManager: React.FC<BaseChecklistManagerProps> = ({
  vesselId,
  userId,
  userRole,
  onChecklistSelect,
  onTemplateSelect,
}) => {
  const {
    checklists: dbChecklists,
    templates: dbTemplates,
    loading,
    error,
    saveChecklist,
    submitChecklist,
    createChecklistFromTemplate,
  } = useMaritimeChecklists(userId);

  // Use database data when available, fallback to mock data
  const checklists = dbChecklists.length > 0 ? dbChecklists : mockChecklists;
  const templates = dbTemplates.length > 0 ? dbTemplates : mockTemplates;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch =
      checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.vessel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || checklist.status === statusFilter;
    const matchesType = typeFilter === "all" || checklist.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending_review":
        return "bg-yellow-500";
      case "draft":
        return "bg-gray-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "dp":
        return "Dynamic Positioning";
      case "machine_routine":
        return "Rotina de Máquinas";
      case "nautical_routine":
        return "Rotina Náutica";
      case "safety":
        return "Segurança";
      case "environmental":
        return "Ambiental";
      case "custom":
        return "Personalizado";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Checklists Marítimos</h1>
          <p className="text-muted-foreground">Gerencie inspeções e rotinas operacionais</p>
        </div>
        <Button onClick={() => onTemplateSelect(templates[0])}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Checklist
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Checklists Ativos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar checklists..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="pending_review">Aguardando Revisão</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="dp">Dynamic Positioning</SelectItem>
                <SelectItem value="machine_routine">Rotina de Máquinas</SelectItem>
                <SelectItem value="nautical_routine">Rotina Náutica</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="environmental">Ambiental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando checklists...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChecklists.map(checklist => (
                <Card
                  key={checklist.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{checklist.title}</CardTitle>
                        <CardDescription className="mt-1">{checklist.description}</CardDescription>
                      </div>
                      <Badge className={`${getPriorityColor(checklist.priority)} text-white`}>
                        {checklist.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{checklist.vessel.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{getTypeLabel(checklist.type)}</Badge>
                      <Badge className={`${getStatusColor(checklist.status)} text-white`}>
                        {checklist.status}
                      </Badge>
                    </div>

                    {checklist.complianceScore && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conformidade:</span>
                        <span className="font-medium">{checklist.complianceScore}%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duração estimada:</span>
                      <span>{checklist.estimatedDuration}min</span>
                    </div>

                    <Button className="w-full mt-4" onClick={() => onChecklistSelect(checklist)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Abrir Checklist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                    <span className="text-sm text-muted-foreground">v{template.version}</span>
                  </div>

                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequência:</span>
                      <span>{template.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração:</span>
                      <span>{template.estimatedDuration}min</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Tipos de Navio:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.applicableVesselTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-4" onClick={() => onTemplateSelect(template)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Checklist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum checklist concluído</h3>
            <p className="text-muted-foreground">Checklists concluídos aparecerão aqui</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
