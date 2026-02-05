/**
 * Drydock Planning Pro - Tier-1 Component
 * Based on DNV ShipManager and Lloyd's requirements
 * Comprehensive drydock planning with ESP, class surveys, and CAPEX tracking
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, Ship, Calendar, DollarSign, CheckCircle, Clock,
  AlertTriangle, FileText, Camera, ClipboardCheck, Target,
  BarChart3, Anchor, Settings
} from "lucide-react";

// Sample drydock data
const drydockProjects = [
  {
    id: "DD-2026-001",
    vessel: "MV Nautilus Star",
    shipyard: "Sembcorp Marine, Singapore",
    plannedStart: "2026-04-15",
    plannedEnd: "2026-05-15",
    status: "scheduled",
    budget: 2850000,
    spent: 0,
    progress: 0,
    type: "Special Survey + BWTS Installation",
    classSurveys: ["SS", "DD", "BWTS", "Ballast Water"],
    espAreas: [
      { area: "Hull Plates", status: "pending", thickness: "12.5mm", minRequired: "11.0mm" },
      { area: "Deck Plating", status: "pending", thickness: "10.2mm", minRequired: "9.5mm" },
      { area: "Tank Top", status: "pending", thickness: "14.0mm", minRequired: "13.0mm" },
    ],
  },
  {
    id: "DD-2025-004",
    vessel: "MV Ocean Explorer",
    shipyard: "Jurong Shipyard, Singapore",
    plannedStart: "2025-11-01",
    plannedEnd: "2025-12-05",
    actualEnd: "2025-12-10",
    status: "completed",
    budget: 1950000,
    spent: 2120000,
    progress: 100,
    type: "Intermediate Survey",
    classSurveys: ["IS", "Annual Survey"],
    espAreas: [
      { area: "Hull Plates", status: "completed", thickness: "13.2mm", minRequired: "11.0mm" },
      { area: "Deck Plating", status: "completed", thickness: "11.0mm", minRequired: "9.5mm" },
    ],
  },
];

const upcomingSurveys = [
  { vessel: "MV Nautilus Star", survey: "Special Survey (5th)", due: "2026-06-15", status: "on_track" },
  { vessel: "MV Pacific Trader", survey: "Intermediate Survey", due: "2026-08-01", status: "on_track" },
  { vessel: "MV Atlantic Carrier", survey: "Annual Survey", due: "2026-03-20", status: "attention" },
  { vessel: "MV Ocean Explorer", survey: "Bottom Survey", due: "2026-09-10", status: "on_track" },
];

const workItems = [
  { id: 1, category: "Hull", description: "Hull cleaning and coating", status: "pending", cost: 180000, days: 5 },
  { id: 2, category: "Propeller", description: "Propeller polishing and inspection", status: "pending", cost: 45000, days: 2 },
  { id: 3, category: "BWTS", description: "Ballast Water Treatment System installation", status: "pending", cost: 850000, days: 12 },
  { id: 4, category: "Engine", description: "Main engine overhaul", status: "pending", cost: 420000, days: 8 },
  { id: 5, category: "Deck", description: "Deck machinery maintenance", status: "pending", cost: 95000, days: 4 },
  { id: 6, category: "Safety", description: "Lifeboat davit inspection", status: "pending", cost: 35000, days: 2 },
  { id: 7, category: "Class", description: "Class survey preparation", status: "pending", cost: 75000, days: 3 },
  { id: 8, category: "Coating", description: "Tank coating renewal", status: "pending", cost: 280000, days: 6 },
];

export default function DrydockPlanningPro() {
  const [selectedProject, setSelectedProject] = useState(drydockProjects[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalBudget = workItems.reduce((sum, item) => sum + item.cost, 0);
  const totalDays = workItems.reduce((sum, item) => sum + item.days, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Drydock Planning Pro
          </h2>
          <p className="text-muted-foreground">
            DNV/Lloyd's Class Survey Planning - ESP Compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <Ship className="h-3 w-3 mr-1" />
            {selectedProject.vessel}
          </Badge>
          <Badge className="bg-amber-500">
            {selectedProject.id}
          </Badge>
        </div>
      </div>

      {/* Project Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drydockProjects.map((project) => (
          <Card 
            key={project.id}
            className={`cursor-pointer transition-all ${
              selectedProject.id === project.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedProject(project)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  <span className="font-medium">{project.vessel}</span>
                </div>
                <Badge variant={
                  project.status === 'completed' ? 'default' :
                  project.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {project.status === 'completed' ? 'Concluído' :
                   project.status === 'in_progress' ? 'Em Andamento' : 'Agendado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{project.type}</p>
              <div className="flex items-center justify-between text-xs">
                <span>{project.shipyard}</span>
                <span>{project.plannedStart} - {project.plannedEnd}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="worklist">Work List</TabsTrigger>
          <TabsTrigger value="esp">ESP Survey</TabsTrigger>
          <TabsTrigger value="class">Class Surveys</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Duração Planejada</p>
                <p className="text-2xl font-bold">30 dias</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Work Items</p>
                <p className="text-2xl font-bold">{workItems.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Budget Total</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.budget)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-cyan-500">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Class Surveys</p>
                <p className="text-2xl font-bold">{selectedProject.classSurveys.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">ESP Areas</p>
                <p className="text-2xl font-bold">{selectedProject.espAreas.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Surveys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximas Vistorias de Classe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSurveys.map((survey, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Ship className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{survey.vessel}</p>
                        <p className="text-xs text-muted-foreground">{survey.survey}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{survey.due}</p>
                      </div>
                      <Badge variant={survey.status === 'on_track' ? 'default' : 'secondary'}>
                        {survey.status === 'on_track' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" />On Track</>
                        ) : (
                          <><AlertTriangle className="h-3 w-3 mr-1" />Atenção</>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Lista de Trabalhos - {selectedProject.vessel}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Total: {formatCurrency(totalBudget)}</Badge>
                  <Badge variant="outline">{totalDays} dias</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground">{item.days} dias</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.cost)}</p>
                      </div>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                        {item.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esp" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Enhanced Survey Programme (ESP) - Medição de Espessura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProject.espAreas.map((area, i) => {
                  const thicknessValue = parseFloat(area.thickness);
                  const minValue = parseFloat(area.minRequired);
                  const margin = ((thicknessValue - minValue) / minValue * 100).toFixed(1);
                  const isOk = thicknessValue >= minValue * 1.1;
                  const isWarning = thicknessValue >= minValue && thicknessValue < minValue * 1.1;
                  
                  return (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{area.area}</p>
                          <p className="text-xs text-muted-foreground">Thickness Measurement</p>
                        </div>
                        <Badge variant={
                          area.status === 'completed' ? 'default' :
                          isOk ? 'outline' : isWarning ? 'secondary' : 'destructive'
                        }>
                          {area.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Espessura Atual</p>
                          <p className="text-lg font-bold">{area.thickness}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Mínimo Requerido</p>
                          <p className="text-lg font-bold">{area.minRequired}</p>
                        </div>
                        <div className={`p-3 rounded ${isOk ? 'bg-success/10' : isWarning ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                          <p className="text-xs text-muted-foreground">Margem</p>
                          <p className={`text-lg font-bold ${isOk ? 'text-success' : isWarning ? 'text-warning' : 'text-destructive'}`}>
                            +{margin}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Vistorias de Classe Incluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedProject.classSurveys.map((survey, i) => (
                  <Card key={i} className="text-center">
                    <CardContent className="p-4">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium">{survey}</p>
                      <Badge variant="outline" className="mt-2">Incluído</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Budget Total</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.budget)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Gasto Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.spent)}</p>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${selectedProject.spent <= selectedProject.budget ? 'border-l-success' : 'border-l-destructive'}`}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Variância</p>
                <p className={`text-2xl font-bold ${selectedProject.spent <= selectedProject.budget ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(selectedProject.budget - selectedProject.spent)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
