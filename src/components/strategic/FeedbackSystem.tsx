import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  TrendingUp,
  Users,
  Lightbulb,
  Flag,
  Vote,
  Plus,
  CheckCircle,
  Clock
} from "lucide-react";

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "bug" | "improvement" | "general";
  priority: "high" | "medium" | "low";
  status: "pending" | "in-review" | "planned" | "completed" | "rejected";
  author: string;
  department: string;
  votes: number;
  comments: number;
  createdAt: string;
  module: string;
}

interface UserSatisfaction {
  module: string;
  rating: number;
  responses: number;
  trend: "up" | "down" | "stable";
}

export const FeedbackSystem = () => {
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    category: "",
    module: ""
  });

  const feedbackItems: FeedbackItem[] = [
    {
      id: "1",
      title: "Integração com WhatsApp Business",
      description: "Adicionar integração nativa com WhatsApp para comunicação com tripulação em alto mar",
      category: "feature",
      priority: "high",
      status: "planned",
      author: "Carlos Silva",
      department: "Operações",
      votes: 23,
      comments: 8,
      createdAt: "2024-01-15",
      module: "Comunicação"
    },
    {
      id: "2",
      title: "Dashboard Mobile Responsivo",
      description: "Melhorar a responsividade do dashboard principal para dispositivos móveis",
      category: "improvement",
      priority: "medium",
      status: "in-review",
      author: "Ana Costa",
      department: "TI",
      votes: 18,
      comments: 5,
      createdAt: "2024-01-12",
      module: "Dashboard"
    },
    {
      id: "3",
      title: "Bug no Cálculo de Combustível",
      description: "Erro no cálculo automático de consumo de combustível para embarcações diesel",
      category: "bug",
      priority: "high",
      status: "completed",
      author: "Roberto Lima",
      department: "Logística",
      votes: 15,
      comments: 12,
      createdAt: "2024-01-10",
      module: "Logística"
    },
    {
      id: "4",
      title: "Modo Escuro (Dark Mode)",
      description: "Implementar tema escuro para melhor experiência durante operações noturnas",
      category: "feature",
      priority: "low",
      status: "pending",
      author: "Marina Santos",
      department: "UX",
      votes: 31,
      comments: 3,
      createdAt: "2024-01-08",
      module: "Geral"
    }
  ];

  const userSatisfaction: UserSatisfaction[] = [
    { module: "Dashboard", rating: 4.7, responses: 156, trend: "up" },
    { module: "RH Marítimo", rating: 4.5, responses: 89, trend: "stable" },
    { module: "Logística", rating: 4.3, responses: 124, trend: "up" },
    { module: "Viagens", rating: 4.1, responses: 67, trend: "down" },
    { module: "Comunicação", rating: 4.6, responses: 94, trend: "up" },
    { module: "Reservas", rating: 4.4, responses: 73, trend: "stable" }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
    case "feature": return "bg-primary text-primary-foreground";
    case "bug": return "bg-danger text-danger-foreground";
    case "improvement": return "bg-warning text-warning-foreground";
    case "general": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "bg-success text-success-foreground";
    case "planned": return "bg-primary text-primary-foreground";
    case "in-review": return "bg-warning text-warning-foreground";
    case "pending": return "bg-muted text-muted-foreground";
    case "rejected": return "bg-danger text-danger-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "bg-danger text-danger-foreground";
    case "medium": return "bg-warning text-warning-foreground";
    case "low": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed": return <CheckCircle className="h-4 w-4" />;
    case "planned": return <Flag className="h-4 w-4" />;
    case "in-review": return <Clock className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-success" />;
    case "down": return <TrendingUp className="h-4 w-4 text-danger rotate-180" />;
    default: return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleSubmitFeedback = () => {
    // Implementar lógica de envio do feedback
    console.log("Novo feedback:", newFeedback);
    setNewFeedback({ title: "", description: "", category: "", module: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Sistema de Feedback & Sugestões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{feedbackItems.length}</div>
              <div className="text-sm text-muted-foreground">Feedbacks Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">87%</div>
              <div className="text-sm text-muted-foreground">Taxa de Implementação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">4.5</div>
              <div className="text-sm text-muted-foreground">Satisfação Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">603</div>
              <div className="text-sm text-muted-foreground">Avaliações Totais</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Feedback Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Enviar Nova Sugestão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Descreva sua sugestão em poucas palavras"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({...newFeedback, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Módulo</label>
                <Select value={newFeedback.module} onValueChange={(value) => setNewFeedback({...newFeedback, module: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="hr">RH Marítimo</SelectItem>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="viagens">Viagens</SelectItem>
                    <SelectItem value="comunicacao">Comunicação</SelectItem>
                    <SelectItem value="reservas">Reservas</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={newFeedback.category} onValueChange={(value) => setNewFeedback({...newFeedback, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                  <SelectItem value="improvement">Melhoria</SelectItem>
                  <SelectItem value="bug">Reportar Bug</SelectItem>
                  <SelectItem value="general">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição Detalhada</label>
              <Textarea
                placeholder="Descreva sua sugestão ou problema detalhadamente..."
                value={newFeedback.description}
                onChange={(e) => setNewFeedback({...newFeedback, description: e.target.value})}
                rows={4}
              />
            </div>
            
            <Button onClick={handleSubmitFeedback} className="w-full">
              Enviar Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            Sugestões da Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(item.status)}
                      <h4 className="font-semibold">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Por {item.author}</span>
                      <span>•</span>
                      <span>{item.department}</span>
                      <span>•</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline">{item.module}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {item.votes}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {item.comments} comentários
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Comentar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Satisfaction */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Satisfação por Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userSatisfaction.map((module) => (
              <div key={module.module} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{module.module}</h4>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(module.trend)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= module.rating
                            ? "text-warning fill-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{module.rating}</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Baseado em {module.responses} avaliações
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};