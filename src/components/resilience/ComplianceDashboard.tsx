// @ts-nocheck
/**
 * Compliance Dashboard
 * Displays overall compliance status and metrics
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ComplianceDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400">
          <Shield /> Compliance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">ISM Compliance</span>
            <span className="text-green-400 text-sm font-semibold">100%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">ISPS Compliance</span>
            <span className="text-green-400 text-sm font-semibold">100%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">ASOG Status</span>
            <span className="text-green-400 text-sm font-semibold">Conforme</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
