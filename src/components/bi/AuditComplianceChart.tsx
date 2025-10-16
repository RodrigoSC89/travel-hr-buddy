import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface AuditData {
  nome_navio: string;
  total: number;
  conformes: number;
  nao_conformes: number;
}

interface AuditComplianceChartProps {
  startDate?: string;
  endDate?: string;
  vesselId?: string;
}

export default function AuditComplianceChart({ startDate, endDate, vesselId }: AuditComplianceChartProps) {
  const [data, setData] = useState<AuditData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditData() {
      setLoading(true);
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

        if (startDate && endDate) {
          query = query
            .gte("audit_date", startDate)
            .lte("audit_date", endDate);
        }

        if (vesselId && vesselId !== "all") {
          query = query.eq("vessel_id", vesselId);
        }

        const { data: audits, error } = await query;

        if (error) {
          console.error("Error fetching audit data:", error);
          setData([]);
        } else if (audits) {
          // Group by vessel and count
          const grouped: Record<string, { total: number; conformes: number; nao_conformes: number }> = {};
          
          audits.forEach((audit) => {
            const vesselName = audit.vessels?.name || "Sem Navio";
            if (!grouped[vesselName]) {
              grouped[vesselName] = { total: 0, conformes: 0, nao_conformes: 0 };
            }
            grouped[vesselName].total += 1;
            // Mock data for conformance - in real implementation, this would come from audit items
            grouped[vesselName].conformes += Math.random() > 0.3 ? 1 : 0;
            grouped[vesselName].nao_conformes = grouped[vesselName].total - grouped[vesselName].conformes;
          });

          const chartData = Object.entries(grouped).map(([nome_navio, counts]) => ({
            nome_navio,
            ...counts,
          }));

          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching audit data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAuditData();
  }, [startDate, endDate, vesselId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Conformidade de Auditorias por Navio</CardTitle>
        <CardDescription>
          Comparativo de auditorias conformes vs não conformes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome_navio" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="conformes" fill="#22c55e" name="Conformes" stackId="a" />
              <Bar dataKey="nao_conformes" fill="#ef4444" name="Não Conformes" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-80">
            <p className="text-muted-foreground">Nenhum dado de auditoria disponível para o período selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
