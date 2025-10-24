/**
 * Checklists Section Component
 * PATCH 92.0 - Dynamic checklist management
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, CheckCircle } from "lucide-react";

export const ChecklistsSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Checklists</CardTitle>
              <CardDescription>
                Dynamic FMEA, ISM, and ISPS checklists with execution history
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Checklist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ISM Code Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Items:</span>
                    <span>24</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ISPS Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Items:</span>
                    <span>18</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">FMEA Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Items:</span>
                    <span>32</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent checklist executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">ISM Code Checklist</p>
                <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">ISPS Security</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
