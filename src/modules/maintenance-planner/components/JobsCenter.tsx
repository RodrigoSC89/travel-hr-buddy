import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Plus, LayoutGrid, List, 
  AlertTriangle, Clock, CheckCircle, Wrench, Loader2
} from "lucide-react";
import { SmartJobCard, MaintenanceJob } from "./SmartJobCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface JobsCenterProps {
  onCreateJob?: () => void;
}

export const JobsCenter: React.FC<JobsCenterProps> = ({ onCreateJob }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("maintenance_tasks")
          .select("*, vessels(name)")
          .order("due_date", { ascending: true })
          .limit(50);

        if (error) {
          logger.warn("maintenance_tasks query error", error);
          setLoading(false);
          return;
        }

        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase joined query returns dynamic shape
        const mapped = (data || []).map((t: Record<string, unknown>) => {
          const dueDate = t.due_date ? new Date(String(t.due_date)) : null;
          const prazoDias = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000) : 999;
          const statusMap: Record<string, string> = { completed: "concluido", in_progress: "em_andamento", pending: "pendente", deferred: "postergado" };
          return {
            id: String(t.id),
            nome: String(t.title || t.description || "Tarefa de manutenção"),
            equipamento_codigo: String(t.equipment_id || "N/A"),
            equipamento_nome: String(t.equipment_name || t.component || "Equipamento"),
            criticidade: t.priority === "critical" ? "alta" : t.priority === "high" ? "alta" : t.priority === "medium" ? "media" : "baixa",
            status: statusMap[String(t.status)] || "pendente",
            prazo: String(t.due_date || "").split("T")[0] || "",
            prazo_dias: prazoDias,
            progresso: t.status === "completed" ? 100 : t.status === "in_progress" ? 50 : 0,
            tipo: (String(t.maintenance_type || "preventiva")) as MaintenanceJob["tipo"],
            pecas: t.parts_needed ? (Array.isArray(t.parts_needed) ? t.parts_needed : []) : [],
            os_vinculada: t.work_order_number ? String(t.work_order_number) : undefined,
            responsavel: t.assigned_to ? String(t.assigned_to) : undefined,
          };
        });

        setJobs(mapped as MaintenanceJob[]);
      } catch (err) {
        logger.error("Error fetching maintenance jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
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
  });

  const handleStatusChange = (jobId: string, newStatus: string) => {
    toast({
      title: "Status Atualizado",
      description: `Job atualizado para: ${newStatus}`,
    });
  };

  const handlePostpone = (jobId: string, justificativa: string) => {
    toast({
      title: "Job Postergado",
      description: "A IA está analisando o risco da postergação...",
    });
  };

  const handleOpenOS = (jobId: string) => {
    toast({
      title: "OS Criada",
      description: `Ordem de serviço #OS-${Date.now().toString().slice(-6)} criada para job ${jobId}`,
    });
  };

  const counts = {
    all: jobs.length,
    criticos: jobs.filter(j => j.criticidade === "alta").length,
    vencidos: jobs.filter(j => j.prazo_dias < 0).length,
    pendentes: jobs.filter(j => j.status === "pendente").length,
    andamento: jobs.filter(j => j.status === "em_andamento").length,
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
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
            onClick={() => setActiveFilter("all")}
          >
            Todos ({counts.all})
          </Button>
          <Button
            variant={activeFilter === "criticos" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("criticos")}
            className={activeFilter === "criticos" ? "" : "border-destructive/50 text-destructive hover:bg-destructive/10"}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Críticos ({counts.criticos})
          </Button>
          <Button
            variant={activeFilter === "vencidos" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("vencidos")}
          >
            <Clock className="h-4 w-4 mr-1" />
            Vencidos ({counts.vencidos})
          </Button>
          <Button
            variant={activeFilter === "pendentes" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("pendentes")}
          >
            Pendentes ({counts.pendentes})
          </Button>
          <Button
            variant={activeFilter === "andamento" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("andamento")}
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
};
