import { PriceAlertsDashboard } from "@/components/price-alerts/price-alerts-dashboard-integrated";
import { PriceAnalyticsDashboard } from "@/components/price-alerts/price-analytics-dashboard";
import { AIPricePredictor } from "@/components/price-alerts/ai-price-predictor";
import { PriceRangeConfig } from "@/components/price-alerts/components/price-range-config";
import { EnhancedHistoryStats } from "@/components/price-alerts/components/enhanced-history-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { 
  Brain, 
  BarChart3, 
  Target, 
  TrendingUp,
  Zap,
  Settings,
  History
} from "lucide-react";
import { useState } from "react";
import { PriceRangeSettings } from "@/components/price-alerts/components/price-range-config";

const PriceAlerts = () => {
  const [priceRangeConfig, setPriceRangeConfig] = useState<PriceRangeSettings | undefined>();

  const handlePriceConfigSave = (config: PriceRangeSettings) => {
    setPriceRangeConfig(config);
    // Store in localStorage for persistence
    localStorage.setItem("price-range-config", JSON.stringify(config));
  };

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
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger 
            value="alerts" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Target className="w-4 h-4 mr-2" />
            Alertas Inteligentes
          </TabsTrigger>
          <TabsTrigger 
            value="config" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
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
          <PriceAlertsDashboard />
        </TabsContent>

        <TabsContent value="config">
          <PriceRangeConfig 
            onSave={handlePriceConfigSave}
            initialConfig={priceRangeConfig}
          />
        </TabsContent>

        <TabsContent value="history">
          <EnhancedHistoryStats />
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