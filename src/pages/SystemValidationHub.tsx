import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  Satellite,
  Map,
  BarChart3,
  Rocket,
  FileText,
  DollarSign,
  Grid3x3,
  Plane,
  Brain,
  AlertTriangle,
  Navigation,
  Waves,
  Radio,
  Activity,
} from "lucide-react";

interface PatchInfo {
  number: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  category: "consolidation" | "feature" | "ai" | "infrastructure";
}

export default function SystemValidationHub() {
  const navigate = useNavigate();

  const patches: PatchInfo[] = [
    {
      number: "416",
      title: "Crew Consolidado",
      description: "Sistema unificado de gestão de tripulação",
      icon: Users,
      route: "/validation/crew-consolidado",
      category: "consolidation",
    },
    {
      number: "442",
      title: "SATCOM v2",
      description: "Sistema de comunicação via satélite",
      icon: Satellite,
      route: "/validation/satcom-v2",
      category: "infrastructure",
    },
    {
      number: "456",
      title: "Navigation Copilot",
      description: "Navegação assistida por IA",
      icon: Map,
      route: "/validation/navigation-copilot",
      category: "ai",
    },
    {
      number: "461",
      title: "Sensors Hub",
      description: "Dashboard funcional por tipo de sensor",
      icon: BarChart3,
      route: "/validation/sensors-hub",
      category: "feature",
    },
    {
      number: "462",
      title: "Mission Consolidation",
      description: "Consolidação dos módulos de missão",
      icon: Rocket,
      route: "/validation/mission-consolidation",
      category: "consolidation",
    },
    {
      number: "463",
      title: "Template Editor",
      description: "Editor drag-and-drop com placeholders dinâmicos",
      icon: FileText,
      route: "/validation/template-editor",
      category: "feature",
    },
    {
      number: "464",
      title: "Price Alerts",
      description: "Sistema de alertas de preços",
      icon: DollarSign,
      route: "/validation/price-alerts",
      category: "feature",
    },
    {
      number: "465",
      title: "Validation Panel",
      description: "Painel de validação técnica",
      icon: Grid3x3,
      route: "/validation/panel",
      category: "feature",
    },
    {
      number: "466",
      title: "Crew Consolidation",
      description: "Consolidação final do módulo crew",
      icon: Users,
      route: "/validation/crew-consolidation",
      category: "consolidation",
    },
    {
      number: "467",
      title: "Drone Commander",
      description: "Sistema de comando de drones",
      icon: Plane,
      route: "/validation/drone-commander",
      category: "feature",
    },
    {
      number: "468",
      title: "Document Templates v1",
      description: "Biblioteca de templates de documentos",
      icon: FileText,
      route: "/validation/document-templates-v1",
      category: "feature",
    },
    {
      number: "469",
      title: "Price Alerts UI v2",
      description: "Interface melhorada de alertas de preços",
      icon: DollarSign,
      route: "/validation/price-alerts-v2",
      category: "feature",
    },
    {
      number: "470",
      title: "Document Hub Consolidado",
      description: "Unificação dos módulos de documentos",
      icon: FileText,
      route: "/validation/document-hub-consolidated",
      category: "consolidation",
    },
    {
      number: "471",
      title: "Coordination AI",
      description: "Orquestração de múltiplos agentes",
      icon: Brain,
      route: "/validation/coordination-ai",
      category: "ai",
    },
    {
      number: "472",
      title: "Incident Replay AI",
      description: "Análise de incidentes com IA",
      icon: AlertTriangle,
      route: "/validation/incident-replay-ai",
      category: "ai",
    },
    {
      number: "473",
      title: "Incidents Consolidation",
      description: "Consolidação de relatórios de incidentes",
      icon: AlertTriangle,
      route: "/validation/incidents-consolidation",
      category: "consolidation",
    },
    {
      number: "474",
      title: "Route Planner v1",
      description: "Planejador de rotas com visualização",
      icon: Navigation,
      route: "/validation/route-planner",
      category: "feature",
    },
    {
      number: "475",
      title: "Sonar AI (Experimental)",
      description: "Análise de sonar com inferência AI",
      icon: Waves,
      route: "/validation/sonar-ai",
      category: "ai",
    },
    {
      number: "476",
      title: "SATCOM v1",
      description: "Sistema de comunicação satélite v1",
      icon: Satellite,
      route: "/validation/satcom-v1",
      category: "infrastructure",
    },
    {
      number: "477",
      title: "Mission Engine",
      description: "Motor de execução de missões",
      icon: Rocket,
      route: "/validation/mission-engine",
      category: "feature",
    },
    {
      number: "478",
      title: "Crew Module Consolidation",
      description: "Consolidação final de módulos crew",
      icon: Users,
      route: "/validation/crew-module-consolidation",
      category: "consolidation",
    },
    {
      number: "479",
      title: "Sonar AI Detalhado",
      description: "Sistema avançado de sonar com IA",
      icon: Waves,
      route: "/validation/sonar-ai-detailed",
      category: "ai",
    },
    {
      number: "480",
      title: "Document Module Unification",
      description: "Unificação de módulos de documentos",
      icon: FileText,
      route: "/validation/document-unification",
      category: "consolidation",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "consolidation":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "feature":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "ai":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "infrastructure":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "consolidation":
        return "Consolidação";
      case "feature":
        return "Feature";
      case "ai":
        return "IA";
      case "infrastructure":
        return "Infraestrutura";
      default:
        return category;
    }
  };

  const stats = {
    total: patches.length,
    consolidation: patches.filter((p) => p.category === "consolidation").length,
    feature: patches.filter((p) => p.category === "feature").length,
    ai: patches.filter((p) => p.category === "ai").length,
    infrastructure: patches.filter((p) => p.category === "infrastructure").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sistema de Validação de Patches
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Central de validação técnica para todos os módulos e funcionalidades do sistema
          </p>
        </div>

        {/* Statistics */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Estatísticas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground mt-1">Total de Patches</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.consolidation}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Consolidações</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.feature}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Features</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.ai}
                </div>
                <div className="text-sm text-muted-foreground mt-1">IA</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.infrastructure}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Infraestrutura</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patches.map((patch) => {
            const Icon = patch.icon;
            return (
              <Card
                key={patch.number}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50 hover:border-primary/50"
                onClick={() => navigate(patch.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="font-mono">
                        #{patch.number}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(patch.category)}>
                      {getCategoryLabel(patch.category)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {patch.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {patch.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Validar Patch
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-semibold">Sistema de Validação Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Todos os patches disponíveis para validação técnica
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
