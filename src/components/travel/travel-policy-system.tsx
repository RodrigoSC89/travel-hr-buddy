import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Plane,
  Building,
  Utensils,
  FileText,
  Settings,
  Users,
  Lock,
  Unlock,
  Edit,
  Plus,
  Eye,
  Clock,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";

interface TravelPolicy {
  id: string;
  name: string;
  description: string;
  category: "accommodation" | "transport" | "meals" | "general" | "approval";
  rules: Array<{
    id: string;
    title: string;
    description: string;
    type: "limit" | "requirement" | "approval" | "restriction";
    value?: number;
    currency?: string;
    condition?: string;
    severity: "low" | "medium" | "high" | "critical";
    isActive: boolean;
  }>;
  applicableRoles: string[];
  effectiveDate: Date;
  lastUpdated: Date;
  isActive: boolean;
  createdBy: string;
}

interface PolicyViolation {
  id: string;
  policyId: string;
  ruleId: string;
  expenseId?: string;
  tripId?: string;
  violationType: "exceed_limit" | "missing_approval" | "invalid_category" | "policy_breach";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  amount?: number;
  limit?: number;
  detectedAt: Date;
  status: "pending" | "resolved" | "ignored" | "escalated";
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export const TravelPolicySystem: React.FC = () => {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<TravelPolicy[]>([]);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [activeTab, setActiveTab] = useState("policies");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<TravelPolicy | null>(null);
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);

  // Mock data
  const mockPolicies: TravelPolicy[] = [
    {
      id: "policy-001",
      name: "Política de Hospedagem Corporativa",
      description: "Diretrizes para hospedagem em viagens de negócios",
      category: "accommodation",
      rules: [
        {
          id: "rule-001",
          title: "Limite de Diária - Hotel",
          description: "Valor máximo por diária de hotel em território nacional",
          type: "limit",
          value: 400,
          currency: "BRL",
          condition: "per_night",
          severity: "high",
          isActive: true,
        },
        {
          id: "rule-002",
          title: "Reserva Antecipada Obrigatória",
          description: "Hospedagem deve ser reservada com pelo menos 7 dias de antecedência",
          type: "requirement",
          condition: "7_days_advance",
          severity: "medium",
          isActive: true,
        },
        {
          id: "rule-003",
          title: "Aprovação para Hotéis Luxo",
          description: "Hotéis acima de 4 estrelas requerem aprovação da diretoria",
          type: "approval",
          condition: "luxury_hotels",
          severity: "high",
          isActive: true,
        },
      ],
      applicableRoles: ["employee", "manager", "director"],
      effectiveDate: new Date("2024-01-01"),
      lastUpdated: new Date("2024-02-15"),
      isActive: true,
      createdBy: "Sistema de RH",
    },
    {
      id: "policy-002",
      name: "Política de Transporte e Deslocamento",
      description: "Normas para transporte aéreo, terrestre e urbano",
      category: "transport",
      rules: [
        {
          id: "rule-004",
          title: "Classe Executiva - Voos Internacionais",
          description: "Voos internacionais acima de 8 horas podem ser em classe executiva",
          type: "requirement",
          condition: "international_long_haul",
          severity: "medium",
          isActive: true,
        },
        {
          id: "rule-005",
          title: "Limite Taxi/Uber por Viagem",
          description: "Valor máximo para transporte urbano por viagem",
          type: "limit",
          value: 200,
          currency: "BRL",
          condition: "per_trip",
          severity: "medium",
          isActive: true,
        },
        {
          id: "rule-006",
          title: "Aprovação Voos Primeira Classe",
          description: "Voos em primeira classe requerem aprovação CEO",
          type: "approval",
          condition: "first_class",
          severity: "critical",
          isActive: true,
        },
      ],
      applicableRoles: ["employee", "manager", "director", "c_level"],
      effectiveDate: new Date("2024-01-15"),
      lastUpdated: new Date("2024-03-01"),
      isActive: true,
      createdBy: "Diretor de Operações",
    },
    {
      id: "policy-003",
      name: "Política de Alimentação e Refeições",
      description: "Diretrizes para despesas com alimentação durante viagens",
      category: "meals",
      rules: [
        {
          id: "rule-007",
          title: "Limite Diário - Alimentação",
          description: "Valor máximo por dia para alimentação (café, almoço, jantar)",
          type: "limit",
          value: 150,
          currency: "BRL",
          condition: "per_day",
          severity: "medium",
          isActive: true,
        },
        {
          id: "rule-008",
          title: "Refeições de Negócios",
          description: "Refeições com clientes/parceiros podem exceder limite padrão",
          type: "requirement",
          condition: "business_meals",
          severity: "low",
          isActive: true,
        },
      ],
      applicableRoles: ["employee", "manager"],
      effectiveDate: new Date("2024-02-01"),
      lastUpdated: new Date("2024-02-01"),
      isActive: true,
      createdBy: "Gerente Financeiro",
    },
  ];

  const mockViolations: PolicyViolation[] = [
    {
      id: "violation-001",
      policyId: "policy-001",
      ruleId: "rule-001",
      expenseId: "exp-001",
      tripId: "trip-001",
      violationType: "exceed_limit",
      description: "Diária de hotel excedeu o limite permitido em R$ 150,00",
      severity: "high",
      amount: 550,
      limit: 400,
      detectedAt: new Date("2024-03-16"),
      status: "pending",
    },
    {
      id: "violation-002",
      policyId: "policy-002",
      ruleId: "rule-006",
      expenseId: "exp-002",
      tripId: "trip-002",
      violationType: "missing_approval",
      description: "Voo em primeira classe sem aprovação prévia do CEO",
      severity: "critical",
      amount: 8500,
      detectedAt: new Date("2024-03-15"),
      status: "escalated",
    },
    {
      id: "violation-003",
      policyId: "policy-003",
      ruleId: "rule-007",
      expenseId: "exp-003",
      tripId: "trip-001",
      violationType: "exceed_limit",
      description: "Despesas com alimentação excederam limite diário",
      severity: "medium",
      amount: 220,
      limit: 150,
      detectedAt: new Date("2024-03-17"),
      status: "resolved",
      resolvedBy: "Supervisor",
      resolvedAt: new Date("2024-03-18"),
      resolution: "Aprovado como refeição de negócios",
    },
  ];

  useEffect(() => {
    loadPoliciesAndViolations();
  }, []);

  const loadPoliciesAndViolations = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from Supabase
      setPolicies(mockPolicies);
      setViolations(mockViolations);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar políticas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "accommodation":
        return <Building className="h-4 w-4" />;
      case "transport":
        return <Plane className="h-4 w-4" />;
      case "meals":
        return <Utensils className="h-4 w-4" />;
      case "general":
        return <FileText className="h-4 w-4" />;
      case "approval":
        return <Shield className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getViolationStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "escalated":
        return "bg-red-100 text-red-800 border-red-300";
      case "ignored":
        return "bg-secondary text-secondary-foreground border-border";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const activeViolations = violations.filter(
    v => v.status === "pending" || v.status === "escalated"
  );
  const criticalViolations = violations.filter(
    v => v.severity === "critical" && v.status !== "resolved"
  );
  const activePolicies = policies.filter(p => p.isActive);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Políticas Ativas</p>
                <p className="text-3xl font-bold text-primary">{activePolicies.length}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  {policies.reduce(
                    (sum, p) => sum + p.rules.filter(r => r.isActive).length,
                    0
                  )}{" "}
                  regras
                </p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violações Ativas</p>
                <p className="text-3xl font-bold text-warning">{activeViolations.length}</p>
                <p className="text-xs text-warning flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  Requer atenção
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-3xl font-bold text-destructive">{criticalViolations.length}</p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <Zap className="h-3 w-3" />
                  Ação imediata
                </p>
              </div>
              <Zap className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conformidade</p>
                <p className="text-3xl font-bold text-success">
                  {violations.length > 0
                    ? Math.round(
                        ((violations.length - activeViolations.length) / violations.length) * 100
                      )
                    : 100}
                  %
                </p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  Última semana
                </p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert para violações críticas */}
      {criticalViolations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> Existem {criticalViolations.length} violação(ões) crítica(s)
            que requerem ação imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Violações
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Conformidade
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestão
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Políticas de Viagem</h3>
            <Button className="btn-travel">
              <Plus className="h-4 w-4 mr-2" />
              Nova Política
            </Button>
          </div>

          <div className="grid gap-4">
            {policies.map(policy => (
              <Card
                key={policy.id}
                className="travel-card hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getCategoryIcon(policy.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{policy.name}</h4>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                        <Badge
                          className={
                            policy.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-secondary text-secondary-foreground"
                          }
                        >
                          {policy.isActive ? (
                            <Unlock className="h-3 w-3 mr-1" />
                          ) : (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {policy.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{policy.rules.length} regras</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{policy.applicableRoles.length} perfis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Atualizada: {policy.lastUpdated.toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Regras da política */}
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Principais Regras:</p>
                        <div className="space-y-2">
                          {policy.rules.slice(0, 3).map(rule => (
                            <div
                              key={rule.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getSeverityColor(rule.severity)}
                                  variant="outline"
                                >
                                  {rule.severity}
                                </Badge>
                                <span className="text-sm">{rule.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {rule.value && (
                                  <span className="text-sm font-medium">
                                    {formatCurrency(rule.value)}
                                  </span>
                                )}
                                {rule.isActive ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          ))}
                          {policy.rules.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{policy.rules.length - 3} regras adicionais
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="btn-travel">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{policy.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div>
                              <Label>Descrição</Label>
                              <p className="text-sm mt-1">{policy.description}</p>
                            </div>

                            <div>
                              <Label>Regras da Política</Label>
                              <div className="space-y-3 mt-2">
                                {policy.rules.map(rule => (
                                  <div key={rule.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium">{rule.title}</h5>
                                      <div className="flex gap-2">
                                        <Badge className={getSeverityColor(rule.severity)}>
                                          {rule.severity}
                                        </Badge>
                                        <Badge
                                          className={
                                            rule.isActive
                                              ? "bg-green-100 text-green-800"
                                              : "bg-secondary text-secondary-foreground"
                                          }
                                        >
                                          {rule.isActive ? "Ativa" : "Inativa"}
                                        </Badge>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {rule.description}
                                    </p>
                                    {rule.value && (
                                      <p className="text-sm font-medium">
                                        Limite: {formatCurrency(rule.value)}{" "}
                                        {rule.condition && `(${rule.condition})`}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Perfis Aplicáveis</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {policy.applicableRoles.map(role => (
                                    <Badge key={role} variant="outline">
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label>Data de Vigência</Label>
                                <p className="text-sm mt-1">
                                  {policy.effectiveDate.toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="btn-travel">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Violações de Política</h3>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                  <SelectItem value="escalated">Escaladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {violations.map(violation => (
              <Card
                key={violation.id}
                className="travel-card hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            violation.severity === "critical"
                              ? "bg-red-100"
                              : violation.severity === "high"
                                ? "bg-orange-100"
                                : violation.severity === "medium"
                                  ? "bg-yellow-100"
                                  : "bg-green-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              violation.severity === "critical"
                                ? "text-red-600"
                                : violation.severity === "high"
                                  ? "text-orange-600"
                                  : violation.severity === "medium"
                                    ? "text-yellow-600"
                                    : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{violation.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Detectada em {violation.detectedAt.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                        <Badge className={getViolationStatusColor(violation.status)}>
                          {violation.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {violation.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>Valor: {formatCurrency(violation.amount)}</span>
                          </div>
                        )}
                        {violation.limit && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span>Limite: {formatCurrency(violation.limit)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>Tipo: {violation.violationType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Status: {violation.status}</span>
                        </div>
                      </div>

                      {violation.resolution && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Resolução:</strong> {violation.resolution}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Resolvido por {violation.resolvedBy} em{" "}
                            {violation.resolvedAt?.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {violation.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Zap className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" className="btn-travel">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Relatório de Conformidade
              </CardTitle>
              <CardDescription>
                Análise detalhada do cumprimento das políticas de viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Taxa de Conformidade por Categoria</h4>
                  {["accommodation", "transport", "meals", "general"].map(category => {
                    const categoryPolicies = policies.filter(p => p.category === category);
                    const categoryViolations = violations.filter(v => {
                      const policy = policies.find(p => p.id === v.policyId);
                      return policy?.category === category;
                    });
                    const compliance =
                      categoryViolations.length > 0
                        ? ((categoryViolations.length -
                            categoryViolations.filter(
                              v => v.status === "pending" || v.status === "escalated"
                            ).length) /
                            categoryViolations.length) *
                          100
                        : 100;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round(compliance)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${compliance >= 90 ? "bg-green-500" : compliance >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${compliance}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Tendência de Violações</h4>
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4" />
                    <p>Gráfico de tendência será implementado</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Gestão de Políticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Criar Nova Política</h4>
                    <p className="text-sm text-muted-foreground">Definir novas regras e limites</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Guia de Políticas</h4>
                    <p className="text-sm text-muted-foreground">Manual de referência</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Gerenciar Perfis</h4>
                    <p className="text-sm text-muted-foreground">Definir aplicabilidade</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Alertas e Notificações</h4>
                    <p className="text-sm text-muted-foreground">Configurar avisos</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
