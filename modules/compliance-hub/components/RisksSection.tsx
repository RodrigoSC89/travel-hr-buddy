/**
 * Risks Section Component
 * PATCH 92.0 - Risk assessment and monitoring with AI insights
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Brain, TrendingDown, Shield } from "lucide-react";

export const RisksSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Dashboard</CardTitle>
              <CardDescription>
                Real-time risk monitoring with AI-powered insights and recommendations
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Risk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-red-900 dark:text-red-100 mb-1">Critical</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">2</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-orange-900 dark:text-orange-100 mb-1">High</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">3</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100 mb-1">Medium</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between p-4 border rounded-lg border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-medium">Safety equipment certification expiring</p>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Safety harnesses and fall protection systems require immediate recertification
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Risk Score: 20</span>
                  <span>Likelihood: 5</span>
                  <span>Impact: 4</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mitigate</Button>
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <p className="font-medium">Crew training compliance gap</p>
                  <Badge className="bg-orange-600">High</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  3 crew members require updated emergency response training
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Risk Score: 16</span>
                  <span>Likelihood: 4</span>
                  <span>Impact: 4</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mitigate</Button>
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <p className="font-medium">Maintenance schedule overlap</p>
                  <Badge className="bg-yellow-600">Medium</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Planned maintenance may conflict with operational schedule
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Risk Score: 9</span>
                  <span>Likelihood: 3</span>
                  <span>Impact: 3</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Review</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            AI Risk Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-900 dark:text-purple-100 mb-4">
            Based on current risk profile analysis, the top priority is addressing critical safety equipment certification. 
            Immediate action recommended to prevent operational disruptions and ensure regulatory compliance.
          </p>
          <div className="flex items-center gap-2 text-sm text-purple-800 dark:text-purple-200">
            <TrendingDown className="h-4 w-4" />
            <span>Risk trend: -12% from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
