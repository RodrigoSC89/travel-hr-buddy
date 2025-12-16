/**
 * PATCH 454 - Incident Closure Stage
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { incidentService } from "../services/incident-service";
import type { Incident } from "../types";

interface Props {
  incidents: Incident[];
  onRefresh: () => void;
}

export const IncidentClosure: React.FC<Props> = ({ incidents, onRefresh }) => {
  const handleClose = async (id: string) => {
    try {
      await incidentService.updateIncident(id, { status: "closed", closedAt: new Date().toISOString() });
      toast.success("Incident closed");
      onRefresh();
    } catch (error) {
      toast.error("Failed to close incident");
    }
  };

  const openIncidents = incidents.filter(i => i.status !== "closed");

  return (
    <Card>
      <CardHeader><CardTitle>Incident Closure</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {openIncidents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">All incidents closed</p>
          ) : (
            openIncidents.map(incident => (
              <Card key={incident.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{incident.title}</span>
                      <Badge>{incident.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reported: {new Date(incident.reportedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleClose(incident.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Close
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
