/**
 * Travel Command Premium - Centro de Logística de Pessoal Completo
 * Integra todos os componentes de viagem com IA
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Plane, Hotel, ClipboardCheck, Receipt,
  Navigation, BarChart3, Users, Shield, MapPin
} from "lucide-react";

// Lazy load components
const TravelCommandDashboard = lazy(() => import("@/modules/travel-command/components/TravelCommandDashboard"));
const FlightBookingPanel = lazy(() => import("@/modules/travel-command/components/FlightBookingPanel"));
const HotelReservationPanel = lazy(() => import("@/modules/travel-command/components/HotelReservationPanel"));
const TravelApprovalWorkflow = lazy(() => import("@/modules/travel-command/components/TravelApprovalWorkflow"));
const ExpenseManagementPanel = lazy(() => import("@/modules/travel-command/components/ExpenseManagementPanel"));
const CrewTrackingPanel = lazy(() => import("@/modules/travel-command/components/CrewTrackingPanel"));
const TravelerSafetyPanel = lazy(() => import("@/modules/travel-command/components/TravelerSafetyPanel"));
const TravelAnalyticsPanel = lazy(() => import("@/modules/travel-command/components/TravelAnalyticsPanel"));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function TravelCommandPremium() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8 text-blue-500" />
            Travel Command
          </h1>
          <p className="text-muted-foreground mt-1">
            Logística completa de pessoal - Passagens, Hotéis, Aprovações e Rastreamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
            <Plane className="h-3 w-3 mr-1" />
            23 Viagens Ativas
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            94.2% Pontualidade
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 h-auto p-1">
          <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Comando</span>
          </TabsTrigger>
          <TabsTrigger value="flights" className="flex flex-col items-center gap-1 py-2">
            <Plane className="h-4 w-4" />
            <span className="text-xs">Passagens</span>
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex flex-col items-center gap-1 py-2">
            <Hotel className="h-4 w-4" />
            <span className="text-xs">Hotéis</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex flex-col items-center gap-1 py-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="text-xs">Aprovações</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex flex-col items-center gap-1 py-2">
            <Receipt className="h-4 w-4" />
            <span className="text-xs">Despesas</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex flex-col items-center gap-1 py-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex flex-col items-center gap-1 py-2">
            <Navigation className="h-4 w-4" />
            <span className="text-xs">Rastreamento</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Suspense fallback={<LoadingSkeleton />}>
            <TravelCommandDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="flights">
          <Suspense fallback={<LoadingSkeleton />}>
            <FlightBookingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="hotels">
          <Suspense fallback={<LoadingSkeleton />}>
            <HotelReservationPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="approvals">
          <Suspense fallback={<LoadingSkeleton />}>
            <TravelApprovalWorkflow />
          </Suspense>
        </TabsContent>

        <TabsContent value="expenses">
          <Suspense fallback={<LoadingSkeleton />}>
            <ExpenseManagementPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="safety">
          <Suspense fallback={<LoadingSkeleton />}>
            <TravelerSafetyPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="tracking">
          <Suspense fallback={<LoadingSkeleton />}>
            <CrewTrackingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingSkeleton />}>
            <TravelAnalyticsPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
