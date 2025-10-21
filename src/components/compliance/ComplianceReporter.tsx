// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export default function ComplianceReporter() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const subscription = supabase
      .channel("incident_reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "incident_reports" }, fetchLogs)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  async function fetchLogs() {
    const { data } = await supabase.from("incident_reports").select("*").order("timestamp", { ascending: false });
    setLogs(data || []);
  }

  return (
    <Card className="bg-gray-950 border-cyan-800 text-gray-300">
      <CardHeader>
        <CardTitle className="text-cyan-400">AI Compliance & Incident Reporter</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Gravidade</TableCell>
              <TableCell>Normas Relacionadas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.severity}</TableCell>
                <TableCell>{log.compliance.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
