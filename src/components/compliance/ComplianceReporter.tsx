
/**
 * Compliance Reporter Component
 * Real-time incident tracking with Supabase Realtime subscriptions
 */

import React, { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
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
          logger.info("Incident update received:", payload);
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
    <Card className="bg-card border-primary/30">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Incident Reports - Real-time Tracking
        </CardTitle>
        <CardDescription>
          Automated incident detection and compliance mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-primary/30">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/30 hover:bg-muted">
                <TableHead className="text-primary">Timestamp</TableHead>
                <TableHead className="text-primary">Module</TableHead>
                <TableHead className="text-primary">Type</TableHead>
                <TableHead className="text-primary">Severity</TableHead>
                <TableHead className="text-primary">Risk Score</TableHead>
                <TableHead className="text-primary">Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No incidents reported
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id} className="border-primary/20 hover:bg-muted">
                    <TableCell className="text-foreground">
                      {new Date(incident.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-foreground">{incident.module}</TableCell>
                    <TableCell className="text-foreground">{incident.type}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-mono">
                      {incident.riskScore.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-foreground">
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
