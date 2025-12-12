import { useEffect, useState } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateSgsoReportPDF } from "../services/generateSgsoReportPDF";

interface PlansListProps {
  onSelectPlan: (plan: unknown: unknown: unknown) => void;
  onRefresh: () => void;
}

export const PlansList: React.FC<PlansListProps> = ({ onSelectPlan, onRefresh }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("sgso_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (plan: unknown: unknown: unknown) => {
    try {
      const { data: actions } = await supabase
        .from("sgso_actions")
        .select("*")
        .eq("plan_id", plan.id);

      const blob = await generateSgsoReportPDF(plan, actions || []);
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
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error generating PDF",
        description: error.message,
        variant: "destructive",
      });
    }
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
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <CardDescription className="mt-1">
                  Version {plan.version}
                </CardDescription>
              </div>
              <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                {plan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {plan.description || "No description"}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectPlan(plan)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF(plan)}
              >
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
