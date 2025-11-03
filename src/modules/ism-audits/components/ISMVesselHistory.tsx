/**
 * PATCH 609: ISM Vessel History Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Calendar, FileText } from "lucide-react";

export default function ISMVesselHistory() {
  const vessels = [
    { name: "MV Oceanic", audits: 5, lastAudit: "2024-10-15" },
    { name: "MV Atlantic", audits: 3, lastAudit: "2024-09-20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vessels.map((vessel, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ship className="h-5 w-5" />
              {vessel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{vessel.audits} audits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Last: {vessel.lastAudit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
