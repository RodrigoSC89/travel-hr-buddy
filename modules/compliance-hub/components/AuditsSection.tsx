/**
 * Audits Section Component
 * PATCH 92.0 - Audit management with PDF generation
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Plus, Download, Calendar, TrendingUp } from "lucide-react";

export const AuditsSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Management</CardTitle>
              <CardDescription>
                Schedule, execute, and track compliance audits with automatic logging
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Audit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">IMCA M 204 Compliance Check</p>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Completed: Oct 18, 2025
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Score: 96.8%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">ISM Code Annual Audit</p>
                  <Badge>In Progress</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Scheduled: Oct 20, 2025
                  </span>
                  <span>3 findings</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Continue</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">ISPS Security Assessment</p>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Scheduled: Nov 5, 2025
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Start</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Comprehensive audit trail of all compliance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Audit logs will appear here</p>
            <p className="text-sm mt-1">All actions are automatically logged and traceable</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
