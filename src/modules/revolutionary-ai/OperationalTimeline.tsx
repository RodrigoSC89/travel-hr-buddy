/**
import { useState, useMemo, useCallback } from "react";;
 * Operational Timeline
 * Histórico vivo de eventos por embarcação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, Ship, Wrench, Users, AlertTriangle,
  FileCheck, Package, Fuel, Search, Filter,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimelineEvent {
  id: string;
  type: "maintenance" | "crew" | "incident" | "certificate" | "supply" | "fuel";
  title: string;
  description: string;
  timestamp: Date;
  vessel: string;
  severity?: "info" | "warning" | "critical";
  details?: Record<string, string | number>;
  user?: string;
}

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "maintenance",
    title: "Manutenção Preventiva Concluída",
    description: "Troca de óleo do motor principal realizada com sucesso",
    timestamp: new Date(Date.now() - 1800000),
    vessel: "Navio Sirius",
    severity: "info",
    details: { "Técnico": "João Silva", "Horas": 4, "Custo": 2500 },
    user: "Carlos Mendes"
  },
  {
    id: "2",
    type: "crew",
    title: "Embarque de Tripulação",
    description: "3 tripulantes embarcaram para turno de 28 dias",
    timestamp: new Date(Date.now() - 7200000),
    vessel: "Navio Vega",
    severity: "info",
    user: "RH Sistema"
  },
  {
    id: "3",
    type: "incident",
    title: "Alerta de Temperatura",
    description: "Temperatura do motor acima do normal detectada",
    timestamp: new Date(Date.now() - 10800000),
    vessel: "Navio Sirius",
    severity: "warning",
    details: { "Temperatura": "95°C", "Limite": "85°C" }
  },
  {
    id: "4",
    type: "certificate",
    title: "Certificado ANTAQ Renovado",
    description: "Certificado de navegação renovado até 2026",
    timestamp: new Date(Date.now() - 86400000),
    vessel: "Navio Polaris",
    severity: "info",
    user: "Admin"
  },
  {
    id: "5",
    type: "supply",
    title: "Abastecimento de Suprimentos",
    description: "45 itens recebidos a bordo",
    timestamp: new Date(Date.now() - 172800000),
    vessel: "Navio Vega",
    details: { "Itens": 45, "Valor Total": "R$ 12.500" }
  },
  {
    id: "6",
    type: "fuel",
    title: "Abastecimento de Combustível",
    description: "5.000 litros de diesel abastecidos",
    timestamp: new Date(Date.now() - 259200000),
    vessel: "Navio Sirius",
    details: { "Litros": 5000, "Preço/L": "R$ 4.85" }
  },
  {
    id: "7",
    type: "incident",
    title: "Falha no Sistema de Navegação",
    description: "GPS apresentou falha temporária - resolvido",
    timestamp: new Date(Date.now() - 345600000),
    vessel: "Navio Polaris",
    severity: "critical",
    details: { "Duração": "45 min", "Impacto": "Baixo" }
  }
];

export const OperationalTimeline = memo(function() {
  const [events] = useState<TimelineEvent[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const vessels = [...new Set(events.map(e => e.vessel))];
  const eventTypes = ["maintenance", "crew", "incident", "certificate", "supply", "fuel"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVessel = !selectedVessel || event.vessel === selectedVessel;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.type);
    return matchesSearch && matchesVessel && matchesType;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
    case "maintenance": return <Wrench className="h-4 w-4" />;
    case "crew": return <Users className="h-4 w-4" />;
    case "incident": return <AlertTriangle className="h-4 w-4" />;
    case "certificate": return <FileCheck className="h-4 w-4" />;
    case "supply": return <Package className="h-4 w-4" />;
    case "fuel": return <Fuel className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (severity === "critical") return "border-destructive bg-destructive/10";
    if (severity === "warning") return "border-warning bg-warning/10";
    
    switch (type) {
    case "maintenance": return "border-blue-500 bg-blue-500/10";
    case "crew": return "border-green-500 bg-green-500/10";
    case "certificate": return "border-purple-500 bg-purple-500/10";
    case "supply": return "border-orange-500 bg-orange-500/10";
    case "fuel": return "border-yellow-500 bg-yellow-500/10";
    default: return "border-muted bg-muted/10";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Há ${days} dia${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    return "Agora";
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {vessels.map(vessel => (
                <Button
                  key={vessel}
                  variant={selectedVessel === vessel ? "default" : "outline"}
                  size="sm"
                  onClick={handleSetSelectedVessel}
                >
                  <Ship className="h-3 w-3 mr-1" />
                  {vessel}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground mt-1" />
            {eventTypes.map(type => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handletoggleType}
              >
                {getEventIcon(type)}
                <span className="ml-1 capitalize">{type}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline Operacional
            <Badge variant="secondary">{filteredEvents.length} eventos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 ${getEventColor(event.type, event.severity)} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>

                      <div 
                        className={`p-4 rounded-lg border ${getEventColor(event.type, event.severity)} cursor-pointer transition-all hover:shadow-md`}
                        onClick={handleSetExpandedEvent}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-background">
                              {getEventIcon(event.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Ship className="h-3 w-3" />
                                <span>{event.vessel}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(event.timestamp)}</span>
                                {event.user && (
                                  <>
                                    <span>•</span>
                                    <span>por {event.user}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            {expandedEvent === event.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {expandedEvent === event.id && event.details && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(event.details).map(([key, value]) => (
                                  <div key={key}>
                                    <p className="text-xs text-muted-foreground">{key}</p>
                                    <p className="font-medium">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
