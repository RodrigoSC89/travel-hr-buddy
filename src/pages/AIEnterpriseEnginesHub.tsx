/**
 * AI Enterprise Engines Hub
 * Unified hub for all 11 AI Enterprise modules
 * 
 * FUSION - MODERATE STRATEGY
 * Consolidates 11 AI specialized engines into 1 hub with tabs:
 * - Voyage & Logistics AI
 * - Safety & Incident AI
 * - Inventory & Spares AI
 * - Finance & Procurement AI
 * - Compliance AI
 * - Environmental AI
 * - Quality Management AI
 * - Contract & Legal AI
 * - Insurance & Claims AI
 * - Crewing & Payroll AI
 * - Reporting & Analytics AI
 * - Mobile & Offline AI
 * 
 * All original functionality is 100% preserved via lazy loading
 */

import React, { Suspense, lazy, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet-async";
import { 
  Ship, AlertTriangle, Package, DollarSign, Shield, Leaf,
  ClipboardCheck, FileText, Heart, Users, BarChart3, Smartphone,
  Loader2, Brain, Sparkles, Zap
} from "lucide-react";

// Lazy load all 11 AI Enterprise Engine pages (100% functionality preserved)
const VoyageLogisticsAIPage = lazy(() => import("@/pages/ai/VoyageLogisticsAIPage"));
const SafetyIncidentAIPage = lazy(() => import("@/pages/ai/SafetyIncidentAIPage"));
const InventorySparesAIPage = lazy(() => import("@/pages/ai/InventorySparesAIPage"));
const FinanceProcurementAIPage = lazy(() => import("@/pages/FinanceProcurementAIPage"));
const ComplianceAIPage = lazy(() => import("@/pages/ai/ComplianceAIPage"));
const EnvironmentalAIPage = lazy(() => import("@/pages/ai/EnvironmentalAIPage"));
const QualityManagementAIPage = lazy(() => import("@/pages/ai/QualityManagementAIPage"));
const ContractLegalAIPage = lazy(() => import("@/pages/ai/ContractLegalAIPage"));
const InsuranceClaimsAIPage = lazy(() => import("@/pages/ai/InsuranceClaimsAIPage"));
const CrewingPayrollAIPage = lazy(() => import("@/pages/ai/CrewingPayrollAIPage"));
const ReportingAnalyticsAIPage = lazy(() => import("@/pages/ai/ReportingAnalyticsAIPage"));
const MobileOfflineAIPage = lazy(() => import("@/pages/ai/MobileOfflineAIPage"));

// Loading skeleton
function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando motor de IA...</span>
    </div>
  );
}

// Tab configuration - all 12 AI engines
const TABS = [
  {
    id: "voyage",
    label: "Voyage",
    icon: Ship,
    emoji: "🗺️",
    description: "Route optimization, logistics AI",
    category: "Operations",
  },
  {
    id: "safety",
    label: "Safety",
    icon: AlertTriangle,
    emoji: "⚠️",
    description: "Incident prediction, root cause AI",
    category: "Operations",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    emoji: "📦",
    description: "Demand forecasting, auto-reorder",
    category: "Operations",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    emoji: "💰",
    description: "Cost prediction, procurement AI",
    category: "Business",
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    emoji: "🛡️",
    description: "Regulatory auto-compliance",
    category: "Governance",
  },
  {
    id: "environmental",
    label: "Environmental",
    icon: Leaf,
    emoji: "🌱",
    description: "Emissions tracking, decarbonization",
    category: "ESG",
  },
  {
    id: "quality",
    label: "Quality",
    icon: ClipboardCheck,
    emoji: "📋",
    description: "QMS, ISO 9001, CAPA",
    category: "Governance",
  },
  {
    id: "contract",
    label: "Contract",
    icon: FileText,
    emoji: "📝",
    description: "Contract analysis, legal AI",
    category: "Business",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: Heart,
    emoji: "❤️",
    description: "Claims processing automation",
    category: "Business",
  },
  {
    id: "crewing",
    label: "Crewing",
    icon: Users,
    emoji: "👥",
    description: "Payroll automation, HR AI",
    category: "HR",
  },
  {
    id: "reporting",
    label: "Reporting",
    icon: BarChart3,
    emoji: "📊",
    description: "BI dashboards, custom reports",
    category: "Analytics",
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    emoji: "📱",
    description: "Offline AI, on-device ML",
    category: "Platform",
  },
];

export default function AIEnterpriseEnginesHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "voyage";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <>
      <Helmet>
        <title>AI Enterprise Engines | Nauti One</title>
        <meta name="description" content="11 AI-powered specialized engines for maritime operations" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  AI Enterprise Engines
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    12 Engines
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Motores de IA especializados para operações marítimas
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-3">
              <Card className="px-4 py-2 bg-success/10 border-success/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    ML + GPT-4o
                  </span>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ativo:</span>
                  <span className="text-sm font-medium">{currentTab?.label}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs Navigation with horizontal scroll */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.emoji}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Tab Content - Lazy loaded with full functionality */}
            <div className="mt-6">
              <TabsContent value="voyage" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <VoyageLogisticsAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="safety" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <SafetyIncidentAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="inventory" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <InventorySparesAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="finance" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <FinanceProcurementAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="compliance" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <ComplianceAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="environmental" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <EnvironmentalAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="quality" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <QualityManagementAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="contract" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <ContractLegalAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="insurance" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <InsuranceClaimsAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="crewing" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <CrewingPayrollAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="reporting" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <ReportingAnalyticsAIPage />
                </Suspense>
              </TabsContent>

              <TabsContent value="mobile" className="m-0">
                <Suspense fallback={<TabLoadingSkeleton />}>
                  <MobileOfflineAIPage />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
