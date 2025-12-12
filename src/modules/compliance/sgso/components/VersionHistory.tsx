import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VersionHistoryProps {
  selectedPlanId?: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ selectedPlanId }) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPlanId) {
      loadVersions();
    } else {
      setVersions([]);
      setIsLoading(false);
    }
  }, [selectedPlanId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("sgso_versions")
        .select("*")
        .eq("plan_id", selectedPlanId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading versions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlanId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a plan to view version history</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading version history...</div>;
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-base">Version {version.version}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(version.created_at).toLocaleString()}
            </span>
          </CardHeader>
          <CardContent>
            {version.changes_summary && (
              <p className="text-sm text-muted-foreground mb-2">{version.changes_summary}</p>
            )}
            <div className="text-xs text-muted-foreground">
              {version.plan_data && (
                <div className="space-y-1">
                  <p><strong>Title:</strong> {version.plan_data.title}</p>
                  <p><strong>Status:</strong> {version.plan_data.status}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {versions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No version history available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
