import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  Camera,
  Mic,
  Ship,
  User,
  Target,
  Compass,
  Navigation,
  Anchor,
} from "lucide-react";
import { toast } from "sonner";
import type { Checklist, ChecklistItem } from "./checklist-types";

interface NauticalRoutineChecklistProps {
  checklist: Checklist;
  onSave: (checklist: Checklist) => Promise<void>;
  onSubmit: (checklist: Checklist) => Promise<void>;
  onBack: () => void;
}

// Mock nautical routine checklist items
const nauticalRoutineItems: ChecklistItem[] = [
  {
    id: "nav-1",
    title: "Verificação dos Equipamentos de Navegação",
    description: "Verificar GPS, radar, compasso giroscópico e outros equipamentos de navegação",
    type: "boolean",
    required: true,
    category: "Navegação",
    order: 1,
    status: "pending",
  },
  {
    id: "nav-2",
    title: "Inspeção das Cartas Náuticas",
    description: "Verificar se as cartas náuticas estão atualizadas e corrigidas",
    type: "boolean",
    required: true,
    category: "Navegação",
    order: 2,
    status: "pending",
  },
  {
    id: "nav-3",
    title: "Teste dos Sistemas de Comunicação",
    description: "VHF, GMDSS, comunicação via satélite e sistemas de emergência",
    type: "boolean",
    required: true,
    category: "Comunicação",
    order: 3,
    status: "pending",
  },
  {
    id: "nav-4",
    title: "Verificação do Piloto Automático",
    description: "Testar funcionamento e precisão do piloto automático",
    type: "boolean",
    required: true,
    category: "Navegação",
    order: 4,
    status: "pending",
  },
  {
    id: "nav-5",
    title: "Inspeção do Equipamento de Âncora",
    description: "Verificar correntes, molinete e sistema de fundeio",
    type: "boolean",
    required: true,
    category: "Fundeio",
    order: 5,
    status: "pending",
  },
  {
    id: "nav-6",
    title: "Medição da Visibilidade",
    description: "Registrar condições de visibilidade em milhas náuticas",
    type: "number",
    required: true,
    category: "Condições",
    order: 6,
    unit: "NM",
    minValue: 0,
    maxValue: 20,
    status: "pending",
  },
  {
    id: "nav-7",
    title: "Verificação dos Equipamentos de Segurança",
    description: "Botes salva-vidas, balsas, coletes, equipamentos de combate a incêndio",
    type: "boolean",
    required: true,
    category: "Segurança",
    order: 7,
    status: "pending",
  },
  {
    id: "nav-8",
    title: "Condições Meteorológicas",
    description: "Registrar condições do tempo, vento e mar",
    type: "text",
    required: true,
    category: "Condições",
    order: 8,
    status: "pending",
  },
];

export const NauticalRoutineChecklist: React.FC<NauticalRoutineChecklistProps> = ({
  checklist: initialChecklist,
  onSave,
  onSubmit,
  onBack,
}) => {
  const [checklist, setChecklist] = useState<Checklist>({
    ...initialChecklist,
    items: nauticalRoutineItems,
  });

  const [activeTab, setActiveTab] = useState("items");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(checklist.items.map(item => item.category)));
  const filteredItems =
    selectedCategory === "all"
      ? checklist.items
      : checklist.items.filter(item => item.category === selectedCategory);

  const completedItems = checklist.items.filter(item => item.status === "completed").length;
  const totalItems = checklist.items.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
              status: field === "value" && value !== undefined ? "completed" : item.status,
              timestamp: field === "value" ? new Date().toISOString() : item.timestamp,
            }
          : item
      ),
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(checklist);
      toast.success("Checklist salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar checklist");
    }
  };

  const handleSubmit = async () => {
    const incompleteRequired = checklist.items.filter(
      item => item.required && item.status !== "completed"
    );

    if (incompleteRequired.length > 0) {
      toast.error(`Existem ${incompleteRequired.length} itens obrigatórios não concluídos`);
      return;
    }

    try {
      await onSubmit({
        ...checklist,
        status: "pending_review",
        completedAt: new Date().toISOString(),
      });
      toast.success("Checklist enviado para revisão!");
    } catch (error) {
      toast.error("Erro ao enviar checklist");
    }
  };

  const renderItemInput = (item: ChecklistItem) => {
    switch (item.type) {
      case "boolean":
        return (
          <Checkbox
            checked={item.value === true}
            onCheckedChange={checked => handleItemChange(item.id, "value", checked)}
            className="mr-2"
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={item.value || ""}
              onChange={e => handleItemChange(item.id, "value", parseFloat(e.target.value))}
              placeholder={`Min: ${item.minValue}, Max: ${item.maxValue}`}
              className="w-32"
            />
            {item.unit && <span className="text-sm text-muted-foreground">{item.unit}</span>}
          </div>
        );

      case "text":
        return (
          <Input
            value={item.value || ""}
            onChange={e => handleItemChange(item.id, "value", e.target.value)}
            placeholder="Digite sua resposta..."
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Navegação":
        return <Compass className="w-4 h-4" />;
      case "Comunicação":
        return <Navigation className="w-4 h-4" />;
      case "Fundeio":
        return <Anchor className="w-4 h-4" />;
      case "Segurança":
        return <Ship className="w-4 h-4" />;
      case "Condições":
        return <Target className="w-4 h-4" />;
      default:
        return <Ship className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{checklist.title}</h1>
                <p className="text-muted-foreground">{checklist.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50">
                <Compass className="w-4 h-4 mr-2" />
                Rotina Náutica
              </Badge>
              <Badge variant={checklist.priority === "high" ? "destructive" : "default"}>
                {checklist.priority}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso da Rotina</span>
              <span className="text-sm text-muted-foreground">
                {completedItems} de {totalItems} itens concluídos
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="items">Itens de Verificação</TabsTrigger>
                <TabsTrigger value="evidence">Evidências</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-6">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Todas as Categorias
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center gap-2"
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Checklist Items */}
                <div className="space-y-4">
                  {filteredItems.map(item => (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        item.status === "completed" ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {renderItemInput(item)}
                              <div>
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                {item.required && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardDescription className="mt-2">{item.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === "completed" && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Notes */}
                        <div>
                          <label className="text-sm font-medium">Observações:</label>
                          <Textarea
                            value={item.notes || ""}
                            onChange={e => handleItemChange(item.id, "notes", e.target.value)}
                            placeholder="Adicione observações sobre este item..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>

                        {/* Evidence Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Camera className="w-4 h-4 mr-2" />
                            Foto
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mic className="w-4 h-4 mr-2" />
                            Áudio
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Evidências Coletadas</CardTitle>
                    <CardDescription>
                      Documentos, fotos e registros da rotina náutica
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma evidência coletada ainda</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Rotina Náutica</CardTitle>
                    <CardDescription>Status geral e observações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                        <div className="text-sm text-muted-foreground">Itens Concluídos</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {totalItems - completedItems}
                        </div>
                        <div className="text-sm text-muted-foreground">Itens Pendentes</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Comentários Gerais:</label>
                      <Textarea
                        placeholder="Adicione comentários gerais sobre a rotina náutica..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vessel Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  Informações do Navio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Nome:</strong> {checklist.vessel.name}
                </div>
                <div>
                  <strong>Tipo:</strong> {checklist.vessel.type}
                </div>
                <div>
                  <strong>IMO:</strong> {checklist.vessel.imo}
                </div>
                <div>
                  <strong>Bandeira:</strong> {checklist.vessel.flag}
                </div>
                <div>
                  <strong>Operador:</strong> {checklist.vessel.operator}
                </div>
              </CardContent>
            </Card>

            {/* Inspector Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Nome:</strong> {checklist.inspector.name}
                </div>
                <div>
                  <strong>Licença:</strong> {checklist.inspector.license}
                </div>
                <div>
                  <strong>Empresa:</strong> {checklist.inspector.company}
                </div>
                <div>
                  <strong>Email:</strong> {checklist.inspector.email}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Progresso:</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração estimada:</span>
                  <span className="font-medium">{checklist.estimatedDuration}min</span>
                </div>
                <div className="flex justify-between">
                  <span>Prioridade:</span>
                  <Badge
                    variant={checklist.priority === "high" ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {checklist.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleSave} className="w-full" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Salvar Progresso
              </Button>
              <Button onClick={handleSubmit} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar para Revisão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
