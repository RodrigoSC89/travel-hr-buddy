import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description?: string;
  severity: string;
  category: string;
  status: string;
  incident_date: string;
  incident_location?: string;
  impact_level?: string;
}

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailDialog: React.FC<IncidentDetailDialogProps> = ({
  incident,
  open,
  onOpenChange,
}) => {
  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>{incident.title}</span>
              <Badge variant="outline">{incident.incident_number}</Badge>
            </DialogTitle>
            <Badge variant={incident.severity === 'critical' ? 'destructive' : 'default'}>
              {incident.severity}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge>{incident.status.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <span className="font-medium">Category:</span> {incident.category}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(incident.incident_date).toLocaleString()}
                </div>
                {incident.incident_location && (
                  <div>
                    <span className="font-medium">Location:</span> {incident.incident_location}
                  </div>
                )}
                {incident.impact_level && (
                  <div>
                    <span className="font-medium">Impact Level:</span> {incident.impact_level}
                  </div>
                )}
                {incident.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-2 text-muted-foreground">{incident.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followups">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No follow-ups recorded yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No attachments uploaded yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
