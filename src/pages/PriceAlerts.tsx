import { AdvancedPriceAlerts } from '@/components/price-alerts/advanced-price-alerts';
import { PriceAnalyticsDashboard } from '@/components/price-alerts/price-analytics-dashboard';
import { AIPricePredictor } from '@/components/price-alerts/ai-price-predictor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BarChart3, 
  Target, 
  TrendingUp 
} from 'lucide-react';

const PriceAlerts = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sistema Inteligente de Alertas de Preços</h1>
            <p className="text-muted-foreground">
              Monitoramento avançado com IA, analytics e insights acionáveis
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default PriceAlerts;