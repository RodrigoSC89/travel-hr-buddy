import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Ship,
  FileText,
  Download,
  Upload,
  Star,
  Eye,
  Brain,
  Shield,
  Waves,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CrewMember {
  id: string;
  full_name: string;
  employee_id: string;
  position: string;
  rank: string;
  status: string;
  experience_years: number;
  nationality: string;
  email: string;
  phone: string;
  join_date: string;
  contract_start: string;
  contract_end: string;
  organization_id: string;
}

interface CrewDossier {
  id: string;
  crew_member_id: string;
  internal_registration: string;
  cat_number: string;
  cir_number: string;
  cir_expiry_date: string;
  employee_registration?: string;
  previous_position?: string;
  profile_photo_url?: string;
  status: string;
  notes?: string;
}

interface CrewEmbarkation {
  id: string;
  vessel_name: string;
  vessel_type: string;
  vessel_class: string;
  dp_class: string;
  dp_operation_modes: string[];
  equipment_operated: string[];
  embark_date: string;
  disembark_date: string;
  embark_location: string;
  disembark_location: string;
  embark_location_details: any;
  disembark_location_details: any;
  function_role: string;
  hours_worked: number;
  operation_notes: string;
  performance_rating: number;
  completed_operations: number;
}

interface CrewCertification {
  id: string;
  certification_name: string;
  certification_type: string;
  certificate_number: string;
  issuing_authority: string;
  course_provider: string;
  course_location: string;
  issue_date: string;
  expiry_date: string;
  renewal_date: string;
  status: string;
  grade: number;
  certificate_file_url: string;
  is_internal_course: boolean;
  completion_percentage: number;
  notes: string;
}

interface PerformanceReview {
  id: string;
  review_period: string;
  review_date: string;
  reviewer_name: string;
  reviewer_position: string;
  technical_score: number;
  behavioral_score: number;
  leadership_score: number;
  safety_score: number;
  overall_score: number;
  strengths: string;
  improvement_areas: string;
  positive_feedback: string;
  incidents: string;
  recommendations: string;
  career_progression_notes: string;
  review_status: string;
}

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  suggested_action: string;
  deadline: string;
  status: string;
  confidence_score: number;
}

interface DossierDocument {
  id: string;
  document_category: string;
  document_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  verification_status: string;
  verified_at: string;
  expiry_date: string;
  is_confidential: boolean;
  tags: string[];
  notes: string;
}

export const ProfessionalCrewDossier: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedCrewId, setSelectedCrewId] = useState<string>("");
  const [isHRUser, setIsHRUser] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [crewMember, setCrewMember] = useState<CrewMember | null>(null);
  const [dossier, setDossier] = useState<CrewDossier | null>(null);
  const [embarkations, setEmbarkations] = useState<CrewEmbarkation[]>([]);
  const [certifications, setCertifications] = useState<CrewCertification[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [vesselTypeFilter, setVesselTypeFilter] = useState("all");
  const [dpClassFilter, setDpClassFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    initializeDossier();
  }, [user]);

  useEffect(() => {
    if (selectedCrewId) {
      fetchDossierData();
    }
  }, [selectedCrewId]);

  const initializeDossier = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Verificar se é usuário de RH
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const isHR = roleData?.role === "admin" || roleData?.role === "hr_manager";
      setIsHRUser(isHR);

      if (isHR) {
        // Buscar todos os tripulantes
        const { data: allCrew, error } = await supabase
          .from("crew_members")
          .select("*")
          .order("full_name");

        if (error) throw error;
        setCrewMembers(allCrew || []);

        if (allCrew && allCrew.length > 0) {
          setSelectedCrewId(allCrew[0].id);
        }
      } else {
        // Buscar apenas o próprio tripulante
        const { data: ownCrew, error } = await supabase
          .from("crew_members")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          await createCrewMember();
          return;
        }

        setCrewMembers([ownCrew]);
        setSelectedCrewId(ownCrew.id);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dossiê",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCrewMember = async () => {
    if (!user) return;

    try {
      const { data: newCrew, error } = await supabase
        .from("crew_members")
        .insert({
          user_id: user.id,
          employee_id: user.email?.split("@")[0] || "temp_id",
          full_name: user.email?.split("@")[0] || "Usuário",
          position: "Marinheiro",
          rank: "Ordinary Seaman",
          nationality: "Brasil",
          email: user.email,
          status: "available",
        })
        .select()
        .single();

      if (error) throw error;

      setCrewMembers([newCrew]);
      setSelectedCrewId(newCrew.id);

      toast({
        title: "Perfil criado",
        description: "Seu perfil de tripulante foi criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar perfil de tripulante",
        variant: "destructive",
      });
    }
  };

  const fetchDossierData = async () => {
    if (!selectedCrewId) return;

    try {
      setLoading(true);

      // Buscar dados do tripulante
      const { data: memberData, error: memberError } = await supabase
        .from("crew_members")
        .select("*")
        .eq("id", selectedCrewId)
        .single();

      if (memberError) throw memberError;
      setCrewMember(memberData);

      // Buscar dossiê
      const { data: dossierData, error: dossierError } = await supabase
        .from("crew_dossier")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .maybeSingle();

      if (dossierError) throw dossierError;
      setDossier(dossierData);

      // Buscar embarques
      const { data: embarkData, error: embarkError } = await supabase
        .from("crew_embarkations")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .order("embark_date", { ascending: false });

      if (embarkError) throw embarkError;
      setEmbarkations(embarkData || []);

      // Buscar certificações
      const { data: certData, error: certError } = await supabase
        .from("crew_certifications")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .order("expiry_date", { ascending: true });

      if (certError) throw certError;
      setCertifications(certData || []);

      // Buscar avaliações de performance
      const { data: reviewData, error: reviewError } = await supabase
        .from("crew_performance_reviews")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .order("review_date", { ascending: false });

      if (reviewError) throw reviewError;
      setPerformanceReviews(reviewData || []);

      // Buscar recomendações de IA
      const { data: aiData, error: aiError } = await supabase
        .from("crew_ai_recommendations")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .eq("status", "active")
        .order("priority", { ascending: false });

      if (aiError) throw aiError;
      setAIRecommendations(aiData || []);

      // Buscar documentos
      const { data: docData, error: docError } = await supabase
        .from("crew_dossier_documents")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .order("upload_date", { ascending: false });

      if (docError) throw docError;
      setDocuments(docData || []);

      // Gerar recomendações de IA
      await generateAIRecommendations();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dossiê",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    if (!selectedCrewId) return;

    try {
      const { error } = await supabase.rpc("generate_crew_ai_recommendations", {
        crew_uuid: selectedCrewId,
      });

      if (error) throw error;

      // Recarregar recomendações
      const { data: aiData } = await supabase
        .from("crew_ai_recommendations")
        .select("*")
        .eq("crew_member_id", selectedCrewId)
        .eq("status", "active")
        .order("priority", { ascending: false });

      setAIRecommendations(aiData || []);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
      case "active":
      case "verified":
        return "bg-green-100 text-green-800";
      case "expiring_soon":
      case "expiring":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const calculateDashboardStats = () => {
    const totalEmbarkations = embarkations.length;
    const totalSeaTime = embarkations.reduce(
      (total, embark) => total + (embark.hours_worked || 0),
      0
    );
    const totalSeaDays = Math.round(totalSeaTime / 24);

    const vesselTypes = embarkations.reduce(
      (acc, embark) => {
        acc[embark.vessel_type || "Unknown"] = (acc[embark.vessel_type || "Unknown"] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostFrequentVesselType =
      Object.entries(vesselTypes).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    const dpOperations = embarkations.flatMap(embark => embark.dp_operation_modes || []);
    const mostFrequentDP = dpOperations.reduce(
      (acc, mode) => {
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topDPMode = Object.entries(mostFrequentDP).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    const avgPerformance =
      performanceReviews.length > 0
        ? performanceReviews.reduce((sum, review) => sum + review.overall_score, 0) /
          performanceReviews.length
        : 0;

    const validCertifications = certifications.filter(cert => cert.status === "valid").length;
    const totalCertifications = certifications.length;
    const complianceRate =
      totalCertifications > 0 ? (validCertifications / totalCertifications) * 100 : 0;

    return {
      totalEmbarkations,
      totalSeaDays,
      totalSeaTime,
      mostFrequentVesselType,
      topDPMode,
      avgPerformance: Math.round(avgPerformance * 10) / 10,
      complianceRate: Math.round(complianceRate),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dossiê profissional...</p>
        </div>
      </div>
    );
  }

  if (!crewMember) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Perfil não encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Não foi possível carregar os dados do tripulante
        </p>
        <Button onClick={initializeDossier}>Tentar Novamente</Button>
      </div>
    );
  }

  const stats = calculateDashboardStats();

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header with Crew Selection */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={dossier?.profile_photo_url} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10">
              {crewMember.full_name
                .split(" ")
                .map(n => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{crewMember.full_name}</h1>
            <p className="text-lg text-muted-foreground">
              {crewMember.position} - {crewMember.rank}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <Badge variant="outline">{crewMember.employee_id}</Badge>
              {dossier?.cat_number && <Badge variant="outline">CAT: {dossier.cat_number}</Badge>}
              {dossier?.cir_number && <Badge variant="outline">CIR: {dossier.cir_number}</Badge>}
            </div>
          </div>
        </div>

        {isHRUser && (
          <div className="flex items-center gap-4">
            <Select value={selectedCrewId} onValueChange={setSelectedCrewId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar tripulante" />
              </SelectTrigger>
              <SelectContent>
                {crewMembers.map(crew => (
                  <SelectItem key={crew.id} value={crew.id}>
                    {crew.full_name} - {crew.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        )}
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Embarques</p>
                <p className="text-2xl font-bold text-primary">{stats.totalEmbarkations}</p>
              </div>
              <Ship className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dias de Mar</p>
                <p className="text-2xl font-bold text-primary">{stats.totalSeaDays}</p>
                <p className="text-xs text-muted-foreground">{stats.totalSeaTime}h total</p>
              </div>
              <Waves className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-primary">{stats.avgPerformance}/10</p>
                <Progress value={stats.avgPerformance * 10} className="mt-1" />
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold text-primary">{stats.complianceRate}%</p>
                <Progress value={stats.complianceRate} className="mt-1" />
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recomendações Inteligentes
            </CardTitle>
            <CardDescription>
              Análises e sugestões baseadas em IA para otimizar a carreira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiRecommendations.map(recommendation => (
                <div
                  key={recommendation.id}
                  className={`p-4 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <p className="text-sm opacity-90 mt-1">{recommendation.description}</p>
                      {recommendation.suggested_action && (
                        <p className="text-sm font-medium mt-2">
                          💡 {recommendation.suggested_action}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {recommendation.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="embarkations">Embarques</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Matrícula</label>
                    <p className="text-sm text-muted-foreground">{crewMember.employee_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Posição Atual</label>
                    <p className="text-sm text-muted-foreground">{crewMember.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rank</label>
                    <p className="text-sm text-muted-foreground">{crewMember.rank}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Experiência</label>
                    <p className="text-sm text-muted-foreground">
                      {crewMember.experience_years} anos
                    </p>
                  </div>
                  {dossier?.cat_number && (
                    <div>
                      <label className="text-sm font-medium">CAT</label>
                      <p className="text-sm text-muted-foreground">{dossier.cat_number}</p>
                    </div>
                  )}
                  {dossier?.cir_number && (
                    <div>
                      <label className="text-sm font-medium">CIR</label>
                      <p className="text-sm text-muted-foreground">{dossier.cir_number}</p>
                    </div>
                  )}
                </div>

                {dossier?.cir_expiry_date && (
                  <div>
                    <label className="text-sm font-medium">Validade CIR</label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(dossier.cir_expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                      {differenceInDays(new Date(dossier.cir_expiry_date), new Date()) < 30 && (
                        <Badge variant="destructive" className="ml-2">
                          Vencendo
                        </Badge>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {embarkations.slice(0, 3).map(embark => (
                    <div key={embark.id} className="flex items-center space-x-3">
                      <Ship className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{embark.vessel_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(embark.embark_date), "dd/MM/yyyy", { locale: ptBR })} -
                          {embark.disembark_date
                            ? format(new Date(embark.disembark_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "Em curso"}
                        </p>
                      </div>
                      <Badge variant="outline">{embark.function_role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Embarkations Tab */}
        <TabsContent value="embarkations" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Buscar por embarcação..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="PSV">PSV</SelectItem>
                    <SelectItem value="AHTS">AHTS</SelectItem>
                    <SelectItem value="OSRV">OSRV</SelectItem>
                    <SelectItem value="ROV">ROV</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dpClassFilter} onValueChange={setDpClassFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Classe DP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="DP1">DP1</SelectItem>
                    <SelectItem value="DP2">DP2</SelectItem>
                    <SelectItem value="DP3">DP3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Embarkations List */}
          <div className="space-y-4">
            {embarkations
              .filter(
                embark =>
                  searchTerm === "" ||
                  embark.vessel_name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .filter(
                embark => vesselTypeFilter === "all" || embark.vessel_type === vesselTypeFilter
              )
              .filter(embark => dpClassFilter === "all" || embark.dp_class === dpClassFilter)
              .map(embark => (
                <Card key={embark.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{embark.vessel_name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Tipo
                            </label>
                            <p className="text-sm">{embark.vessel_type || "N/A"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Classe
                            </label>
                            <p className="text-sm">{embark.vessel_class || "N/A"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">DP</label>
                            <p className="text-sm">{embark.dp_class || "N/A"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Função
                            </label>
                            <p className="text-sm">{embark.function_role}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Embarque
                            </label>
                            <p className="text-sm">
                              {format(new Date(embark.embark_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Desembarque
                            </label>
                            <p className="text-sm">
                              {embark.disembark_date
                                ? format(new Date(embark.disembark_date), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
                                : "Em curso"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Horas
                            </label>
                            <p className="text-sm">{embark.hours_worked || 0}h</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Performance
                            </label>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">{embark.performance_rating || 0}/10</p>
                              {embark.performance_rating && (
                                <Progress
                                  value={embark.performance_rating * 10}
                                  className="w-16 h-2"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {embark.dp_operation_modes && embark.dp_operation_modes.length > 0 && (
                          <div className="mt-4">
                            <label className="text-xs font-medium text-muted-foreground">
                              Modos DP Operados
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {embark.dp_operation_modes.map((mode, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {mode}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {embark.equipment_operated && embark.equipment_operated.length > 0 && (
                          <div className="mt-4">
                            <label className="text-xs font-medium text-muted-foreground">
                              Equipamentos Operados
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {embark.equipment_operated.map((equipment, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {equipment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="space-y-4">
            {certifications.map(cert => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{cert.certification_name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                          <p className="text-sm">{cert.certification_type}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Autoridade
                          </label>
                          <p className="text-sm">{cert.issuing_authority}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Emissão
                          </label>
                          <p className="text-sm">
                            {format(new Date(cert.issue_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Validade
                          </label>
                          <p className="text-sm">
                            {format(new Date(cert.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      {cert.grade && (
                        <div className="mt-4">
                          <label className="text-xs font-medium text-muted-foreground">Nota</label>
                          <p className="text-sm">{cert.grade}/10</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(cert.status)}>
                        {cert.status === "valid"
                          ? "Válido"
                          : cert.status === "expiring_soon"
                            ? "Vencendo"
                            : "Expirado"}
                      </Badge>

                      {cert.certificate_file_url && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="space-y-4">
            {performanceReviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Avaliação - {review.review_period}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(review.review_date), "dd/MM/yyyy", { locale: ptBR })} -
                        Avaliador: {review.reviewer_name}
                      </p>
                    </div>
                    <Badge
                      className={
                        review.overall_score >= 8
                          ? "bg-green-100 text-green-800"
                          : review.overall_score >= 6
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {review.overall_score}/10
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Técnico</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.technical_score}/10</span>
                        <Progress value={review.technical_score * 10} className="flex-1 h-2" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Comportamental
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.behavioral_score}/10</span>
                        <Progress value={review.behavioral_score * 10} className="flex-1 h-2" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Segurança</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.safety_score}/10</span>
                        <Progress value={review.safety_score * 10} className="flex-1 h-2" />
                      </div>
                    </div>
                    {review.leadership_score && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Liderança
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{review.leadership_score}/10</span>
                          <Progress value={review.leadership_score * 10} className="flex-1 h-2" />
                        </div>
                      </div>
                    )}
                  </div>

                  {review.positive_feedback && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-green-700">Pontos Positivos</label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.positive_feedback}
                      </p>
                    </div>
                  )}

                  {review.improvement_areas && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-orange-700">
                        Áreas de Melhoria
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.improvement_areas}
                      </p>
                    </div>
                  )}

                  {review.recommendations && (
                    <div>
                      <label className="text-sm font-medium text-blue-700">Recomendações</label>
                      <p className="text-sm text-muted-foreground mt-1">{review.recommendations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Documentos</CardTitle>
              <CardDescription>
                Faça upload de certificados, atestados e outros documentos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <Button variant="outline">Selecionar Arquivos</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {documents.map(doc => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{doc.document_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_category} -
                          {format(new Date(doc.upload_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(doc.verification_status)}>
                        {doc.verification_status === "verified"
                          ? "Verificado"
                          : doc.verification_status === "pending"
                            ? "Pendente"
                            : "Rejeitado"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceReviews.slice(0, 5).map((review, index) => (
                    <div key={review.id} className="flex items-center justify-between">
                      <span className="text-sm">{review.review_period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.overall_score}/10</span>
                        <Progress value={review.overall_score * 10} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Embarcação Mais Frequente</label>
                  <p className="text-lg font-bold text-primary">{stats.mostFrequentVesselType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Modo DP Mais Operado</label>
                  <p className="text-lg font-bold text-primary">{stats.topDPMode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Taxa de Compliance</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{stats.complianceRate}%</span>
                    <Progress value={stats.complianceRate} className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
