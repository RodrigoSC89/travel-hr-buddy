import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { logger } from "@/lib/logger";
import type { MMIBISummary } from "@/types/mmi";

export default function MMIDashboard() {
  const [data, setData] = useState<MMIBISummary>({
    failuresBySystem: [],
    jobsByVessel: [],
    postponements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/mmi/bi/summary");
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          setData(json);
        } else {
          // Use mock data for development if API is not available
          logger.info("Using mock data for MMI BI Dashboard");
          setData({
            failuresBySystem: [
              { system: "Hidráulico", count: 12 },
              { system: "Elétrico", count: 8 },
              { system: "Mecânico", count: 15 },
              { system: "Eletrônico", count: 6 }
            ],
            jobsByVessel: [
              { vessel: "Navio A", jobs: 45 },
              { vessel: "Navio B", jobs: 38 },
              { vessel: "Navio C", jobs: 52 },
              { vessel: "Navio D", jobs: 31 }
            ],
            postponements: [
              { status: "No prazo", count: 120 },
              { status: "Postergado", count: 25 }
            ]
          });
        }
      } catch (error) {
        logger.error("Error fetching MMI BI summary:", error);
        // Use mock data on error
        setData({
          failuresBySystem: [
            { system: "Hidráulico", count: 12 },
            { system: "Elétrico", count: 8 },
            { system: "Mecânico", count: 15 },
            { system: "Eletrônico", count: 6 }
          ],
          jobsByVessel: [
            { vessel: "Navio A", jobs: 45 },
            { vessel: "Navio B", jobs: 38 },
            { vessel: "Navio C", jobs: 52 },
            { vessel: "Navio D", jobs: 31 }
          ],
          postponements: [
            { status: "No prazo", count: 120 },
            { status: "Postergado", count: 25 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando dados do BI...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Falhas por Sistema</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.failuresBySystem}>
              <XAxis dataKey="system" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Jobs por Embarcação</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.jobsByVessel}>
              <XAxis dataKey="vessel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jobs" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Taxa de Postergação</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.postponements}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
