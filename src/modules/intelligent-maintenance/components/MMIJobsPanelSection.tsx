/**
 * MMI Jobs Panel Section - Painel de forecasts de jobs
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Download, Calendar, Clock, User, 
  Wrench, FileText, Eye, MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MMIJobForecast {
  id: string;
  title: string;
  forecast: string | null;
  hours: number | null;
  responsible: string | null;
  forecast_date: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "pendente" | "em_andamento" | "concluido";
}

// Mock data
const mockJobs: MMIJobForecast[] = [
  {
    id: "1",
    title: "Manutenção do Sistema Hidráulico - Guindaste Principal",
    forecast: "Troca de óleo e filtros prevista para 15/01",
    hours: 870,
    responsible: "Carlos Silva",
    forecast_date: "2025-01-15",
    priority: "high",
    status: "pendente"
  },
  {
    id: "2",
    title: "Inspeção do Motor de Propulsão",
    forecast: "Verificação de parâmetros e calibração",
    hours: 1250,
    responsible: "João Santos",
    forecast_date: "2025-01-20",
    priority: "medium",
    status: "em_andamento"
  },
  {
    id: "3",
    title: "Substituição de Vedações - Bomba Principal",
    forecast: "Vida útil estimada: 200h restantes",
    hours: 2100,
    responsible: "Maria Oliveira",
    forecast_date: "2025-01-25",
    priority: "critical",
    status: "pendente"
  },
  {
    id: "4",
    title: "Calibração de Sensores de Pressão",
    forecast: "Manutenção preventiva programada",
    hours: 500,
    responsible: "Pedro Costa",
    forecast_date: "2025-02-01",
    priority: "low",
    status: "concluido"
  }
];

export default function MMIJobsPanelSection() {
  const [jobs, setJobs] = useState<MMIJobForecast[]>(mockJobs);
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.responsible?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (job: MMIJobForecast) => {
    toast.success(`Exportando PDF de: ${job.title}`);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Crítico</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Alto</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Médio</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Baixo</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluido":
        return <Badge className="bg-green-500 text-white">Concluído</Badge>;
      case "em_andamento":
        return <Badge className="bg-blue-500 text-white">Em Andamento</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Painel de Forecast MMI
          </h2>
          <p className="text-muted-foreground">Visualize e gerencie os forecasts de jobs de manutenção</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por sistema, componente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  {job.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast.info("Abrindo detalhes...")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(job)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 mt-2">
                {getPriorityBadge(job.priority)}
                {getStatusBadge(job.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Previsão: <strong>{job.forecast || "N/A"}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                Horímetro: <strong>{job.hours || 0}h</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                <User className="h-4 w-4 inline mr-1" />
                Responsável: <strong>{job.responsible || "N/A"}</strong>
              </p>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport(job)}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum job encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
