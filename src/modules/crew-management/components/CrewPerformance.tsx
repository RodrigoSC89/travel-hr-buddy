/**
 * Crew Performance Component - Track crew performance metrics
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

export function CrewPerformance() {
  // Mock data - to be replaced with real data from Supabase
  const performance = [
    { 
      id: 1, 
      member: "John Smith", 
      role: "Captain",
      rating: 95, 
      trend: "up",
      completedTasks: 48,
      totalTasks: 50,
      incidents: 0
    },
    { 
      id: 2, 
      member: "Maria Garcia", 
      role: "Chief Engineer",
      rating: 92, 
      trend: "up",
      completedTasks: 45,
      totalTasks: 50,
      incidents: 1
    },
    { 
      id: 3, 
      member: "Ahmed Hassan", 
      role: "Second Officer",
      rating: 87, 
      trend: "down",
      completedTasks: 42,
      totalTasks: 50,
      incidents: 2
    },
    { 
      id: 4, 
      member: "Lisa Chen", 
      role: "Third Engineer",
      rating: 90, 
      trend: "up",
      completedTasks: 46,
      totalTasks: 50,
      incidents: 0
    },
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-600";
    if (rating >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {performance.map((perf) => (
            <div key={perf.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{perf.member}</p>
                  <p className="text-sm text-muted-foreground">{perf.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getRatingColor(perf.rating)}`}>
                    {perf.rating}%
                  </span>
                  {perf.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Task Completion</span>
                  <span className="font-medium">{perf.completedTasks}/{perf.totalTasks}</span>
                </div>
                <Progress value={(perf.completedTasks / perf.totalTasks) * 100} />
              </div>

              <div className="flex gap-4 text-sm">
                <Badge variant={perf.incidents === 0 ? "default" : "destructive"}>
                  {perf.incidents} Incidents
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
