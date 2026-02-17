/**
 * Finance & Procurement AI Dashboard Page
 * Complete financial management with AI-powered features
 */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Brain, ShoppingCart, FileText, BarChart3,
  TrendingUp, Sparkles
} from 'lucide-react';
import { PredictiveCostDashboard } from '@/modules/finance/components/PredictiveCostDashboard';
import { IntelligentProcurement } from '@/modules/finance/components/IntelligentProcurement';
import { InvoiceAutomation } from '@/modules/finance/components/InvoiceAutomation';
import { BudgetForecastingAI } from '@/modules/finance/components/BudgetForecastingAI';

export default function FinanceProcurementAIPage() {
  const [activeTab, setActiveTab] = useState('costs');

  return (
    <>
      <Helmet>
        <title>Finance & Procurement AI | Nauti One</title>
        <meta name="description" content="AI-powered financial management and procurement optimization" />
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-success/20 to-success/10">
              <DollarSign className="h-8 w-8 text-success" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Finance & Procurement AI
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  ML + IA
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Predição de custos, procurement inteligente e automação de faturas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-success/10">
              <TrendingUp className="h-4 w-4 mr-2 text-success" />
              $750k economia/ano
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              95% automação
            </Badge>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Predição de Custos
            </TabsTrigger>
            <TabsTrigger value="procurement" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Procurement AI
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Automação Faturas
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget & Forecast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="costs" className="mt-6">
            <PredictiveCostDashboard />
          </TabsContent>

          <TabsContent value="procurement" className="mt-6">
            <IntelligentProcurement />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <InvoiceAutomation />
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <BudgetForecastingAI />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
