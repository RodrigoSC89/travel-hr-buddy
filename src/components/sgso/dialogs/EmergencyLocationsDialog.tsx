/**
 * Emergency Locations Dialog
 * Map view of emergency meeting points and equipment
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  LifeBuoy, 
  Flame, 
  Heart,
  Navigation,
  Anchor,
  AlertTriangle,
  Users,
  CheckCircle
} from "lucide-react";

interface EmergencyLocationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEETING_POINTS = [
  {
    id: "1",
    name: "Ponto de Encontro Principal",
    location: "Convés Principal - Bombordo",
    type: "primary",
    capacity: 50,
    equipment: ["Baleeiras", "Coletes salva-vidas", "EPIRB"],
    coordinates: "Deck 3, Frame 45-50",
  },
  {
    id: "2",
    name: "Ponto de Encontro Secundário",
    location: "Convés Principal - Boreste",
    type: "secondary",
    capacity: 40,
    equipment: ["Balsas salva-vidas", "Coletes", "Pirotécnicos"],
    coordinates: "Deck 3, Frame 45-50",
  },
  {
    id: "3",
    name: "Estação de Comando",
    location: "Passadiço",
    type: "command",
    capacity: 10,
    equipment: ["Comunicações", "GMDSS", "Radar"],
    coordinates: "Deck 5, Frame 20",
  },
];

const EMERGENCY_EQUIPMENT = [
  {
    id: "1",
    name: "Estação de Combate a Incêndio #1",
    location: "Convés Principal - Proa",
    type: "fire",
    items: ["Hidrantes", "Mangueiras", "Extintores CO2", "Roupas de aproximação"],
    status: "ok",
    lastInspection: "2024-09-15",
  },
  {
    id: "2",
    name: "Estação de Combate a Incêndio #2",
    location: "Praça de Máquinas",
    type: "fire",
    items: ["Sistema fixo CO2", "Extintores", "SCBA"],
    status: "ok",
    lastInspection: "2024-09-15",
  },
  {
    id: "3",
    name: "Estação Médica Principal",
    location: "Hospital de Bordo - Deck 2",
    type: "medical",
    items: ["Desfibrilador", "Maca", "Kit primeiros socorros", "Oxigênio"],
    status: "ok",
    lastInspection: "2024-09-20",
  },
  {
    id: "4",
    name: "Estação MOB (Homem ao Mar)",
    location: "Popa - Boreste",
    type: "rescue",
    items: ["Boia salva-vidas", "Luz MOB", "Guincho de resgate", "Rede de resgate"],
    status: "ok",
    lastInspection: "2024-09-25",
  },
  {
    id: "5",
    name: "Kit Derramamento Óleo",
    location: "Convés Principal - Meio-navio",
    type: "spill",
    items: ["Barreiras absorventes", "Mantas oleofílicas", "EPI", "Bomba de sucção"],
    status: "warning",
    lastInspection: "2024-08-10",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "fire": return Flame;
    case "medical": return Heart;
    case "rescue": return LifeBuoy;
    case "spill": return AlertTriangle;
    case "primary": return Anchor;
    case "secondary": return Navigation;
    case "command": return Users;
    default: return MapPin;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "fire": return "text-red-500 bg-red-100";
    case "medical": return "text-purple-500 bg-purple-100";
    case "rescue": return "text-blue-500 bg-blue-100";
    case "spill": return "text-green-500 bg-green-100";
    case "primary": return "text-orange-500 bg-orange-100";
    case "secondary": return "text-yellow-500 bg-yellow-100";
    case "command": return "text-indigo-500 bg-indigo-100";
    default: return "text-gray-500 bg-gray-100";
  }
};

export const EmergencyLocationsDialog: React.FC<EmergencyLocationsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("points");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Mapa de Localizações de Emergência
          </DialogTitle>
          <DialogDescription>
            Pontos de encontro, estações de emergência e equipamentos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points">
              <Anchor className="h-4 w-4 mr-2" />
              Pontos de Encontro
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <LifeBuoy className="h-4 w-4 mr-2" />
              Equipamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Visual Ship Diagram Placeholder */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-lg">Diagrama da Embarcação</h4>
                      <p className="text-sm text-muted-foreground">Vista superior com pontos de encontro</p>
                    </div>
                    <div className="relative bg-blue-100 rounded-lg p-8 min-h-[150px]">
                      {/* Simplified ship shape */}
                      <div className="absolute inset-x-8 inset-y-4 bg-gray-300 rounded-t-[50%] rounded-b-lg border-2 border-gray-400">
                        {/* Meeting points markers */}
                        <div className="absolute top-1/3 left-4 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          1
                        </div>
                        <div className="absolute top-1/3 right-4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          2
                        </div>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          C
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-500 rounded-full" />
                        <span>Principal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                        <span>Secundário</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full" />
                        <span>Comando</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meeting Points List */}
                {MEETING_POINTS.map((point) => {
                  const Icon = getTypeIcon(point.type);
                  const colorClass = getTypeColor(point.type);
                  
                  return (
                    <Card key={point.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${colorClass}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{point.name}</h4>
                              <Badge variant="outline">{point.capacity} pessoas</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {point.location}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Coordenadas: {point.coordinates}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {point.equipment.map((eq, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {eq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="equipment" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {EMERGENCY_EQUIPMENT.map((eq) => {
                  const Icon = getTypeIcon(eq.type);
                  const colorClass = getTypeColor(eq.type);
                  
                  return (
                    <Card key={eq.id} className={eq.status === "warning" ? "border-yellow-400" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${colorClass}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{eq.name}</h4>
                                {eq.status === "ok" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Inspecionado: {new Date(eq.lastInspection).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {eq.location}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {eq.items.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
