/**
 * PATCH 609: ISM Reports Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp } from "lucide-react";

export default function ISMReports() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Audit Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Total Audits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Non-Conformities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">85%</div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
              </CardContent>
            </Card>
          </div>
          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Full Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
