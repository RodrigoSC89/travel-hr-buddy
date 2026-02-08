/**
 * PATCH 353: Employee Benefits Management Component
 * DEBT-FIX: Removed (supabase as any) - employee_benefits → hr_employee_benefits
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  Shield,
  Eye,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  LucideIcon
} from "lucide-react";
import { format } from "date-fns";
import { logger } from '@/lib/logger';

interface Benefit {
  id: string;
  benefit_id: string | null;
  employee_id: string | null;
  enrollment_date: string;
  end_date: string | null;
  status: string | null;
  custom_value: number | null;
  dependents_count: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export const EmployeeBenefits: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBenefits();
  }, []);

  const loadBenefits = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use typed hr_employee_benefits table
      const { data, error } = await supabase
        .from("hr_employee_benefits")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBenefits((data as Benefit[]) || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error loading benefits:", error);
      toast({
        title: "Error loading benefits",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { label: string; className: string; icon: LucideIcon }> = {
      active: { label: "Active", className: "bg-green-500", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-500", icon: Clock },
      suspended: { label: "Suspended", className: "bg-orange-500", icon: AlertCircle },
      cancelled: { label: "Cancelled", className: "bg-red-500", icon: XCircle },
    };

    const statusConfig = config[status || ""] || { label: status || "Unknown", className: "bg-gray-500", icon: AlertCircle };
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            My Benefits
          </CardTitle>
          <CardDescription>
            View your employee benefits and coverage information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading benefits...</div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No benefits found
            </div>
          ) : (
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <Card key={benefit.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">Benefit #{benefit.benefit_id?.slice(0, 8) || "N/A"}</h4>
                        {getStatusBadge(benefit.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {benefit.custom_value != null && (
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <div className="font-medium">${benefit.custom_value.toLocaleString()}</div>
                          </div>
                        )}
                        {benefit.dependents_count != null && (
                          <div>
                            <span className="text-muted-foreground">Dependents:</span>
                            <div className="font-medium">{benefit.dependents_count}</div>
                          </div>
                        )}
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Period:</span>
                        <div className="font-medium">
                          {format(new Date(benefit.enrollment_date), "MMM dd, yyyy")}
                          {benefit.end_date && (
                            <> - {format(new Date(benefit.end_date), "MMM dd, yyyy")}</>
                          )}
                          {!benefit.end_date && <> - Ongoing</>}
                        </div>
                      </div>

                      {benefit.metadata && Object.keys(benefit.metadata).length > 0 && (
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
