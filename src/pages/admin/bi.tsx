import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  DashboardJobs, 
  JobsTrendChart, 
  JobsForecastReport,
  AuditComplianceChart,
  BiFilters,
  NonConformityAnalysis,
  ConsolidatedExport,
  type FilterValues
} from "@/components/bi";
import { supabase } from "@/integrations/supabase/client";

interface JobTrendData {
  month: string;
  total_jobs: number;
  monthLabel: string;
}

export default function AdminBI() {
  const [trendData, setTrendData] = useState<JobTrendData[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    startDate: "",
    endDate: "",
    vesselId: "",
    standard: "",
  });
  const [auditData, setAuditData] = useState<any[]>([]);
  const [vesselData, setVesselData] = useState<any[]>([]);
  const [nonConformityData, setNonConformityData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const { data, error } = await supabase.rpc("jobs_trend_by_month");
        
        if (error) {
          console.error("Error fetching jobs trend:", error);
          setTrendData([]);
        } else {
          setTrendData(data || []);
        }
      } catch (error) {
        console.error("Error invoking function:", error);
        setTrendData([]);
      }
    }
    
    fetchTrendData();
  }, []);

  useEffect(() => {
    async function fetchAuditData() {
      try {
        let query = supabase
          .from("peotram_audits")
          .select(`
            id,
            audit_date,
            vessel_id,
            vessels:vessel_id (
              id,
              name
            )
          `);

        if (filters.startDate && filters.endDate) {
          query = query
            .gte("audit_date", filters.startDate)
            .lte("audit_date", filters.endDate);
        }

        if (filters.vesselId) {
          query = query.eq("vessel_id", filters.vesselId);
        }

        const { data, error } = await query;

        if (!error && data) {
          setAuditData(data.map(audit => ({
            ...audit,
            vessel_name: audit.vessels?.name,
            is_compliant: Math.random() > 0.3, // Mock data
          })));
        }
      } catch (error) {
        console.error("Error fetching audit data:", error);
      }
    }

    fetchAuditData();
  }, [filters]);

  useEffect(() => {
    async function fetchVesselData() {
      try {
        const { data, error } = await supabase
          .from("vessels")
          .select("id, name");

        if (!error && data) {
          setVesselData(data);
        }
      } catch (error) {
        console.error("Error fetching vessel data:", error);
      }
    }

    fetchVesselData();
  }, []);

  // Mock non-conformity data
  useEffect(() => {
    setNonConformityData([
      {
        number: "NC-2024-001",
        vessel: "MV Explorer",
        date: "2024-10-15",
        severity: "high",
        status: "Aberta",
        description: "Ausência de matriz de competências atualizada",
      },
      {
        number: "NC-2024-002",
        vessel: "MV Explorer",
        date: "2024-10-10",
        severity: "critical",
        status: "Em Tratamento",
        description: "Procedimento MOC não implementado",
      },
    ]);
  }, []);

  // Transform data for JobsForecastReport component
  const forecastTrendData = trendData.map((item) => ({
    date: item.month,
    jobs: item.total_jobs,
  }));

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const exportData = {
    audits: auditData,
    vessels: vesselData,
    nonConformities: nonConformityData,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">📊 Business Intelligence Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Análise de dados de manutenção e auditorias com visualizações, previsões de IA e análise de não conformidades
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Interactive Filters */}
        <BiFilters onFilterChange={handleFilterChange} />

        {/* Audit Compliance Chart by Vessel */}
        <AuditComplianceChart 
          startDate={filters.startDate}
          endDate={filters.endDate}
          vesselId={filters.vesselId}
        />

        {/* AI Analysis for Non-Conformities */}
        <NonConformityAnalysis vesselId={filters.vesselId} />

        {/* Jobs by Component Analysis */}
        <DashboardJobs />

        {/* Job Trend Chart - Last 6 months */}
        <JobsTrendChart />

        {/* AI-Powered Forecasts */}
        <JobsForecastReport trend={forecastTrendData} />

        {/* Consolidated Export */}
        <ConsolidatedExport 
          data={exportData}
          filters={{
            startDate: filters.startDate,
            endDate: filters.endDate,
            vesselId: filters.vesselId,
          }}
        />
      </div>
    </div>
  );
}
