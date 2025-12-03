import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plane, LayoutDashboard, Calendar, Hotel, Car, Brain, FileText } from "lucide-react";
import MobilityDashboard from "./components/MobilityDashboard";

export default function SmartMobility() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <Plane className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Smart Mobility
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestão inteligente de viagens, hospedagens e logística de tripulação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span className="hidden sm:inline">Voos</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              <span className="hidden sm:inline">Hotéis</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Transfers</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Planejamento</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <MobilityDashboard />
          </TabsContent>

          <TabsContent value="flights">
            <div className="text-center py-12 text-muted-foreground">
              Gestão de voos e integrações com companhias aéreas - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="hotels">
            <div className="text-center py-12 text-muted-foreground">
              Reservas de hotéis e acomodações - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            <div className="text-center py-12 text-muted-foreground">
              Gestão de transfers e transportes terrestres - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <div className="text-center py-12 text-muted-foreground">
              Planejamento automático de mobilização/desmobilização - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              Relatórios de custos e ESG - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
