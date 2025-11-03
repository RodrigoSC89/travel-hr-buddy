/**
 * PATCH 599 - Drills Dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Play } from "lucide-react";

export default function DrillsDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Smart Drills</h2>
        <p className="text-muted-foreground">
          AI-generated emergency drill scenarios and performance tracking
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Upcoming Drills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage scheduled emergency drills
            </p>
            <Button>View Schedule</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Generate New Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create AI-powered drill scenarios based on historical data
            </p>
            <Button>Generate Scenario</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
