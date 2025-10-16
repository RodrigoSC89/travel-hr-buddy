import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Wrench, 
  BarChart3, 
  Briefcase, 
  Brain,
  TrendingUp,
  FileText,
  Zap
} from "lucide-react";

const MMI = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Jobs Panel",
      description: "Gestão e visualização de jobs de manutenção",
      icon: Briefcase,
      path: "/mmi/jobs",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Business Intelligence",
      description: "Dashboard de BI e análises de MMI",
      icon: BarChart3,
      path: "/mmi/bi",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Job Creation Demo",
      description: "Demonstração de criação de jobs com exemplos similares",
      icon: Zap,
      path: "/mmi/job-creation-demo",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Wrench}
        title="MMI - Manutenção e Manutenibilidade Industrial"
        description="Central de gerenciamento de manutenção com inteligência artificial"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Integrada" },
          { icon: TrendingUp, label: "Analytics" },
          { icon: FileText, label: "Relatórios" }
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao MMI</CardTitle>
            <CardDescription>
              Sistema integrado de gestão de manutenção com inteligência artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O módulo MMI oferece ferramentas completas para gerenciamento de jobs,
              análises de business intelligence e otimização de processos de manutenção
              usando tecnologias de IA.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(module.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(module.path);
                    }}
                  >
                    Acessar Módulo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recursos Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Gestão de Jobs</h4>
                  <p className="text-sm text-muted-foreground">
                    Controle completo de jobs de manutenção
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Analytics Avançado</h4>
                  <p className="text-sm text-muted-foreground">
                    Dashboard com métricas e KPIs em tempo real
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">IA e Machine Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Sugestões inteligentes e análise preditiva
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Relatórios</h4>
                  <p className="text-sm text-muted-foreground">
                    Geração automática de relatórios detalhados
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
};

export default MMI;
