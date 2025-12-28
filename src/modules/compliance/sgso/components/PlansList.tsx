/**
 * SGSO Plans List Component
 * Displays and manages SGSO plans
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateSgsoReportPDF } from "../services/generateSgsoReportPDF";
import type { Json } from "@/integrations/supabase/types";

// Aligned with sgso_plans schema
interface SGSOPlan {
  id: string;
  plan_name: string;
  plan_version: string | null;
  status: string | null;
  content: Json | null;
  metadata: Json | null;
  created_at: string | null;
}

interface PlansListProps {
  onSelectPlan: (plan: SGSOPlan) => void;
  onRefresh: () => void;
}

export const PlansList: React.FC<PlansListProps> = ({ onSelectPlan, onRefresh }) => {
  const [plans, setPlans] = useState<SGSOPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("sgso_plans")
        .select("id, plan_name, plan_version, status, content, metadata, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans((data || []) as SGSOPlan[]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error loading plans",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (plan: SGSOPlan) => {
    try {
      const { data: actions } = await supabase
        .from("sgso_actions")
        .select("*")
        .eq("plan_id", plan.id);

      // Get metadata description
      const metadata = plan.metadata as Record<string, unknown> | null;
      const description = metadata?.description as string || "";

      // Transform plan and actions to expected format for PDF generator
      const planForPdf = {
        id: plan.id,
        title: plan.plan_name,
        version: plan.plan_version || "1.0",
        status: plan.status || "draft",
        description: description,
        created_at: plan.created_at,
      };

      // Transform actions to expected format
      const actionsForPdf = (actions || []).map(action => ({
        id: action.id as string,
        action_name: action.action_name as string,
        action_type: action.action_type as string,
        status: action.status as string,
        priority: action.priority as string | null,
        due_date: action.due_date as string | null,
        assigned_to: action.assigned_to as string | null,
        description: action.description as string | null,
      }));

      const blob = await generateSgsoReportPDF(planForPdf, actionsForPdf);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sgso-plan-${plan.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF generated",
        description: "SGSO report has been downloaded.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error generating PDF",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Get description from metadata
  const getDescription = (plan: SGSOPlan): string => {
    if (!plan.metadata) return "No description";
    const meta = plan.metadata as Record<string, unknown>;
    return (meta.description as string) || "No description";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading plans...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                <CardDescription className="mt-1">Version {plan.plan_version || "1.0"}</CardDescription>
              </div>
              <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                {plan.status || "draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{getDescription(plan)}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onSelectPlan(plan)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExportPDF(plan)}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {plans.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No plans found. Create your first SGSO plan.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
