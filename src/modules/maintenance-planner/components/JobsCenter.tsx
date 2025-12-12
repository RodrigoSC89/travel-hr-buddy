import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Plus, LayoutGrid, List, 
  AlertTriangle, Clock, CheckCircle, Wrench 
} from "lucide-react";
import { SmartJobCard, MaintenanceJob } from "./SmartJobCard";
import { useToast } from "@/hooks/use-toast";

const mockJobs: MaintenanceJob[] = [
  {
    id: "1",
    nome: "Troca de filtro hidráulico",
    equipamento_codigo: "603.0004.02",
    equipamento_nome: "Bomba Hidráulica Popa",
    criticidade: "alta",
    status: "em_andamento",
    prazo: "2025-01-05",
    prazo_dias: 3,
    progresso: 66,
    tipo: "preventiva",
    pecas: ["Filtro modelo X123"],
    os_vinculada: "24819",
    anexos: 2,
    sugestao_ia: "Pode ser postergado 5 dias sem impacto operacional.",
    responsavel: "João Silva",
  },
  {
    id: "2",
    nome: "Inspeção sistema de combate a incêndio",
    equipamento_codigo: "605.0001.03",
    equipamento_nome: "Sistema Sprinkler",
    criticidade: "media",
    status: "pendente",
    prazo: "2025-01-10",
    prazo_dias: 8,
    progresso: 0,
    tipo: "preventiva",
    pecas: [],
    responsavel: "Maria Santos",
  },
  {
    id: "3",
    nome: "Vazamento no selo da bomba BB",
    equipamento_codigo: "603.0002.01",
    equipamento_nome: "Bomba de Lastro BB",
    criticidade: "alta",
    status: "pendente",
    prazo: "2025-01-02",
    prazo_dias: -1,
    progresso: 0,
    tipo: "corretiva",
    pecas: ["Selo mecânico P/N 4521", "Junta de vedação"],
    sugestao_ia: "⚠️ Job vencido. Prioridade máxima recomendada.",
  },
  {
    id: "4",
    nome: "Calibração de sensores de temperatura",
    equipamento_codigo: "604.0002.01",
    equipamento_nome: "Gerador Diesel 1",
    criticidade: "baixa",
    status: "concluido",
    prazo: "2024-12-28",
    prazo_dias: 0,
    progresso: 100,
    tipo: "preditiva",
    pecas: [],
    os_vinculada: "24750",
    responsavel: "Pedro Costa",
  },
  {
    id: "5",
    nome: "Troca de óleo do redutor",
    equipamento_codigo: "601.0001.02",
    equipamento_nome: "Motor Principal STBD",
    criticidade: "media",
    status: "postergado",
    prazo: "2025-01-15",
    prazo_dias: 13,
    progresso: 0,
    tipo: "preventiva",
    pecas: ["Óleo SAE 90 - 20L"],
    sugestao_ia: "Postergado por 7 dias. Novo prazo: 15/01/2025",
  },
];

interface JobsCenterProps {
  onCreateJob?: () => void;
}

export const JobsCenter: React.FC<JobsCenterProps> = ({ onCreateJob }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = 
      job.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.equipamento_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.equipamento_codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === "all" ||
      (activeFilter === "criticos" && job.criticidade === "alta") ||
      (activeFilter === "vencidos" && job.prazo_dias < 0) ||
      (activeFilter === "pendentes" && job.status === "pendente") ||
      (activeFilter === "andamento" && job.status === "em_andamento");

    return matchesSearch && matchesFilter;
};

  const handleStatusChange = (jobId: string, newStatus: string) => {
    toast({
      title: "Status Atualizado",
      description: `Job atualizado para: ${newStatus}`,
    });
  });

  const handlePostpone = (jobId: string, justificativa: string) => {
    toast({
      title: "Job Postergado",
      description: "A IA está analisando o risco da postergação...",
    });
  });

  const handleOpenOS = (jobId: string) => {
    toast({
      title: "Abrindo OS",
      description: "Ordem de serviço será criada para este job.",
    });
  });

  const counts = {
    all: mockJobs.length,
    criticos: mockJobs.filter(j => j.criticidade === "alta").length,
    vencidos: mockJobs.filter(j => j.prazo_dias < 0).length,
    pendentes: mockJobs.filter(j => j.status === "pendente").length,
    andamento: mockJobs.filter(j => j.status === "em_andamento").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Central de Jobs
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar job ou equipamento..."
                className="pl-8"
                value={searchTerm}
                onChange={handleChange}
              />
            </div>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={handleSetViewMode}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={handleSetViewMode}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={onCreateJob}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Job
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={handleSetActiveFilter}
          >
            Todos ({counts.all})
          </Button>
          <Button
            variant={activeFilter === "criticos" ? "default" : "outline"}
            size="sm"
            onClick={handleSetActiveFilter}
            className={activeFilter === "criticos" ? "" : "border-red-500/50 text-red-500 hover:bg-red-500/10"}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Críticos ({counts.criticos})
          </Button>
          <Button
            variant={activeFilter === "vencidos" ? "destructive" : "outline"}
            size="sm"
            onClick={handleSetActiveFilter}
          >
            <Clock className="h-4 w-4 mr-1" />
            Vencidos ({counts.vencidos})
          </Button>
          <Button
            variant={activeFilter === "pendentes" ? "default" : "outline"}
            size="sm"
            onClick={handleSetActiveFilter}
          >
            Pendentes ({counts.pendentes})
          </Button>
          <Button
            variant={activeFilter === "andamento" ? "default" : "outline"}
            size="sm"
            onClick={handleSetActiveFilter}
          >
            Em Andamento ({counts.andamento})
          </Button>
        </div>

        {/* Jobs Grid/List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum job encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
            {filteredJobs.map((job) => (
              <SmartJobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onPostpone={handlePostpone}
                onOpenOS={handleOpenOS}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
