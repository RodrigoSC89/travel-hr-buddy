/**
 * Travel Command Module - Complete Personnel Logistics
 * Módulo completo de logística de pessoal com todas as funcionalidades
 */

import React, { Suspense, lazy } from "react";
import { ShipLoader } from "@/components/ui/ship-loader";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Hotel, ClipboardCheck, Receipt, Navigation, BarChart3,
  Users, Settings, Activity, Sparkles
} from "lucide-react";

// Lazy load components for better performance
const TravelCommandDashboard = lazy(() => import("./components/TravelCommandDashboard"));
const FlightBookingPanel = lazy(() => import("./components/FlightBookingPanel"));
const HotelReservationPanel = lazy(() => import("./components/HotelReservationPanel"));
const TravelApprovalWorkflow = lazy(() => import("./components/TravelApprovalWorkflow"));
const ExpenseManagementPanel = lazy(() => import("./components/ExpenseManagementPanel"));
const CrewTrackingPanel = lazy(() => import("./components/CrewTrackingPanel"));
const TravelerSafetyPanel = lazy(() => import("./components/TravelerSafetyPanel"));
const TravelAnalyticsPanel = lazy(() => import("./components/TravelAnalyticsPanel"));

const LoadingFallback = () => <ShipLoader size="md" className="h-96" />;

const TravelCommandModule = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Plane}
        title="Travel Command"
        description="Logística Completa de Pessoal - Passagens, Hotéis, Aprovações e Rastreamento"
        gradient="blue"
        badges={[
          { icon: Plane, label: "Voos" },
          { icon: Hotel, label: "Hotéis" },
          { icon: Navigation, label: "Tracking" },
          { icon: Receipt, label: "Despesas" }
        ]}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full max-w-6xl grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Comando
          </TabsTrigger>
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Passagens
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotéis
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Aprovações
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Rastreamento
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Suspense fallback={<LoadingFallback />}>
            <TravelCommandDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="flights">
          <Suspense fallback={<LoadingFallback />}>
            <FlightBookingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="hotels">
          <Suspense fallback={<LoadingFallback />}>
            <HotelReservationPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="approvals">
          <Suspense fallback={<LoadingFallback />}>
            <TravelApprovalWorkflow />
          </Suspense>
        </TabsContent>

        <TabsContent value="expenses">
          <Suspense fallback={<LoadingFallback />}>
            <ExpenseManagementPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="safety">
          <Suspense fallback={<LoadingFallback />}>
            <TravelerSafetyPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="tracking">
          <Suspense fallback={<LoadingFallback />}>
            <CrewTrackingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingFallback />}>
            <TravelAnalyticsPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default TravelCommandModule;
