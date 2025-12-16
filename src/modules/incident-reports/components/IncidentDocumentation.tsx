/**
 * PATCH 454 - Incident Documentation Stage
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Incident } from "../types";

interface Props {
  incidents: Incident[];
  onRefresh: () => void;
  onExportPDF: (id: string) => void;
}

export const IncidentDocumentation: React.FC<Props> = ({ incidents, onExportPDF }) => {
  return (
    <Card>
      <CardHeader><CardTitle>Incident Documentation</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.map(incident => (
            <Card key={incident.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">{incident.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{incident.description}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onExportPDF(incident.id)}>
                  <Download className="h-3 w-3 mr-1" />
                  Export PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
