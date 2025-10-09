import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Feedback {
  id: string;
  user_id: string;
  module: string;
  type: "bug" | "feature" | "improvement" | "praise";
  title: string;
  description: string;
  rating: number;
  status: "pending" | "in_review" | "in_progress" | "completed" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  admin_response?: string;
  user_email?: string;
  user_name?: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  averageRating: number;
  byType: Record<string, number>;
  byModule: Record<string, number>;
}

export const EnhancedFeedbackSystem: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: string;
    status?: string;
    module?: string;
    search?: string;
  }>({});

  // Formulário para novo feedback
  const [newFeedback, setNewFeedback] = useState({
    module: "",
    type: "feature" as const,
    title: "",
    description: "",
    rating: 5,
  });

  const { toast } = useToast();

  const modules = [
    "dashboard",
    "hr",
    "maritime",
    "travel",
    "analytics",
    "reports",
    "notifications",
    "settings",
    "communication",
    "fleet",
  ];

  const feedbackTypes = [
    { value: "bug", label: "Bug Report", color: "bg-destructive" },
    { value: "feature", label: "Nova Funcionalidade", color: "bg-info" },
    { value: "improvement", label: "Melhoria", color: "bg-warning" },
    { value: "praise", label: "Elogio", color: "bg-success" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-muted" },
    { value: "in_review", label: "Em Análise", color: "bg-info" },
    { value: "in_progress", label: "Em Desenvolvimento", color: "bg-warning" },
    { value: "completed", label: "Concluído", color: "bg-success" },
    { value: "rejected", label: "Rejeitado", color: "bg-destructive" },
  ];

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);

      // Simular dados de feedback para demonstração
      const mockFeedbacks: Feedback[] = [
        {
          id: "1",
          user_id: "user1",
          module: "dashboard",
          type: "feature",
          title: "Adicionar gráficos interativos",
          description: "Seria útil ter gráficos que permitem drill-down nos dados.",
          rating: 4,
          status: "in_progress",
          priority: "medium",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user_email: "usuario@empresa.com",
          user_name: "João Silva",
        },
        {
          id: "2",
          user_id: "user2",
          module: "hr",
          type: "bug",
          title: "Erro ao exportar relatório de certificados",
          description: "O sistema retorna erro 500 ao tentar exportar relatório em PDF.",
          rating: 2,
          status: "completed",
          priority: "high",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          admin_response: "Bug corrigido na versão 1.2.3",
          user_email: "maria@empresa.com",
          user_name: "Maria Santos",
        },
        {
          id: "3",
          user_id: "user3",
          module: "maritime",
          type: "praise",
          title: "Excelente sistema de gestão marítima",
          description: "O módulo marítimo está muito completo e intuitivo. Parabéns!",
          rating: 5,
          status: "pending",
          priority: "low",
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user_email: "carlos@empresa.com",
          user_name: "Carlos Oliveira",
        },
      ];

      // Calcular estatísticas
      const mockStats: FeedbackStats = {
        total: mockFeedbacks.length,
        pending: mockFeedbacks.filter(f => f.status === "pending").length,
        averageRating: mockFeedbacks.reduce((acc, f) => acc + f.rating, 0) / mockFeedbacks.length,
        byType: mockFeedbacks.reduce(
          (acc, f) => {
            acc[f.type] = (acc[f.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        byModule: mockFeedbacks.reduce(
          (acc, f) => {
            acc[f.module] = (acc[f.module] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      setFeedbacks(mockFeedbacks);
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar feedbacks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    try {
      if (!newFeedback.title || !newFeedback.description || !newFeedback.module) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Em um sistema real, isso seria salvo no banco
      toast({
        title: "Feedback enviado",
        description: "Obrigado pelo seu feedback! Analisaremos em breve.",
      });

      // Resetar formulário
      setNewFeedback({
        module: "",
        type: "feature",
        title: "",
        description: "",
        rating: 5,
      });

      // Recarregar feedbacks
      loadFeedbacks();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar feedback",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <AlertTriangle className="w-4 h-4" />;
      case "feature":
        return <TrendingUp className="w-4 h-4" />;
      case "improvement":
        return <Star className="w-4 h-4" />;
      case "praise":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = feedbackTypes.find(t => t.value === type);
    return typeConfig?.color || "bg-muted";
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.color || "bg-muted";
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter.type && feedback.type !== filter.type) return false;
    if (filter.status && feedback.status !== filter.status) return false;
    if (filter.module && feedback.module !== filter.module) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        feedback.title.toLowerCase().includes(searchLower) ||
        feedback.description.toLowerCase().includes(searchLower) ||
        feedback.user_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Sistema de Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Feedbacks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(stats.byModule).length}</p>
                  <p className="text-sm text-muted-foreground">Módulos com Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Feedbacks</TabsTrigger>
          <TabsTrigger value="new">Novo Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Título, descrição ou usuário..."
                      value={filter.search || ""}
                      onChange={e => setFilter({ ...filter, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={filter.type || ""}
                    onValueChange={value => setFilter({ ...filter, type: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {feedbackTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={filter.status || ""}
                    onValueChange={value => setFilter({ ...filter, status: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Módulo</Label>
                  <Select
                    value={filter.module || ""}
                    onValueChange={value => setFilter({ ...filter, module: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os módulos</SelectItem>
                      {modules.map(module => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Feedbacks */}
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum feedback encontrado</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedbacks.map(feedback => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(feedback.type)}
                          <CardTitle className="text-lg">{feedback.title}</CardTitle>
                          <Badge className={getTypeColor(feedback.type)}>
                            {feedbackTypes.find(t => t.value === feedback.type)?.label}
                          </Badge>
                          <Badge className={getStatusColor(feedback.status)}>
                            {statusOptions.find(s => s.value === feedback.status)?.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Por: {feedback.user_name}</span>
                          <span>Módulo: {feedback.module}</span>
                          <span>Avaliação: {feedback.rating}/5 ⭐</span>
                          <span>{new Date(feedback.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm mb-4">{feedback.description}</p>

                    {feedback.admin_response && (
                      <>
                        <Separator className="my-4" />
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium mb-2">Resposta da Administração:</p>
                          <p className="text-sm">{feedback.admin_response}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Novo Feedback</CardTitle>
              <CardDescription>
                Compartilhe suas ideias, reporte bugs ou nos dê sugestões de melhoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="module">Módulo *</Label>
                  <Select
                    value={newFeedback.module}
                    onValueChange={value => setNewFeedback({ ...newFeedback, module: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Feedback *</Label>
                  <Select
                    value={newFeedback.type}
                    onValueChange={(value: any) => setNewFeedback({ ...newFeedback, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Resumo do seu feedback"
                  value={newFeedback.title}
                  onChange={e => setNewFeedback({ ...newFeedback, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhadamente seu feedback, sugestão ou problema"
                  value={newFeedback.description}
                  onChange={e => setNewFeedback({ ...newFeedback, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="rating">Avaliação Geral (1-5)</Label>
                <Select
                  value={newFeedback.rating.toString()}
                  onValueChange={value => setNewFeedback({ ...newFeedback, rating: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} estrela{rating > 1 ? "s" : ""} {"⭐".repeat(rating)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={submitFeedback} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
