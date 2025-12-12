import { useEffect, useState, useCallback, useMemo } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, TrendingUp } from "lucide-react";
import { mlcInspectionService, MLCInspection } from "@/services/mlc-inspection.service";
import { useToast } from "@/hooks/use-toast";

interface InspectionsListProps {
  onSelectInspection: (id: string) => void;
  onStatsUpdate: () => void;
}

export const InspectionsList = memo(function({ onSelectInspection, onStatsUpdate }: InspectionsListProps) {
  const [inspections, setInspections] = useState<MLCInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await mlcInspectionService.getInspections();
      setInspections(data);
    } catch (error) {
      console.error("Error loading inspections:", error);
      toast({
        title: "Error",
        description: "Failed to load inspections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      in_progress: "bg-blue-500",
      submitted: "bg-yellow-500",
      reviewed: "bg-purple-500",
      approved: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getComplianceColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading inspections...</p>
        </CardContent>
      </Card>
    );
  }

  if (inspections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground">No inspections found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first MLC inspection to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {inspections.map((inspection) => (
        <Card 
          key={inspection.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleonSelectInspection}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {inspection.inspection_type.replace(/_/g, " ").toUpperCase()}
              </CardTitle>
              <Badge className={getStatusColor(inspection.status)}>
                {inspection.status}
              </Badge>
            </div>
            <CardDescription>
              Vessel ID: {inspection.vessel_id.substring(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {inspection.inspector_name}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(inspection.inspection_date).toLocaleDateString()}
            </div>
            {inspection.compliance_score !== undefined && (
              <div className="flex items-center text-sm">
                <TrendingUp className={`h-4 w-4 mr-2 ${getComplianceColor(inspection.compliance_score)}`} />
                <span className={getComplianceColor(inspection.compliance_score)}>
                  Compliance: {inspection.compliance_score}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
