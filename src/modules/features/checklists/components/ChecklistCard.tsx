import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Ship, Users, Clock, Eye, Brain } from "lucide-react";
import type { Checklist } from "../types";
import { calculateProgress } from "../utils/checklistValidation";

interface ChecklistCardProps {
  checklist: Checklist;
  onView?: (checklist: Checklist) => void;
  onAnalyze?: (checklistId: string) => void;
}

export function ChecklistCard({ checklist, onView, onAnalyze }: ChecklistCardProps) {
  const progress = calculateProgress(checklist.items);
  
  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "bg-green-500";
    case "in_progress": return "bg-blue-500";
    case "approved": return "bg-purple-500";
    default: return "bg-gray-500";
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onView?.(checklist)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">{checklist.title}</h3>
              <Badge variant="outline" className={getStatusColor(checklist.status)}>
                {checklist.status}
              </Badge>
              {checklist.complianceScore && (
                <Badge variant="secondary">
                  Score: {checklist.complianceScore}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Ship className="h-4 w-4" />
                {checklist.vessel?.name || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {checklist.inspector?.name || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(checklist.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze?.(checklist.id);
              }}
            >
              <Brain className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(checklist);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
