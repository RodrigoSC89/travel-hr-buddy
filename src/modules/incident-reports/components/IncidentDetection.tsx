/**
 * PATCH 454 - Incident Detection Stage
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye } from "lucide-react";
import type { Incident } from "../types";

interface Props {
  incidents: Incident[];
  onRefresh: () => void;
}

export const IncidentDetection: React.FC<Props> = ({ incidents }) => {
  return (
    <Card>
      <CardHeader><CardTitle>Incident Detection</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No open incidents detected</p>
          ) : (
            incidents.map(incident => (
              <Card key={incident.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{incident.title}</span>
                      <Badge variant="outline">{incident.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {incident.location} • {new Date(incident.reportedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={incident.severity === "critical" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"}>
                      {incident.severity}
                    </Badge>
                    <Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
