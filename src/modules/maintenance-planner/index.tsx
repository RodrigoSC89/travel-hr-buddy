import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, Calendar, CheckCircle, AlertTriangle, Plus, Download, 
  Bell, Bot, Ship, Activity, LayoutGrid, Clock, FileText, Box
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Try to import enhanced version, fallback to basic
const MaintenancePlanner = React.lazy(() => 
  import("./MaintenancePlannerEnhanced").catch(() => ({
    default: () => {
      // Basic fallback component
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Manutenção Inteligente</h1>
          <p className="text-muted-foreground">Carregando módulo...</p>
        </div>
      );
    }
  }))
);

export default function MaintenancePlannerWrapper() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <MaintenancePlanner />
    </React.Suspense>
  );
}
