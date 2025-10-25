// PATCH 107.0: Predictive Maintenance Engine Module
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  FileText,
  Download,
  Brain,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { MaintenanceRecord, MaintenanceDashboardView, MaintenancePrediction, MaintenanceFilters } from "@/types/maintenance";
import { runAIContext } from "@/ai/kernel";

const MaintenanceEngine: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceDashboardView[]>([]);
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [filters, setFilters] = useState<MaintenanceFilters>({});
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  useEffect(() => {
    loadMaintenanceData();
  }, [filters, selectedVessel]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      
      // Load maintenance dashboard view
      let query = supabase
        .from('maintenance_dashboard')
        .select('*');

      if (selectedVessel !== 'all') {
        query = query.eq('vessel_id', selectedVessel);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMaintenanceRecords(data || []);

      // Load predictions
      const { data: predictionsData, error: predictionsError } = await supabase
        .rpc('get_maintenance_predictions', { 
          vessel_uuid: selectedVessel === 'all' ? null : selectedVessel 
        });

      if (predictionsError) {
        console.error('Error loading predictions:', predictionsError);
      } else {
        setPredictions(predictionsData || []);
      }
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIForecast = async () => {
    try {
      const response = await runAIContext({
        module: 'maintenance-forecast',
        action: 'forecast',
        context: {
          maintenance_records: maintenanceRecords,
          predictions: predictions,
        }
      });
      setAiAnalysis(response.message);
      
      toast({
        title: "AI Forecast Complete",
        description: "Maintenance predictions generated successfully",
      });
    } catch (error) {
      console.error('Error running AI forecast:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI forecast",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Export Initiated",
      description: "Generating PDF maintenance plan...",
    });
    // PDF export logic would go here
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      ok: { variant: "default", label: "OK" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      overdue: { variant: "destructive", label: "Overdue" },
      forecasted: { variant: "outline", label: "Forecasted" },
    };
    const config = variants[status] || variants.ok;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      overdue: { variant: "destructive", label: "Overdue" },
      urgent: { variant: "destructive", label: "Urgent" },
      upcoming: { variant: "secondary", label: "Upcoming" },
      ok: { variant: "default", label: "On Track" },
    };
    const config = variants[urgency] || variants.ok;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      critical: { variant: "destructive", label: "Critical" },
      high: { variant: "destructive", label: "High" },
      normal: { variant: "secondary", label: "Normal" },
      low: { variant: "outline", label: "Low" },
    };
    const config = variants[priority] || variants.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: maintenanceRecords.length,
    overdue: maintenanceRecords.filter(r => r.urgency_status === 'overdue').length,
    urgent: maintenanceRecords.filter(r => r.urgency_status === 'urgent').length,
    forecasted: maintenanceRecords.filter(r => r.status === 'forecasted').length,
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ModulePageWrapper>
      <ModuleHeader
        title="Predictive Maintenance Engine"
        description="AI-powered maintenance scheduling and predictive analytics"
        icon={Wrench}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Maintenance records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Forecasted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.forecasted}</div>
            <p className="text-xs text-muted-foreground">Predicted issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>View and manage maintenance records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={runAIForecast}>
                <Brain className="mr-2 h-4 w-4" />
                AI Forecast
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Vessel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessels</SelectItem>
                {/* Vessel options would be loaded dynamically */}
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance List */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="forecasted">AI Forecasted</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {maintenanceRecords.map((record) => (
                <Card key={record.id} className="hover:bg-accent">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{record.component}</h3>
                            <p className="text-sm text-muted-foreground">{record.vessel_name} ({record.imo_code})</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(record.status)}
                          {getUrgencyBadge(record.urgency_status)}
                          {getPriorityBadge(record.priority)}
                        </div>
                        {record.forecasted_issue && (
                          <p className="text-sm text-orange-600 mt-2">
                            <AlertTriangle className="inline mr-1 h-3 w-3" />
                            {record.forecasted_issue}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="inline mr-1 h-3 w-3" />
                          Due: {record.next_due ? new Date(record.next_due).toLocaleDateString() : 'Not scheduled'}
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {record.days_until_due > 0 
                            ? `${Math.round(record.days_until_due)} days remaining`
                            : `${Math.abs(Math.round(record.days_until_due))} days overdue`
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              {maintenanceRecords.filter(r => r.urgency_status === 'overdue').map((record) => (
                <Card key={record.id} className="hover:bg-accent border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{record.component}</h3>
                        <p className="text-sm text-muted-foreground">{record.vessel_name}</p>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(record.status)}
                          {getPriorityBadge(record.priority)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-red-600 font-medium">
                          {Math.abs(Math.round(record.days_until_due))} days overdue
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4">
              {maintenanceRecords.filter(r => r.urgency_status === 'urgent').map((record) => (
                <Card key={record.id} className="hover:bg-accent border-orange-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{record.component}</h3>
                        <p className="text-sm text-muted-foreground">{record.vessel_name}</p>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(record.status)}
                          {getPriorityBadge(record.priority)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-orange-600 font-medium">
                          {Math.round(record.days_until_due)} days until due
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="forecasted" className="space-y-4">
              {maintenanceRecords.filter(r => r.status === 'forecasted').map((record) => (
                <Card key={record.id} className="hover:bg-accent border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{record.component}</h3>
                        <p className="text-sm text-muted-foreground">{record.vessel_name}</p>
                        {record.forecasted_issue && (
                          <p className="text-sm text-blue-600 mt-2">
                            <Brain className="inline mr-1 h-3 w-3" />
                            {record.forecasted_issue}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {getPriorityBadge(record.priority)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>AI Maintenance Forecast</CardTitle>
                <CardDescription>Predictive analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap">{aiAnalysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predictions Section */}
          {predictions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Maintenance Predictions</CardTitle>
                <CardDescription>AI-generated maintenance recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.slice(0, 5).map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{pred.component}</h4>
                        <p className="text-sm text-muted-foreground">{pred.vessel_name}</p>
                        <p className="text-sm mt-1">{pred.recommended_action}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Score: {(pred.prediction_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Est. ${pred.estimated_cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
};

export default MaintenanceEngine;
