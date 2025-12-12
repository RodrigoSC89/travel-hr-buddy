/**
import { useEffect, useState } from "react";;
 * PATCH 113.0 - Compliance Checklist & Auto-Auditor
 * Compliance Checklist - Regulatory compliance tracking with AI auditing
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  RefreshCw,
  Plus,
  Search,
  Download,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { runAIContext } from "@/ai/kernel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface ComplianceRecord {
  id: string;
  checklist_name: string;
  checklist_type: string;
  completion_status: string;
  risk_level: string | null;
  compliance_score: number | null;
  analyzed_by_ai: boolean;
  ai_result: string | null;
  completed_at: string | null;
  created_at: string;
  vessel_name?: string;
  imo_code?: string;
  days_since_completion?: number;
  findings_count?: number;
  recommendations_count?: number;
  findings?: any[];
  recommendations?: any[];
}

const ComplianceChecklist = () => {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const { toast } = useToast();

  const loadComplianceRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("compliance_dashboard" as any)
        .select("*");

      if (error) throw error;

      // Also fetch full details for records with findings/recommendations
      const recordsWithDetails = await Promise.all(
        (data || []).map(async (record: any) => {
          const { data: fullRecord } = await supabase
            .from("compliance_records" as any)
            .select("findings, recommendations")
            .eq("id", record.id)
            .single();
          
          return {
            ...record,
            findings: (fullRecord as any)?.findings || [],
            recommendations: (fullRecord as any)?.recommendations || []
          };
        })
      );

      setRecords(recordsWithDetails as any);
      
      // PATCH 549: Call loadAIInsights after records are loaded
      await loadAIInsightsInternal(recordsWithDetails as any);
    } catch (error) {
      console.error("Error loading compliance records:", error);
      toast({
        title: "Error",
        description: "Failed to load compliance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // PATCH 549: Moved loadAIInsights inside loadComplianceRecords to avoid stale state dependency
  // and useEffect after both functions
  useEffect(() => {
    const loadData = async () => {
      await loadComplianceRecords();
    };
    loadData();
  }, []);

  const loadAIInsights = async () => {
    await loadAIInsightsInternal(records);
  };

  const loadAIInsightsInternal = async (currentRecords: any[]) => {
    try {
      const nonCompliantCount = currentRecords.filter(r => r.risk_level === "non_compliant").length;
      const riskCount = currentRecords.filter(r => r.risk_level === "major_risk" || r.risk_level === "minor_risk").length;
      const compliantCount = currentRecords.filter(r => r.risk_level === "compliant").length;
      
      const response = await runAIContext({
        module: "compliance-auditor",
        action: "audit",
        context: { 
          nonCompliantCount,
          riskCount,
          compliantCount,
          totalChecklists: currentRecords.filter(r => r.completion_status === "completed").length
        }
      });
      
      if (response.message) {
        setAiInsight(response.message);
      }
    } catch (error) {
      console.error("Error loading AI insights:", error);
    }
  };

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
    case "non_compliant":
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" /> Non-Compliant
      </Badge>;
    case "major_risk":
      return <Badge variant="destructive" className="flex items-center gap-1 bg-orange-600">
        <AlertTriangle className="h-3 w-3" /> Major Risk
      </Badge>;
    case "minor_risk":
      return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
        <AlertCircle className="h-3 w-3" /> Minor Risk
      </Badge>;
    case "compliant":
      return <Badge variant="secondary" className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-3 w-3" /> Compliant
      </Badge>;
    default:
      return <Badge variant="outline">Not Assessed</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "completed":
      return <Badge variant="secondary">Completed</Badge>;
    case "pending_review":
      return <Badge variant="outline" className="text-orange-600 border-orange-600">
          Pending Review
      </Badge>;
    case "approved":
      return <Badge variant="secondary" className="text-green-600">
          Approved
      </Badge>;
    case "in_progress":
      return <Badge variant="outline">In Progress</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === "all" || record.checklist_type === filterType;
    const matchesStatus = filterStatus === "all" || record.completion_status === filterStatus;
    const matchesRisk = filterRisk === "all" || record.risk_level === filterRisk;
    const matchesSearch = searchQuery === "" || 
      record.checklist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vessel_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesRisk && matchesSearch;
  });

  const types = Array.from(new Set(records.map(r => r.checklist_type)));

  const totalRecords = records.filter(r => r.completion_status === "completed").length;
  const nonCompliantCount = records.filter(r => r.risk_level === "non_compliant").length;
  const atRiskCount = records.filter(r => r.risk_level === "major_risk" || r.risk_level === "minor_risk").length;
  const compliantCount = records.filter(r => r.risk_level === "compliant").length;
  const avgScore = records.length > 0 
    ? (records.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / records.filter(r => r.compliance_score).length).toFixed(1)
    : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Checklist</h1>
            <p className="text-muted-foreground">Regulatory Compliance & Auto-Auditor</p>
          </div>
        </div>
        <Button onClick={loadComplianceRecords} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Checklists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{nonCompliantCount}</div>
            <p className="text-xs text-muted-foreground">Require action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">{compliantCount} compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              AI Compliance Auditor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search checklists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="minor_risk">Minor Risk</SelectItem>
                <SelectItem value="major_risk">Major Risk</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Records List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compliance Checklists</CardTitle>
            <CardDescription>
              {filteredRecords.length} records {filteredRecords.length !== records.length && `(filtered from ${records.length})`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Checklist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading compliance records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No compliance records found matching your filters
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{record.checklist_name}</h3>
                          {getRiskBadge(record.risk_level)}
                          {getStatusBadge(record.completion_status)}
                          <Badge variant="outline" className="text-xs">
                            {record.checklist_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Vessel:</span> {record.vessel_name || "All Vessels"}
                          </div>
                          {record.compliance_score !== null && (
                            <div>
                              <span className="font-medium">Score:</span> {record.compliance_score.toFixed(1)}%
                            </div>
                          )}
                          {record.completed_at && (
                            <div>
                              <span className="font-medium">Completed:</span>{" "}
                              {format(new Date(record.completed_at), "PP")}
                            </div>
                          )}
                          {record.analyzed_by_ai && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span>AI Analyzed</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>

                    {/* AI Result */}
                    {record.ai_result && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm">{record.ai_result}</p>
                      </div>
                    )}

                    {/* Findings */}
                    {record.findings && record.findings.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Findings ({record.findings.length})
                        </h4>
                        <div className="space-y-1">
                          {record.findings.slice(0, 3).map((finding: any, idx: number) => (
                            <div key={idx} className="text-sm pl-6 text-muted-foreground">
                              <span className="font-medium">{finding.item}:</span> {finding.issue}
                              {finding.severity && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {finding.severity}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {record.findings.length > 3 && (
                            <p className="text-xs text-muted-foreground pl-6">
                              +{record.findings.length - 3} more findings
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {record.recommendations && record.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Recommendations ({record.recommendations.length})
                        </h4>
                        <div className="space-y-1">
                          {record.recommendations.slice(0, 2).map((rec: any, idx: number) => (
                            <div key={idx} className="text-sm pl-6 text-muted-foreground">
                              • {rec.recommendation}
                              {rec.priority && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {rec.priority}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {record.recommendations.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-6">
                              +{record.recommendations.length - 2} more recommendations
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceChecklist;
