import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportJobToPDF } from "@/lib/utils/pdf-exporter";
import { toast } from "sonner";
import { FileDown, Search, Wrench, Clock, User, Calendar } from "lucide-react";

interface MMIJobForecast {
  id: string;
  title: string;
  forecast: string | null;
  hours: number | null;
  responsible: string | null;
  forecast_date: string | null;
  description?: string;
  status?: string;
  priority?: string;
}

export default function MMIJobsPanel() {
  const [jobs, setJobs] = useState<MMIJobForecast[]>([]);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mmi_jobs not in generated types
      const { data, error } = await (supabase.from as Function)("mmi_jobs")
        .select("*")
        .order("forecast_date", { ascending: false });
      
      if (error) throw error;
      if (data) setJobs(data as unknown as MMIJobForecast[]);
    } catch (error) {
      logger.error("Error fetching MMI jobs", error);
      toast.error("Erro ao carregar jobs");
    }
  }

  async function handleExport(job: MMIJobForecast) {
    try {
      setExporting(job.id);
      logger.info("Exporting job to PDF", { jobId: job.id, title: job.title });
      
      await exportJobToPDF({
        id: job.id,
        title: job.title,
        description: job.description || job.forecast || undefined,
        status: job.status || "pending",
        priority: job.priority,
        assignee: job.responsible || undefined,
        dueDate: job.forecast_date ? new Date(job.forecast_date) : undefined,
        metrics: {
          "Horímetro": `${job.hours || 0}h`,
        },
      });

      toast.success("PDF exportado com sucesso!");
      logger.info("PDF exported successfully", { jobId: job.id });
    } catch (error) {
      logger.error("Error exporting job", error, { jobId: job.id });
      toast.error("Erro ao exportar PDF");
    } finally {
      setExporting(null);
    }
  }

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          Painel de Forecast MMI
        </h1>
        <span className="text-sm text-muted-foreground">
          {filteredJobs.length} jobs encontrados
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por sistema, componente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                {job.title}
              </h2>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Previsão: <strong className="text-foreground">{job.forecast || "N/A"}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horímetro: <strong className="text-foreground">{job.hours || 0}h</strong>
                </p>
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsável: <strong className="text-foreground">{job.responsible || "N/A"}</strong>
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleExport(job)}
                disabled={exporting === job.id}
              >
                <FileDown className="w-4 h-4 mr-2" />
                {exporting === job.id ? "Exportando..." : "Exportar PDF"}
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum job encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
