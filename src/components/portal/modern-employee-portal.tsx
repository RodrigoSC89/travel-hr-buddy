import React, { useState, useEffect } from "react";
import { ShipLoader } from "@/components/ui/ship-loader";
import { EmployeeTrainingPortal } from "./EmployeeTrainingPortal";
import { EmployeePaymentsHistory } from "./EmployeePaymentsHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Calendar, 
  FileText, 
  Award, 
  Clock, 
  Target,
  TrendingUp,
  MessageSquare,
  Bell,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Settings,
  Star,
  BarChart3,
  Eye,
  Plus,
  Edit,
  Trash2,
  Brain,
  Shield,
  Anchor,
  Compass,
  Waves,
  Ship,
  GraduationCap,
  CreditCard,
  Users,
  Activity,
  BookOpen,
  Mic,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { nullToUndefined } from "@/lib/type-helpers";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

// Type aliases from Supabase schema
type CrewMemberRow = Database["public"]["Tables"]["crew_members"]["Row"];
type CrewEmbarkation = Database["public"]["Tables"]["crew_embarkations"]["Row"];
type CrewCertification = Database["public"]["Tables"]["crew_certifications"]["Row"];
type PerformanceReview = Database["public"]["Tables"]["crew_performance_reviews"]["Row"];
type AIRecommendation = Database["public"]["Tables"]["crew_ai_recommendations"]["Row"];
type DossierDocument = Database["public"]["Tables"]["crew_dossier_documents"]["Row"];

interface DashboardStats {
  totalEmbarkations: number;
  totalSeaDays: number;
  performanceScore: number;
  complianceRate: number;
  pendingCertificates: number;
  upcomingTraining: number;
  recentPayments: unknown[];
  nextEmbarkation?: CrewEmbarkation | null;
}

interface PersonalCalendar {
  embarkations: CrewEmbarkation[];
  training: unknown[];
  certifications: CrewCertification[];
  medicalExams: unknown[];
}

interface AIInsight {
  id: string;
  type: "recommendation" | "alert" | "insight";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  actionable: boolean;
  deadline?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ModernEmployeePortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [personalCalendar, setPersonalCalendar] = useState<PersonalCalendar | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userProfile, setUserProfile] = useState<CrewMemberRow | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // AI Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Document upload states
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);

  useEffect(() => {
    initializePortal();
    // Detectar preferência de tema do sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, [user]);

  const initializePortal = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadUserProfile(),
        loadDashboardStats(),
        loadPersonalCalendar(),
        loadAIInsights(),
        loadDocuments()
      ]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do portal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Buscar ou criar perfil do usuário
      const { data: profile, error } = await supabase
        .from("crew_members")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        // Criar perfil básico
        const { data: newProfile, error: createError } = await supabase
          .from("crew_members")
          .insert({
            user_id: user?.id,
            employee_id: user?.email?.split("@")[0] || "temp_id",
            full_name: user?.email?.split("@")[0] || "Usuário",
            position: "Marinheiro",
            rank: "Ordinary Seaman",
            nationality: "Brasil",
            email: user?.email,
            status: "available"
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
    }
  };

  const loadDashboardStats = async () => {
    if (!userProfile) return;

    try {
      // Buscar estatísticas consolidadas
      const [embarkations, certifications, performance] = await Promise.all([
        supabase.from("crew_embarkations").select("*").eq("crew_member_id", userProfile.id),
        supabase.from("crew_certifications").select("*").eq("crew_member_id", userProfile.id),
        supabase.from("crew_performance_reviews").select("*").eq("crew_member_id", userProfile.id)
      ]);

      const totalEmbarkations = embarkations.data?.length || 0;
      const totalSeaDays = embarkations.data?.reduce((total, embark) => 
        total + Math.ceil((embark.hours_worked || 0) / 24), 0) || 0;
      
      const validCerts = certifications.data?.filter(cert => cert.status === "valid").length || 0;
      const totalCerts = certifications.data?.length || 0;
      const complianceRate = totalCerts > 0 ? (validCerts / totalCerts) * 100 : 0;
      
      const avgPerformance = (performance.data && performance.data.length > 0)
        ? performance.data.reduce((sum, rev) => sum + rev.overall_score, 0) / performance.data.length
        : 0;

      const pendingCertificates = certifications.data?.filter(cert => 
        cert.status === "expiring_soon" || cert.status === "expired").length || 0;

      setDashboardStats({
        totalEmbarkations,
        totalSeaDays,
        performanceScore: Math.round(avgPerformance * 10) / 10,
        complianceRate: Math.round(complianceRate),
        pendingCertificates,
        upcomingTraining: 0, // Implementar quando houver tabela de treinamentos
        recentPayments: [], // Implementar quando houver tabela de pagamentos
        nextEmbarkation: null
      });
    } catch (error) {
    }
  };

  const loadPersonalCalendar = async () => {
    if (!userProfile) return;

    try {
      const today = new Date();
      const startDate = format(startOfWeek(today), "yyyy-MM-dd");
      const endDate = format(addDays(today, 90), "yyyy-MM-dd"); // Próximos 90 dias

      const [embarkations, certifications] = await Promise.all([
        supabase.from("crew_embarkations")
          .select("*")
          .eq("crew_member_id", userProfile.id)
          .gte("embark_date", startDate)
          .lte("embark_date", endDate),
        supabase.from("crew_certifications")
          .select("*")
          .eq("crew_member_id", userProfile.id)
          .gte("expiry_date", startDate)
          .lte("expiry_date", endDate)
      ]);

      setPersonalCalendar({
        embarkations: embarkations.data || [],
        training: [], // Implementar quando houver tabela
        certifications: certifications.data || [],
        medicalExams: [] // Implementar quando houver tabela
      });
    } catch (error) {
    }
  };

  const loadAIInsights = async () => {
    if (!userProfile) return;

    try {
      // Gerar insights de IA automaticamente
      await supabase.functions.invoke("crew-ai-insights", {
        body: { crewMemberId: userProfile.id }
      });

      // Buscar insights da base de dados
      const { data: insights, error } = await supabase
        .from("crew_ai_recommendations")
        .select("*")
        .eq("crew_member_id", userProfile.id)
        .eq("status", "active")
        .order("priority", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedInsights: AIInsight[] = (insights || []).map(insight => ({
        id: insight.id,
        type: "recommendation",
        title: insight.title,
        description: insight.description,
        priority: insight.priority as "high" | "medium" | "low",
        category: insight.category,
        actionable: true,
        deadline: nullToUndefined(insight.deadline)
      }));

      setAIInsights(formattedInsights);
    } catch (error) {
    }
  };

  const loadDocuments = async () => {
    if (!userProfile) return;

    try {
      const { data: docs, error } = await supabase
        .from("crew_dossier_documents")
        .select("*")
        .eq("crew_member_id", userProfile.id)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setDocuments(docs || []);
    } catch (error) {
    }
  };

  const handleAIChat = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage: ChatMessage = { role: "user" as const, content: message, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("crew-ai-insights", {
        body: {
          type: "chat",
          message: message,
          crewMemberId: userProfile?.id,
          context: {
            userProfile,
            dashboardStats,
            personalCalendar
          }
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        role: "assistant" as const,
        content: data?.response || "Desculpe, não consegui processar sua mensagem.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant" as const,
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    if (!userProfile) return;

    setUploadingDoc(true);
    try {
      // Upload para storage
      const fileName = `${userProfile.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Salvar metadados no banco
      const { error: dbError } = await supabase
        .from("crew_dossier_documents")
        .insert({
          crew_member_id: userProfile.id,
          document_name: file.name,
          document_category: "personal",
          file_url: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id,
          verification_status: "pending"
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento enviado",
        description: "Seu documento foi enviado para verificação"
      });

      await loadDocuments();
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o documento",
        variant: "destructive"
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "outline";
    }
  };

  if (loading) {
    return (
      <ShipLoader size="lg" label="Carregando portal..." className="min-h-[600px]" />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header com boas-vindas e controles */}
        <div className="flex items-center justify-between bg-gradient-to-r from-azure-600 to-azure-800 text-white rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-white/10 text-white text-lg">
                {userProfile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {userProfile?.full_name || "Tripulante"}!
              </h1>
              <p className="text-azure-100">
                {userProfile?.position} - {userProfile?.rank}
              </p>
              <Badge variant="secondary" className="mt-2">
                {userProfile?.status === "available" ? "Disponível" : "Embarcado"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Alternar tema"
            >
              {darkMode ? "☀️" : "🌙"}
            </Button>
            
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Chat IA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[600px]">
                <DialogHeader>
                  <DialogTitle>Assistente Inteligente</DialogTitle>
                  <DialogDescription>
                    Tire dúvidas sobre regras, documentos e carreira
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-2" />
                        <p>Como posso ajudá-lo hoje?</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-xs opacity-70">
                              {format(msg.timestamp, "HH:mm")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="bg-background border p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="text-sm">Processando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAIChat(newMessage)}
                      disabled={isProcessing}
                    />
                    <Button 
                      onClick={() => handleAIChat(newMessage)}
                      disabled={isProcessing || !newMessage.trim()}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={initializePortal}
              aria-label="Atualizar dados"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-background border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Treinamentos
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="dossier" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dossiê
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Indicadores Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-info mb-1">Total Embarques</p>
                      <p className="text-3xl font-bold">
                        {dashboardStats?.totalEmbarkations || 0}
                      </p>
                    </div>
                    <Ship className="h-12 w-12 text-info" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-success mb-1">Dias de Mar</p>
                      <p className="text-3xl font-bold">
                        {dashboardStats?.totalSeaDays || 0}
                      </p>
                    </div>
                    <Waves className="h-12 w-12 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-accent-foreground mb-1">Performance</p>
                      <p className="text-3xl font-bold">
                        {dashboardStats?.performanceScore || 0}
                      </p>
                    </div>
                    <Star className="h-12 w-12 text-accent-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-warning mb-1">Compliance</p>
                      <p className="text-3xl font-bold">
                        {dashboardStats?.complianceRate || 0}%
                      </p>
                    </div>
                    <Shield className="h-12 w-12 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas Importantes */}
            {dashboardStats && dashboardStats.pendingCertificates > 0 && (
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">Atenção Necessária</AlertTitle>
                <AlertDescription className="text-destructive/80">
                  Você possui {dashboardStats.pendingCertificates} certificado(s) expirando ou expirados.
                  Verifique na aba "Documentos" para mais detalhes.
                </AlertDescription>
              </Alert>
            )}

            {/* Insights de IA Rápidos */}
            {aiInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Insights Personalizados
                  </CardTitle>
                  <CardDescription>
                    Recomendações baseadas no seu perfil e histórico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={getPriorityColor(insight.priority)}>
                              {insight.priority === "high" ? "Alta" : 
                                insight.priority === "medium" ? "Média" : "Baixa"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {aiInsights.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("insights")}
                    >
                      Ver todos os insights ({aiInsights.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendário Pessoal
                </CardTitle>
                <CardDescription>
                  Próximos embarques, treinamentos e vencimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Próximos Embarques
                    </h3>
                    {personalCalendar?.embarkations.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum embarque agendado</p>
                    ) : (
                      <div className="space-y-2">
                        {personalCalendar?.embarkations.map((embark) => (
                          <div key={embark.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{embark.vessel_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(embark.embark_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Certificados Vencendo
                    </h3>
                    {personalCalendar?.certifications.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhum certificado vencendo</p>
                    ) : (
                      <div className="space-y-2">
                        {personalCalendar?.certifications.map((cert) => (
                          <div key={cert.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{cert.certification_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Vence em {cert.expiry_date ? format(new Date(cert.expiry_date), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Central de Documentos
                </CardTitle>
                <CardDescription>
                  Gerencie seus documentos pessoais e certificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Enviar Documento</h3>
                    <p className="text-muted-foreground mb-4">
                      Arraste arquivos aqui ou clique para selecionar
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(handleDocumentUpload);
                      }}
                    />
                    <Button 
                      onClick={() => document.getElementById("file-upload")?.click()}
                      disabled={uploadingDoc}
                    >
                      {uploadingDoc ? "Enviando..." : "Selecionar Arquivos"}
                    </Button>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.document_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.document_category} • {doc.upload_date ? format(new Date(doc.upload_date), "dd/MM/yyyy") : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={doc.verification_status === "verified" ? "default" : "secondary"}
                          >
                            {doc.verification_status === "verified" ? "Verificado" : "Pendente"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Área de Treinamentos
                </CardTitle>
                <CardDescription>
                  Cursos disponíveis e seu progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeTrainingPortal />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  Salários, diárias e gratificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeePaymentsHistory />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dossier Tab */}
          <TabsContent value="dossier" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dossiê Completo
                </CardTitle>
                <CardDescription>
                  Acesse seu dossiê profissional completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="p-6 bg-muted/50 rounded-lg">
                    <User className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Dossiê Profissional</h3>
                    <p className="text-muted-foreground mb-4">
                      Visualize todas suas informações profissionais, certificações e histórico
                    </p>
                    <Button 
                      onClick={() => window.open("/crew-dossier", "_blank")}
                      className="w-full max-w-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Dossiê Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Insights de Inteligência Artificial
                </CardTitle>
                <CardDescription>
                  Análises e recomendações personalizadas para sua carreira
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Gerando Insights</h3>
                    <p className="text-muted-foreground mb-4">
                      A IA está analisando seu perfil para gerar recomendações personalizadas
                    </p>
                    <Button onClick={loadAIInsights} variant="outline">
                      Atualizar Insights
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiInsights.map((insight) => (
                      <Card key={insight.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{insight.title}</h3>
                            <Badge variant={getPriorityColor(insight.priority)}>
                              {insight.priority === "high" ? "Alta Prioridade" :
                                insight.priority === "medium" ? "Média Prioridade" : "Baixa Prioridade"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{insight.category}</Badge>
                            {insight.deadline && (
                              <span className="text-sm text-muted-foreground">
                                Prazo: {format(new Date(insight.deadline), "dd/MM/yyyy")}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};