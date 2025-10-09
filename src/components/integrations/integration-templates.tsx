import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Calendar,
  MessageSquare,
  Mail,
  BarChart3,
  FileText,
  CreditCard,
  Users,
  Zap,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Filter
} from "lucide-react";

interface IntegrationTemplate {
  id: string;
  name: string;
  category: "productivity" | "communication" | "analytics" | "payment" | "hr" | "automation";
  description: string;
  icon: React.ReactNode;
  difficulty: "easy" | "medium" | "advanced";
  estimatedTime: string;
  features: string[];
  requirements: string[];
  rating: number;
  installs: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export const IntegrationTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const templates: IntegrationTemplate[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      category: "productivity",
      description: "Sincronize eventos e compromissos automaticamente entre sistemas",
      icon: <Calendar className="w-6 h-6" />,
      difficulty: "easy",
      estimatedTime: "10 min",
      features: ["Sync automático de eventos", "Criação de reuniões", "Lembretes personalizados", "Calendários compartilhados"],
      requirements: ["Conta Google", "API Key do Google Calendar", "OAuth 2.0 configurado"],
      rating: 4.8,
      installs: 2543,
      isPopular: true
    },
    {
      id: "slack-notifications",
      name: "Slack Workspace",
      category: "communication",
      description: "Envie notificações e alertas diretamente para canais do Slack",
      icon: <MessageSquare className="w-6 h-6" />,
      difficulty: "easy",
      estimatedTime: "5 min",
      features: ["Notificações em tempo real", "Canais personalizados", "Mensagens formatadas", "Anexos e arquivos"],
      requirements: ["Slack App", "Webhook URL", "Permissões de canal"],
      rating: 4.7,
      installs: 1876,
      isPopular: true
    },
    {
      id: "outlook-integration",
      name: "Microsoft Outlook",
      category: "productivity",
      description: "Integração completa com emails e calendário do Office 365",
      icon: <Mail className="w-6 h-6" />,
      difficulty: "medium",
      estimatedTime: "15 min",
      features: ["Sincronização de emails", "Calendário corporativo", "Contatos", "Tasks integradas"],
      requirements: ["Office 365", "Azure AD App", "Graph API permissions"],
      rating: 4.5,
      installs: 1234,
    },
    {
      id: "power-bi",
      name: "Power BI Dashboard",
      category: "analytics",
      description: "Conecte dados do Nautilus diretamente aos dashboards Power BI",
      icon: <BarChart3 className="w-6 h-6" />,
      difficulty: "advanced",
      estimatedTime: "45 min",
      features: ["Dashboards em tempo real", "Relatórios automáticos", "Análise avançada", "Exportação de dados"],
      requirements: ["Power BI Pro", "Power BI Gateway", "Connector personalizado"],
      rating: 4.6,
      installs: 567,
      isNew: true
    },
    {
      id: "whatsapp-business",
      name: "WhatsApp Business",
      category: "communication",
      description: "Envie mensagens automáticas e notificações via WhatsApp",
      icon: <MessageSquare className="w-6 h-6" />,
      difficulty: "medium",
      estimatedTime: "20 min",
      features: ["Mensagens automáticas", "Templates aprovados", "Números verificados", "Analytics de entrega"],
      requirements: ["WhatsApp Business API", "Número verificado", "Meta Business Account"],
      rating: 4.4,
      installs: 987,
    },
    {
      id: "stripe-payments",
      name: "Stripe Payments",
      category: "payment",
      description: "Processe pagamentos e gerencie assinaturas automaticamente",
      icon: <CreditCard className="w-6 h-6" />,
      difficulty: "advanced",
      estimatedTime: "60 min",
      features: ["Processamento de pagamentos", "Assinaturas recorrentes", "Webhooks", "Relatórios financeiros"],
      requirements: ["Conta Stripe", "Webhook endpoints", "SSL certificado"],
      rating: 4.9,
      installs: 432,
      isPopular: true
    },
    {
      id: "azure-ad",
      name: "Azure Active Directory",
      category: "hr",
      description: "Sincronização de usuários e autenticação corporativa",
      icon: <Users className="w-6 h-6" />,
      difficulty: "advanced",
      estimatedTime: "90 min",
      features: ["SSO corporativo", "Sync de usuários", "Grupos e permissões", "Audit logs"],
      requirements: ["Azure AD Premium", "App Registration", "Admin permissions"],
      rating: 4.3,
      installs: 234,
    },
    {
      id: "zapier-automation",
      name: "Zapier Automation",
      category: "automation",
      description: "Conecte com mais de 5000 apps através do Zapier",
      icon: <Zap className="w-6 h-6" />,
      difficulty: "easy",
      estimatedTime: "15 min",
      features: ["5000+ integrações", "Workflows automáticos", "Triggers personalizados", "Multi-step zaps"],
      requirements: ["Conta Zapier", "Webhook endpoints", "API documentation"],
      rating: 4.7,
      installs: 1654,
      isNew: true
    }
  ];

  const categories = [
    { id: "all", name: "Todos", count: templates.length },
    { id: "productivity", name: "Produtividade", count: templates.filter(t => t.category === "productivity").length },
    { id: "communication", name: "Comunicação", count: templates.filter(t => t.category === "communication").length },
    { id: "analytics", name: "Analytics", count: templates.filter(t => t.category === "analytics").length },
    { id: "payment", name: "Pagamentos", count: templates.filter(t => t.category === "payment").length },
    { id: "hr", name: "RH", count: templates.filter(t => t.category === "hr").length },
    { id: "automation", name: "Automação", count: templates.filter(t => t.category === "automation").length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: IntegrationTemplate["difficulty"]) => {
    switch (difficulty) {
    case "easy": return "bg-success/20 text-success border-success/30";
    case "medium": return "bg-warning/20 text-warning border-warning/30";
    case "advanced": return "bg-destructive/20 text-destructive border-destructive/30";
    }
  };

  const getDifficultyText = (difficulty: IntegrationTemplate["difficulty"]) => {
    switch (difficulty) {
    case "easy": return "Fácil";
    case "medium": return "Médio";
    case "advanced": return "Avançado";
    }
  };

  const getCategoryIcon = (category: IntegrationTemplate["category"]) => {
    switch (category) {
    case "productivity": return <Calendar className="w-4 h-4" />;
    case "communication": return <MessageSquare className="w-4 h-4" />;
    case "analytics": return <BarChart3 className="w-4 h-4" />;
    case "payment": return <CreditCard className="w-4 h-4" />;
    case "hr": return <Users className="w-4 h-4" />;
    case "automation": return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Templates de Integração
              </CardTitle>
              <CardDescription>
                Templates pré-configurados para conectar rapidamente com sistemas populares
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.id !== "all" && getCategoryIcon(category.id as IntegrationTemplate["category"])}
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-current" />
                        <span className="text-xs text-muted-foreground">{template.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{template.installs} instalações</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {template.isPopular && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      Popular
                    </Badge>
                  )}
                  {template.isNew && (
                    <Badge className="bg-success/20 text-success border-success/30 text-xs">
                      Novo
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {getDifficultyText(template.difficulty)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {template.estimatedTime}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Principais recursos:</h4>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-success" />
                      {feature}
                    </div>
                  ))}
                  {template.features.length > 3 && (
                    <p className="text-xs text-muted-foreground ml-5">
                      +{template.features.length - 3} recursos adicionais
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Requisitos:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.requirements.slice(0, 2).map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {template.requirements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.requirements.length - 2} mais
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                  Instalar
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca para encontrar o template ideal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};