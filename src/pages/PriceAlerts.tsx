import { AdvancedPriceAlerts } from "@/components/price-alerts/advanced-price-alerts";
import { PriceAnalyticsDashboard } from "@/components/price-alerts/price-analytics-dashboard";
import { AIPricePredictor } from "@/components/price-alerts/ai-price-predictor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { 
  Brain, 
  BarChart3, 
  Target, 
  TrendingUp,
  Zap
} from "lucide-react";

const PriceAlerts = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={TrendingUp}
        title="Sistema Inteligente de Alertas de Preços"
        description="Monitoramento avançado com IA, analytics e insights acionáveis"
        gradient="orange"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: Zap, label: "Tempo Real" },
          { icon: Target, label: "Alertas Precisos" }
        ]}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger 
            value="alerts" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Target className="w-4 h-4 mr-2" />
            Alertas Inteligentes
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Avançado
          </TabsTrigger>
          <TabsTrigger 
            value="ai-predictor" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Brain className="w-4 h-4 mr-2" />
            IA Preditiva
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <AdvancedPriceAlerts />
        </TabsContent>

        <TabsContent value="analytics">
          <PriceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="ai-predictor">
          <AIPricePredictor />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default PriceAlerts;