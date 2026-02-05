/**
 * Medical Infirmary Premium - Enfermaria Digital Completa
 * TIER-1 Implementation based on VIKAND, Marine Doctor benchmarks
 */

import React, { Suspense, lazy, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Stethoscope, Video, Pill, 
  FileText, Heart, ShieldCheck, AlertTriangle, Activity, Package, User, Syringe
} from "lucide-react";

// Lazy load original components
const EnhancedInfirmaryDashboard = lazy(() => import("@/modules/medical-infirmary/components/EnhancedInfirmaryDashboard"));
const TelemedicineConsult = lazy(() => import("@/modules/medical-infirmary/components/TelemedicineConsult"));
const MedicalConsultationsTab = lazy(() => import("@/modules/medical-infirmary/components/MedicalConsultationsTab"));
const EmergencyProtocolsPanel = lazy(() => import("@/modules/medical-infirmary/components/EmergencyProtocolsPanel"));
const PharmacyManagementPanel = lazy(() => import("@/modules/medical-infirmary/components/PharmacyManagementPanel"));
const SuppliesTab = lazy(() => import("@/modules/medical-infirmary/components/SuppliesTab"));
const MedicalIntelligenceHub = lazy(() => import("@/components/premium/MedicalIntelligenceHub"));

// Tier-1 Components
const TelemedicinePortal = lazy(() => import("@/components/tier1/medical/TelemedicinePortal"));
const MedicalRecordsEHR = lazy(() => import("@/components/tier1/medical/MedicalRecordsEHR"));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function MedicalInfirmaryPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "telemedicine";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-destructive" />
            Digital Infirmary
          </h1>
          <p className="text-muted-foreground mt-1">
            24/7 Telemedicine + Electronic Health Records (EHR)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Video className="h-3 w-3 mr-1" />
            Telemedicine Online
          </Badge>
          <Badge variant="outline">TIER-1</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="telemedicine" className="flex flex-col items-center gap-1 py-2">
            <Video className="h-4 w-4" />
            <span className="text-xs">Telemedicine</span>
          </TabsTrigger>
          <TabsTrigger value="ehr" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">EHR</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Consultas</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex flex-col items-center gap-1 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Emergência</span>
          </TabsTrigger>
          <TabsTrigger value="pharmacy" className="flex flex-col items-center gap-1 py-2">
            <Pill className="h-4 w-4" />
            <span className="text-xs">Farmácia</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex flex-col items-center gap-1 py-2">
            <Package className="h-4 w-4" />
            <span className="text-xs">Supplies</span>
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="flex flex-col items-center gap-1 py-2">
            <Syringe className="h-4 w-4" />
            <span className="text-xs">Vacinas</span>
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex flex-col items-center gap-1 py-2">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Bem-estar</span>
          </TabsTrigger>
          <TabsTrigger value="mlc" className="flex flex-col items-center gap-1 py-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">MLC 4.1</span>
          </TabsTrigger>
        </TabsList>

        {/* Tier-1 Telemedicine Portal */}
        <TabsContent value="telemedicine">
          <Suspense fallback={<LoadingSkeleton />}>
            <TelemedicinePortal />
          </Suspense>
        </TabsContent>

        {/* Tier-1 Electronic Health Records */}
        <TabsContent value="ehr">
          <Suspense fallback={<LoadingSkeleton />}>
            <MedicalRecordsEHR />
          </Suspense>
        </TabsContent>

        <TabsContent value="dashboard">
          <Suspense fallback={<LoadingSkeleton />}>
            <EnhancedInfirmaryDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="consultations">
          <Suspense fallback={<LoadingSkeleton />}>
            <MedicalConsultationsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="emergency">
          <Suspense fallback={<LoadingSkeleton />}>
            <EmergencyProtocolsPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="pharmacy">
          <Suspense fallback={<LoadingSkeleton />}>
            <PharmacyManagementPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="supplies">
          <Suspense fallback={<LoadingSkeleton />}>
            <SuppliesTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Suspense fallback={<LoadingSkeleton />}>
            <MedicalIntelligenceHub />
          </Suspense>
        </TabsContent>

        <TabsContent value="wellness">
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Programa de Bem-estar</p>
            <p className="text-sm">Saúde mental e física da tripulação</p>
          </div>
        </TabsContent>

        <TabsContent value="mlc">
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Conformidade MLC 4.1</p>
            <p className="text-sm">Regulação de saúde e assistência médica</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}