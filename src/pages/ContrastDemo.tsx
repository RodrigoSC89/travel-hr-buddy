import React from "react";
import { SEOHead } from "@/components/seo/seo-head";
import { HighContrastCard } from "@/components/ui/high-contrast-card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DollarSign, Ship, Users, Shield, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHighContrastTheme } from "@/hooks/useHighContrastTheme";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Página de demonstração do sistema de alto contraste WCAG AAA
 * PATCH 45.0 - UI Contrast & Accessibility Fix
 */
const ContrastDemo: React.FC = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();

  return (
    <>
      <SEOHead 
        title="Demo de Alto Contraste - Nautilus One"
        description="Demonstração do sistema de cores com alto contraste WCAG AAA para operações offshore"
        keywords="contraste, acessibilidade, WCAG AAA, offshore, maritime"
      />
      
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Activity}
          title="Sistema de Alto Contraste"
          description="WCAG AAA Compliant - Contraste 7:1+ para máxima legibilidade em ambientes offshore"
          gradient="blue"
          badges={[
            { icon: Shield, label: "WCAG AAA" },
            { icon: Zap, label: "7:1+ Contraste" },
            { icon: Activity, label: "Offshore Ready" }
          ]}
        />

        <div className="space-y-8">
          {/* Control Panel */}
          <Card className="border-2 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Modo Alto Contraste</CardTitle>
                  <CardDescription className="mt-1">
                    Ative para forçar contraste máximo em todos os componentes
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={isHighContrast ? "default" : "secondary"}>
                    {isHighContrast ? "Ativado" : "Desativado"}
                  </Badge>
                  <Button 
                    onClick={toggleHighContrast}
                    variant={isHighContrast ? "default" : "outline"}
                    aria-label={isHighContrast ? "Desativar modo de alto contraste" : "Ativar modo de alto contraste"}
                  >
                    {isHighContrast ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HighContrastCard
              title="Receita Operacional"
              value="R$ 12,5M"
              description="Forecast: R$ 14,8M"
              icon={DollarSign}
              trend="up"
              trendValue="+12.5%"
              colorScheme="green"
            />

            <HighContrastCard
              title="Eficiência da Frota"
              value="94.2%"
              description="Target: 98%"
              icon={Ship}
              trend="up"
              trendValue="+1.8%"
              colorScheme="blue"
            />

            <HighContrastCard
              title="Equipe Ativa"
              value="145"
              description="Tripulantes embarcados"
              icon={Users}
              trend="stable"
              trendValue="0%"
              colorScheme="purple"
            />

            <HighContrastCard
              title="Score de Segurança"
              value="92.8%"
              description="Conformidade PEOTRAM"
              icon={Shield}
              trend="up"
              trendValue="+4.3%"
              colorScheme="orange"
            />
          </div>

          {/* Color Palette Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>Esquema de cores de alto contraste</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-card-green border-2"></div>
                  <div>
                    <p className="font-semibold">Verde - Receita</p>
                    <p className="text-sm text-muted-foreground">Sucesso / Crescimento</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-card-blue border-2"></div>
                  <div>
                    <p className="font-semibold">Azul - Frota</p>
                    <p className="text-sm text-muted-foreground">Eficiência / Operações</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-card-purple border-2"></div>
                  <div>
                    <p className="font-semibold">Roxo - Equipe</p>
                    <p className="text-sm text-muted-foreground">Recursos Humanos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-card-orange border-2"></div>
                  <div>
                    <p className="font-semibold">Laranja - Segurança</p>
                    <p className="text-sm text-muted-foreground">Alertas / Atenção</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Padrões de Contraste</CardTitle>
                <CardDescription>Conformidade WCAG</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">WCAG AA</span>
                    <Badge variant="secondary">4.5:1</Badge>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: "100%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">WCAG AAA</span>
                    <Badge variant="default">7:1</Badge>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium">
                    ✅ Todos os componentes atendem WCAG AAA
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contraste mínimo de 7:1 para texto normal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accessibility Features */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Recursos de Acessibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Touch Targets</h4>
                  <p className="text-sm text-muted-foreground">
                    Botões com mínimo 44x44px para facilitar toque
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Aria Labels</h4>
                  <p className="text-sm text-muted-foreground">
                    Componentes com labels descritivos
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Focus States</h4>
                  <p className="text-sm text-muted-foreground">
                    Estados de foco visíveis para navegação por teclado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </>
  );
};

export default ContrastDemo;
