import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileCheck, Calendar, TrendingUp, Plus, CheckCircle, AlertCircle, Clock, Upload } from "lucide-react";
import { Logger } from "@/lib/utils/logger-enhanced";

interface AuditItem {
  id: string;
  title: string;
  type: "IMCA" | "ISM" | "ISPS";
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  score?: number;
  scheduled_date: string;
  completion_date?: string;
  findings_count?: number;
}

const AuditCenter = () => {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Logger.module("audit-center", "Initializing Audit Center");
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      // Mock data for now - will be replaced with Supabase integration
      const mockAudits: AuditItem[] = [
        {
          id: "1",
          title: "IMCA M 204 Compliance Check",
          type: "IMCA",
          status: "completed",
          score: 96.8,
          scheduled_date: "2025-10-15",
          completion_date: "2025-10-18",
          findings_count: 3,
        },
        {
          id: "2",
          title: "ISM Code Annual Audit",
          type: "ISM",
          status: "in_progress",
          scheduled_date: "2025-10-20",
          findings_count: 0,
        },
        {
          id: "3",
          title: "ISPS Security Assessment",
          type: "ISPS",
          status: "scheduled",
          scheduled_date: "2025-11-05",
        },
      ];

      setAudits(mockAudits);
      Logger.info("Audits loaded successfully", { count: mockAudits.length });
    } catch (error) {
      Logger.error("Failed to load audits", error, "audit-center");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AuditItem["status"]) => {
    const variants = {
      scheduled: { variant: "secondary" as const, icon: Clock, label: "Scheduled" },
      in_progress: { variant: "default" as const, icon: AlertCircle, label: "In Progress" },
      completed: { variant: "outline" as const, icon: CheckCircle, label: "Completed" },
      overdue: { variant: "destructive" as const, icon: AlertCircle, label: "Overdue" },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: audits.length,
    scheduled: audits.filter(a => a.status === "scheduled").length,
    compliance_rate: 96.8,
    improvement: 8.2,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Audit Center</h1>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Audit
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliance_rate}%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.improvement}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Audits</TabsTrigger>
          <TabsTrigger value="imca">IMCA</TabsTrigger>
          <TabsTrigger value="ism">ISM</TabsTrigger>
          <TabsTrigger value="isps">ISPS</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading audits...</p>
              </CardContent>
            </Card>
          ) : (
            audits.map(audit => (
              <Card key={audit.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{audit.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{audit.type}</Badge>
                        {getStatusBadge(audit.status)}
                      </div>
                    </div>
                    {audit.score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{audit.score}%</div>
                        <p className="text-xs text-muted-foreground">Compliance</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(audit.scheduled_date).toLocaleDateString()}
                      </span>
                      {audit.findings_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {audit.findings_count} findings
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Upload className="h-4 w-4" />
                      Upload Evidence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="imca">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">IMCA audits will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ism">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">ISM audits will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isps">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">ISPS audits will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditCenter;
