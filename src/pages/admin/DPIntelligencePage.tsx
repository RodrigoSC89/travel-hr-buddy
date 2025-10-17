"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table";
import { format } from "date-fns";

type Incident = {
  id: string
  title: string
  description: string
  source?: string
  incident_date?: string
  severity?: string
  vessel?: string
  gpt_analysis?: any
}

export default function DPIntelligencePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    const res = await fetch("/api/dp-incidents");
    const data = await res.json();
    setIncidents(data);
  }

  async function handleExplain(id: string) {
    setLoading(true);
    await fetch("/api/dp-incidents/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    await fetchIncidents();
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧠 Centro de Inteligência DP</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Navio</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>IA</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>{incident.vessel}</TableCell>
                  <TableCell>
                    {incident.incident_date ? format(new Date(incident.incident_date), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>{incident.severity || "-"}</TableCell>
                  <TableCell>
                    {incident.gpt_analysis ? (
                      <pre className="text-xs whitespace-pre-wrap bg-slate-100 p-2 rounded-md max-w-md">
                        {JSON.stringify(incident.gpt_analysis, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-gray-400 italic">Não analisado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      disabled={loading}
                      onClick={() => handleExplain(incident.id)}
                    >
                      Explicar com IA
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
