// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";

export function FindingsManager() {
  const { toast } = useToast();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("non_conformities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setFindings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading findings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (type: string) => {
    const severityConfig: Record<string, { variant: any; color: string }> = {
      "major": { variant: "destructive", color: "text-red-600" },
      "minor": { variant: "default", color: "text-yellow-600" },
      "observation": { variant: "outline", color: "text-blue-600" },
    };

    const config = severityConfig[type] || severityConfig["observation"];

    return (
      <Badge variant={config.variant}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any }> = {
      "open": { variant: "destructive" },
      "investigating": { variant: "default" },
      "action_planned": { variant: "secondary" },
      "resolved": { variant: "outline" },
      "closed": { variant: "outline" },
    };

    const config = statusConfig[status] || statusConfig["open"];

    return (
      <Badge variant={config.variant}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading findings...</div>
        </CardContent>
      </Card>
    );
  }

  if (findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Findings & Non-Conformities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No findings or non-conformities recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings & Non-Conformities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NC Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell className="font-medium">{finding.nc_number}</TableCell>
                <TableCell>{getSeverityBadge(finding.nc_type)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{finding.source}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {finding.description || "No description"}
                </TableCell>
                <TableCell>{getStatusBadge(finding.status)}</TableCell>
                <TableCell>
                  {finding.created_at ? format(new Date(finding.created_at), "PP") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
