// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Feedback {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  rating?: number;
  page_url?: string;
  browser_info?: string;
  attachments?: any;
  created_at: string;
  updated_at: string;
}

export const UserFeedbackSystem: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "suggestion",
    priority: "medium",
    rating: 5,
    page_url: window.location.href,
    browser_info: navigator.userAgent
  });

  // Carregar feedbacks do usuário
  const loadFeedbacks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os feedbacks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar feedback
  const submitFeedback = async () => {
    if (!user || !formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e descrição",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("user_feedback")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          rating: formData.rating,
          page_url: formData.page_url,
          browser_info: formData.browser_info,
          status: "open"
        });

      if (error) throw error;

      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu feedback. Nossa equipe irá analisá-lo.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "suggestion",
        priority: "medium",
        rating: 5,
        page_url: window.location.href,
        browser_info: navigator.userAgent
      });

      // Reload feedbacks
      loadFeedbacks();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [user]);

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "bug": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "suggestion": return <Lightbulb className="h-4 w-4 text-blue-500" />;
    case "improvement": return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "question": return <MessageSquare className="h-4 w-4 text-purple-500" />;
    default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "open":
      return <Badge variant="outline">Aberto</Badge>;
    case "in_progress":
      return <Badge variant="secondary" className="bg-blue-500 text-azure-50">Em Análise</Badge>;
    case "resolved":
      return <Badge variant="default" className="bg-green-500 text-azure-50">Resolvido</Badge>;
    case "closed":
      return <Badge variant="secondary">Fechado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case "urgent":
      return <Badge variant="destructive">Urgente</Badge>;
    case "high":
      return <Badge variant="secondary" className="bg-orange-500 text-azure-50">Alto</Badge>;
    case "medium":
      return <Badge variant="outline">Médio</Badge>;
    default:
      return <Badge variant="secondary">Baixo</Badge>;
    }
  };

  const feedbackStats = {
    total: feedbacks.length,
    open: feedbacks.filter(f => f.status === "open").length,
    resolved: feedbacks.filter(f => f.status === "resolved").length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : "0.0"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistema de Feedback</h1>
        <p className="text-muted-foreground">
          Compartilhe suas sugestões, reporte bugs e nos ajude a melhorar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{feedbackStats.total}</p>
              <p className="text-sm text-muted-foreground">Total de Feedbacks</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{feedbackStats.open}</p>
              <p className="text-sm text-muted-foreground">Em Aberto</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{feedbackStats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{feedbackStats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Avaliação Média</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Enviar Feedback</TabsTrigger>
          <TabsTrigger value="history">Meus Feedbacks ({feedbacks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Novo Feedback</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Feedback</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suggestion">Sugestão</SelectItem>
                      <SelectItem value="bug">Bug/Erro</SelectItem>
                      <SelectItem value="improvement">Melhoria</SelectItem>
                      <SelectItem value="question">Pergunta</SelectItem>
                      <SelectItem value="compliment">Elogio</SelectItem>
                      <SelectItem value="complaint">Reclamação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do seu feedback"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente seu feedback..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="rating">Avaliação Geral (1-5 estrelas)</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        rating <= formData.rating 
                          ? "text-yellow-500 fill-current" 
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, rating }))}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.rating} estrela(s)
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={submitFeedback} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-100"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar Feedback
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setFormData({
                    title: "",
                    description: "",
                    type: "suggestion",
                    priority: "medium",
                    rating: 5,
                    page_url: window.location.href,
                    browser_info: navigator.userAgent
                  })}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <Card key={feedback.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(feedback.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{feedback.title}</h4>
                          {getStatusBadge(feedback.status)}
                          {getPriorityBadge(feedback.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {feedback.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Criado: {new Date(feedback.created_at).toLocaleDateString("pt-BR")}</span>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{feedback.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum feedback enviado</h3>
                <p className="text-muted-foreground">
                  Você ainda não enviou nenhum feedback. Que tal compartilhar sua experiência?
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};