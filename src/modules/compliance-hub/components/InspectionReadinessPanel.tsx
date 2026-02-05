/**
 * Inspection Readiness Panel - Preparação para Inspeções
 * Checklist interativo para PSC, Flag State, OVID, CDI
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, Circle, AlertTriangle, Clock, FileCheck,
  Ship, Shield, Anchor, Clipboard, Users, Wrench,
  Calendar, Download, Eye, RefreshCw, Sparkles
} from "lucide-react";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: "completed" | "pending" | "overdue" | "in-progress";
  responsible: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  aiSuggestion?: string;
}

const inspectionTypes = [
  { id: "psc", name: "PSC", icon: Ship, color: "text-blue-500", description: "Port State Control" },
  { id: "flag", name: "Flag State", icon: Shield, color: "text-green-500", description: "Bandeira" },
  { id: "ovid", name: "OVID", icon: Anchor, color: "text-purple-500", description: "Oil Companies" },
  { id: "cdi", name: "CDI", icon: Clipboard, color: "text-orange-500", description: "Chemical Distribution" },
];

const mockChecklist: ChecklistItem[] = [
  { id: "1", category: "Documentação", item: "Certificados de segurança atualizados", status: "completed", responsible: "Capitão", dueDate: "2024-01-15", priority: "high" },
  { id: "2", category: "Documentação", item: "Livro de registros de óleo atualizado", status: "completed", responsible: "1º Oficial", dueDate: "2024-01-14", priority: "high" },
  { id: "3", category: "Equipamentos", item: "Teste de equipamentos salva-vidas", status: "in-progress", responsible: "Imediato", dueDate: "2024-01-16", priority: "high", aiSuggestion: "Agendar teste para próxima semana" },
  { id: "4", category: "Equipamentos", item: "Inspeção de extintores", status: "pending", responsible: "Chefe Máquinas", dueDate: "2024-01-20", priority: "medium" },
  { id: "5", category: "Tripulação", item: "Certificados STCW da tripulação", status: "overdue", responsible: "RH", dueDate: "2024-01-10", priority: "high", aiSuggestion: "2 tripulantes com certificados vencidos" },
  { id: "6", category: "Tripulação", item: "Registros de horas de descanso", status: "completed", responsible: "1º Oficial", dueDate: "2024-01-15", priority: "medium" },
  { id: "7", category: "Estrutura", item: "Inspeção de casco e pintura", status: "pending", responsible: "Imediato", dueDate: "2024-01-25", priority: "low" },
  { id: "8", category: "Estrutura", item: "Verificação de tanques de lastro", status: "in-progress", responsible: "Chefe Máquinas", dueDate: "2024-01-18", priority: "medium" },
  { id: "9", category: "Meio Ambiente", item: "Sistema de tratamento de esgoto", status: "completed", responsible: "Chefe Máquinas", dueDate: "2024-01-12", priority: "high" },
  { id: "10", category: "Meio Ambiente", item: "Plano de gestão de resíduos", status: "pending", responsible: "1º Oficial", dueDate: "2024-01-22", priority: "medium" },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case "pending":
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    case "overdue":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "in-progress":
      return <Clock className="h-5 w-5 text-warning" />;
    default:
      return <Circle className="h-5 w-5" />;
  }
};

export default function InspectionReadinessPanel() {
  const [selectedType, setSelectedType] = useState("psc");
  const [checklist, setChecklist] = useState(mockChecklist);

  const completedItems = checklist.filter(i => i.status === "completed").length;
  const overdueItems = checklist.filter(i => i.status === "overdue").length;
  const readinessScore = Math.round((completedItems / checklist.length) * 100);

  const toggleItemStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === "completed" ? "pending" : "completed";
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const categories = [...new Set(checklist.map(i => i.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Preparação para Inspeções
          </h2>
          <p className="text-muted-foreground">
            Checklist inteligente com sugestões de IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Inspection Types */}
      <div className="grid grid-cols-4 gap-4">
        {inspectionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${type.color}`} />
                <p className="font-semibold">{type.name}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Readiness Score */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Nível de Prontidão</h3>
              <p className="text-sm text-muted-foreground">
                {completedItems} de {checklist.length} itens concluídos
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{readinessScore}%</p>
              {overdueItems > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {overdueItems} atrasados
                </Badge>
              )}
            </div>
          </div>
          <Progress value={readinessScore} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Crítico</span>
            <span>Adequado</span>
            <span>Excelente</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {checklist.some(i => i.aiSuggestion) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warning" />
              Sugestões da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.filter(i => i.aiSuggestion).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-background/50">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.item}</p>
                  <p className="text-xs text-muted-foreground">{item.aiSuggestion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Checklist by Category */}
      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{cat}</CardTitle>
                <CardDescription>
                  {checklist.filter(i => i.category === cat && i.status === "completed").length} de {checklist.filter(i => i.category === cat).length} concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {checklist.filter(i => i.category === cat).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleItemStatus(item.id)}>
                            <StatusIcon status={item.status} />
                          </button>
                          <div>
                            <p className={`text-sm font-medium ${item.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {item.item}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {item.responsible}
                              </Badge>
                              <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "secondary" : "outline"} className="text-xs">
                                {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
