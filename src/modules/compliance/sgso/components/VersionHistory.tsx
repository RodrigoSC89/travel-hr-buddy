import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

interface VersionHistoryProps {
  selectedPlanId?: string;
}

interface SGSOVersion {
  id: string;
  version: number;
  created_at: string;
  changes_summary?: string | null;
  plan_data?: {
    title?: string;
    status?: string;
  } | null;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ selectedPlanId }) => {
  const [versions, setVersions] = useState<SGSOVersion[]>([]);
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
    if (!selectedPlanId) {
      setVersions([]);
      setIsLoading(false);
      return;
    }
    
    try {
      // Use document_versions table as fallback since sgso_versions may not exist
      const { data, error } = await supabase
        .from("document_versions")
        .select("id, version, changed_at, change_summary, document_snapshot")
        .eq("document_id", selectedPlanId)
        .order("changed_at", { ascending: false });

      if (error) {
        // Table might not exist, show empty state
        logger.warn("Could not load versions", { error: error.message });
        setVersions([]);
        return;
      }

      // Transform to expected format
      const transformed: SGSOVersion[] = (data || []).map((v) => {
        const snapshot = v.document_snapshot as Record<string, unknown> | null;
        return {
          id: v.id,
          version: v.version,
          created_at: v.changed_at || new Date().toISOString(),
          changes_summary: v.change_summary,
          plan_data: snapshot
            ? {
                title: (snapshot.title as string) || (snapshot.plan_name as string),
                status: snapshot.status as string,
              }
            : null,
        };
      });

      setVersions(transformed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error loading versions",
        description: message,
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
                  <p>
                    <strong>Title:</strong> {version.plan_data.title || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {version.plan_data.status || "N/A"}
                  </p>
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
};
