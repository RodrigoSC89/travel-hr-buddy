// @ts-nocheck
/**
 * Compliance Reporter Component
 * Real-time incident tracking with Supabase Realtime subscriptions
 */

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface IncidentRecord {
  id: string;
  timestamp: string;
  module: string;
  type: string;
  severity: string;
  message: string;
  riskScore: number;
  compliance: string[];
}

export default function ComplianceReporter() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchIncidents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("incident_reports_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incident_reports",
        },
        (payload) => {
          console.log("Incident update received:", payload);
          if (payload.eventType === "INSERT") {
            setIncidents((prev) => [payload.new as IncidentRecord, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchIncidents() {
    const { data, error } = await supabase
      .from("incident_reports")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching incidents:", error);
      return;
    }

    setIncidents(data || []);
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
    case "Critical":
      return "destructive";
    case "Major":
      return "default";
    case "Moderate":
      return "secondary";
    case "Minor":
      return "outline";
    default:
      return "outline";
    }
  }

  return (
    <Card className="bg-gray-950 border-cyan-800">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Incident Reports - Real-time Tracking
        </CardTitle>
        <CardDescription className="text-gray-400">
          Automated incident detection and compliance mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-cyan-800">
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-800 hover:bg-gray-900">
                <TableHead className="text-cyan-400">Timestamp</TableHead>
                <TableHead className="text-cyan-400">Module</TableHead>
                <TableHead className="text-cyan-400">Type</TableHead>
                <TableHead className="text-cyan-400">Severity</TableHead>
                <TableHead className="text-cyan-400">Risk Score</TableHead>
                <TableHead className="text-cyan-400">Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No incidents reported
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id} className="border-cyan-800/50 hover:bg-gray-900">
                    <TableCell className="text-gray-300">
                      {new Date(incident.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-300">{incident.module}</TableCell>
                    <TableCell className="text-gray-300">{incident.type}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono">
                      {incident.riskScore.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {incident.compliance?.slice(0, 3).map((std, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {std}
                          </Badge>
                        ))}
                        {incident.compliance?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{incident.compliance.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
