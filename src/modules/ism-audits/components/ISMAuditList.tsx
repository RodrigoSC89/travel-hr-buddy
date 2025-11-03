/**
 * PATCH 609: ISM Audit List Component
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

export default function ISMAuditList() {
  const [audits] = useState([
    {
      id: "1",
      vessel: "MV Oceanic",
      type: "Internal Audit",
      date: "2024-10-15",
      status: "completed",
      nonConformities: 3,
    },
    {
      id: "2",
      vessel: "MV Atlantic",
      type: "External Audit",
      date: "2024-09-20",
      status: "completed",
      nonConformities: 1,
    },
  ]);

  return (
    <div className="space-y-4">
      {audits.map((audit) => (
        <Card key={audit.id}>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">{audit.vessel}</h3>
                <p className="text-sm text-muted-foreground">
                  {audit.type} - {audit.date}
                </p>
                <Badge variant="secondary">{audit.nonConformities} NC found</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
