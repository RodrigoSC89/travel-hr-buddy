/**
 * Medical Infirmary Enhanced - Orchestrator
 * Refactored: tabs extracted to src/pages/medical/
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Heart, Users, Brain, Plus, Phone, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { MedicalTabs } from "./medical/MedicalTabs";

const healthStats = [
  { id: "crew", label: "Tripulantes Ativos", value: 247, icon: Users, percentage: undefined },
  { id: "fit", label: "Aptos para Serviço", value: 239, icon: CheckCircle, percentage: 96.8 },
  { id: "consultations", label: "Atendimentos (Mês)", value: 34, icon: Stethoscope, percentage: undefined },
  { id: "pending", label: "Exames Pendentes", value: 8, icon: Clock, percentage: undefined },
];

export default function MedicalInfirmaryEnhanced() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-destructive/10 via-destructive/5 to-accent/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-lg"><Stethoscope className="h-7 w-7" /></div>
              <div>
                <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Enfermaria Digital</h1><Badge className="bg-success/10 text-success gap-1"><Brain className="h-3 w-3" />IA Integrada</Badge></div>
                <p className="text-sm text-muted-foreground">Gestão de saúde conforme MLC 2006 e NORMAM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Phone className="h-4 w-4 mr-2" />Telemedicina</Button>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Novo Atendimento</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthStats.map((stat) => (
            <Card key={stat.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.percentage && <div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-success" /><span className="text-xs text-success">{stat.percentage}%</span></div>}
                  </div>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <MedicalTabs searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
    </div>
  );
}
