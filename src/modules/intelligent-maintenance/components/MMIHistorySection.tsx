/**
 * MMI History Section - Histórico de manutenções
 */

import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Calendar, Wrench, Ship, 
  FileText, Download, Eye, CheckCircle, Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaintenanceRecord {
  id: string;
  title: string;
  vesselName: string;
  systemName: string;
  completedAt: Date;
  type: "preventiva" | "corretiva" | "preditiva";
  status: "concluido" | "parcial";
  technician: string;
  hours: number;
  cost: number;
}

// Mock data
const mockHistory: MaintenanceRecord[] = [
  {
    id: "1",
    title: "Troca de óleo do sistema hidráulico",
    vesselName: "FPSO Alpha",
    systemName: "Sistema Hidráulico",
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: "preventiva",
    status: "concluido",
    technician: "Carlos Silva",
    hours: 4,
    cost: 2500
  },
  {
    id: "2",
    title: "Reparo no motor principal",
    vesselName: "PSV Beta",
    systemName: "Motor Principal",
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: "corretiva",
    status: "concluido",
    technician: "João Santos",
    hours: 8,
    cost: 8500
  },
  {
    id: "3",
    title: "Inspeção do sistema de propulsão",
    vesselName: "AHTS Gamma",
    systemName: "Propulsão",
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    type: "preditiva",
    status: "concluido",
    technician: "Maria Oliveira",
    hours: 6,
    cost: 1800
  },
  {
    id: "4",
    title: "Calibração de sensores",
    vesselName: "FPSO Alpha",
    systemName: "Instrumentação",
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    type: "preventiva",
    status: "parcial",
    technician: "Pedro Costa",
    hours: 3,
    cost: 950
  },
  {
    id: "5",
    title: "Substituição de filtros",
    vesselName: "PSV Delta",
    systemName: "Sistema de Combustível",
    completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    type: "preventiva",
    status: "concluido",
    technician: "Ana Rodrigues",
    hours: 2,
    cost: 650
  }
];

export default function MMIHistorySection() {
  const [history, setHistory] = useState<MaintenanceRecord[]>(mockHistory);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredHistory = history.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.vesselName.toLowerCase().includes(search.toLowerCase()) ||
      record.systemName.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filterType || record.type === filterType;
    
    return matchesSearch && matchesType;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
    case "preventiva":
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Preventiva</Badge>;
    case "corretiva":
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Corretiva</Badge>;
    case "preditiva":
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Preditiva</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const totalCost = filteredHistory.reduce((acc, record) => acc + record.cost, 0);
  const totalHours = filteredHistory.reduce((acc, record) => acc + record.hours, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Registros</p>
                <p className="text-2xl font-bold">{filteredHistory.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Horas Trabalhadas</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Custo Total</p>
                <p className="text-2xl font-bold">R$ {totalCost.toLocaleString("pt-BR")}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredHistory.filter(r => r.status === "concluido").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, embarcação ou sistema..."
                value={search}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterType === null ? "default" : "outline"} 
                size="sm"
                onClick={handleSetFilterType}
              >
                Todos
              </Button>
              <Button 
                variant={filterType === "preventiva" ? "default" : "outline"} 
                size="sm"
                onClick={handleSetFilterType}
              >
                Preventiva
              </Button>
              <Button 
                variant={filterType === "corretiva" ? "default" : "outline"} 
                size="sm"
                onClick={handleSetFilterType}
              >
                Corretiva
              </Button>
              <Button 
                variant={filterType === "preditiva" ? "default" : "outline"} 
                size="sm"
                onClick={handleSetFilterType}
              >
                Preditiva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{record.title}</h3>
                      {getTypeBadge(record.type)}
                      {record.status === "concluido" ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Parcial</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Ship className="h-4 w-4" />
                        {record.vesselName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wrench className="h-4 w-4" />
                        {record.systemName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(record.completedAt, "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {record.hours}h
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span>Técnico: <strong>{record.technician}</strong></span>
                      <span>Custo: <strong>R$ {record.cost.toLocaleString("pt-BR")}</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
