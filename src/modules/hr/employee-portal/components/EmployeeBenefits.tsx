// @ts-nocheck
/**
 * PATCH 353: Employee Benefits Management Component
 * View and manage employee benefits
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
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Benefit {
  id: string;
  benefit_type: string;
  benefit_name: string;
  provider?: string;
  coverage_amount?: number;
  premium_amount?: number;
  start_date: string;
  end_date?: string;
  status: string;
  details: any;
  created_at: string;
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

      const { data, error } = await supabase
        .from('employee_benefits')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error: any) {
      console.error('Error loading benefits:', error);
      toast({
        title: "Error loading benefits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'health_insurance':
        return Heart;
      case 'dental':
      case 'vision':
        return Eye;
      case 'life_insurance':
        return Shield;
      case 'retirement':
        return DollarSign;
      case 'vacation':
      case 'sick_leave':
        return Calendar;
      default:
        return Briefcase;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      active: { label: "Active", className: "bg-green-500", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-500", icon: Clock },
      suspended: { label: "Suspended", className: "bg-orange-500", icon: AlertCircle },
      cancelled: { label: "Cancelled", className: "bg-red-500", icon: XCircle },
    };

    const statusConfig = config[status] || { label: status, className: "bg-gray-500", icon: AlertCircle };
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getBenefitTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      health_insurance: "Health Insurance",
      dental: "Dental Insurance",
      vision: "Vision Insurance",
      life_insurance: "Life Insurance",
      retirement: "Retirement Plan",
      vacation: "Vacation Days",
      sick_leave: "Sick Leave",
      other: "Other Benefits"
    };
    return labels[type] || type;
  };

  const groupedBenefits = benefits.reduce((acc, benefit) => {
    const type = benefit.benefit_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(benefit);
    return acc;
  }, {} as Record<string, Benefit[]>);

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
            <div className="space-y-6">
              {Object.entries(groupedBenefits).map(([type, typeBenefits]) => {
                const Icon = getBenefitIcon(type);
                return (
                  <div key={type}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {getBenefitTypeLabel(type)}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {typeBenefits.map((benefit) => (
                        <Card key={benefit.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold">{benefit.benefit_name}</h4>
                                {getStatusBadge(benefit.status)}
                              </div>
                              
                              {benefit.provider && (
                                <p className="text-sm text-muted-foreground">
                                  Provider: {benefit.provider}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {benefit.coverage_amount && (
                                  <div>
                                    <span className="text-muted-foreground">Coverage:</span>
                                    <div className="font-medium">${benefit.coverage_amount.toLocaleString()}</div>
                                  </div>
                                )}
                                {benefit.premium_amount && (
                                  <div>
                                    <span className="text-muted-foreground">Premium:</span>
                                    <div className="font-medium">${benefit.premium_amount.toFixed(2)}/mo</div>
                                  </div>
                                )}
                              </div>

                              <div className="text-sm">
                                <span className="text-muted-foreground">Period:</span>
                                <div className="font-medium">
                                  {format(new Date(benefit.start_date), 'MMM dd, yyyy')}
                                  {benefit.end_date && (
                                    <> - {format(new Date(benefit.end_date), 'MMM dd, yyyy')}</>
                                  )}
                                  {!benefit.end_date && <> - Ongoing</>}
                                </div>
                              </div>

                              {benefit.details && Object.keys(benefit.details).length > 0 && (
                                <Button variant="outline" size="sm" className="w-full">
                                  View Details
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
