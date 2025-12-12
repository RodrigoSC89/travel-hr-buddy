import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ActionsListProps {
  selectedPlanId?: string;
  onRefresh: () => void;
}

export const ActionsList: React.FC<ActionsListProps> = ({ selectedPlanId, onRefresh }) => {
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, [selectedPlanId]);

  const loadActions = async () => {
    try {
      let query = supabase
        .from("sgso_actions")
        .select("*, sgso_plans(title)")
        .order("created_at", { ascending: false });

      if (selectedPlanId) {
        query = query.eq("plan_id", selectedPlanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActions(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading actions",
        description: error.message,
        variant: "destructive",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading actions...</div>;
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <Card key={action.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(action.status)}
              <CardTitle className="text-base">{action.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {action.action_type}
              </Badge>
              <Badge className="capitalize">{action.priority}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {action.description || "No description"}
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Plan: {action.sgso_plans?.title || "N/A"}
              </span>
              {action.due_date && (
                <span className="text-muted-foreground">
                  Due: {new Date(action.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {actions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No actions found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
