/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 648 - AI Suggestions Dashboard
 * Proactive AI insights and automation recommendations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Lightbulb,
  Play,
  RefreshCw,
  TrendingUp,
  Zap,
  XCircle
} from "lucide-react";

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: "optimization" | "security" | "maintenance" | "compliance" | "efficiency";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "applied" | "rejected" | "in_progress";
  impact: string;
  module: string;
  createdAt: string;
  appliedAt?: string;
  confidence: number;
}

const AISuggestionsDashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "applied" | "rejected">("pending");

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    
    // Simulated AI suggestions - in production, this would call the AI service
    const mockSuggestions: AISuggestion[] = [
      {
        id: "ai-001",
        title: "Optimize SGSO Audit Scheduling",
        description: "Based on historical data, scheduling audits on Tuesdays results in 23% faster completion times. Suggest rescheduling upcoming audits.",
        category: "optimization",
        priority: "medium",
        status: "pending",
        impact: "Reduce audit completion time by ~2 days",
        module: "sgso",
        createdAt: "2025-11-04T10:00:00Z",
        confidence: 0.87
      },
      {
        id: "ai-002",
        title: "Crew Training Renewal Alert",
        description: "5 crew members have certifications expiring within 30 days. Auto-schedule renewal training sessions?",
        category: "compliance",
        priority: "high",
        status: "pending",
        impact: "Prevent certification lapses",
        module: "crew-management",
        createdAt: "2025-11-04T09:30:00Z",
        confidence: 0.95
      },
      {
        id: "ai-003",
        title: "Database Index Optimization",
        description: "Queries on 'missions' table are 40% slower than baseline. Add composite index on (vessel_id, status, created_at)?",
        category: "optimization",
        priority: "medium",
        status: "pending",
        impact: "Improve query performance by ~40%",
        module: "mission-control",
        createdAt: "2025-11-04T08:15:00Z",
        confidence: 0.92
      },
      {
        id: "ai-004",
        title: "Predictive Maintenance Alert",
        description: "Equipment E-42 shows usage patterns similar to previous failures. Schedule preventive maintenance within 7 days.",
        category: "maintenance",
        priority: "critical",
        status: "pending",
        impact: "Prevent potential equipment failure",
        module: "mmi",
        createdAt: "2025-11-04T07:00:00Z",
        confidence: 0.89
      },
      {
        id: "ai-005",
        title: "Security Policy Update Needed",
        description: "Detected outdated security headers. Update Content-Security-Policy to include latest threat vectors.",
        category: "security",
        priority: "high",
        status: "pending",
        impact: "Enhance application security",
        module: "api-gateway",
        createdAt: "2025-11-04T06:45:00Z",
        confidence: 0.91
      },
      {
        id: "ai-006",
        title: "Automated Checklist Pre-fill",
        description: "Mission data suggests standard departure checklist items. Auto-populate checklist based on mission type?",
        category: "efficiency",
        priority: "low",
        status: "applied",
        impact: "Reduce checklist completion time by 15%",
        module: "checklists-inteligentes",
        createdAt: "2025-11-03T14:20:00Z",
        appliedAt: "2025-11-04T08:00:00Z",
        confidence: 0.85
      },
      {
        id: "ai-007",
        title: "Anomaly in Data Sync Pattern",
        description: "Detected unusual data sync patterns in DP module. Investigate potential data integrity issue.",
        category: "security",
        priority: "critical",
        status: "in_progress",
        impact: "Ensure data integrity",
        module: "dp-intelligence",
        createdAt: "2025-11-04T05:30:00Z",
        confidence: 0.78
      }
    ];

    setSuggestions(mockSuggestions);
    setLoading(false);
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  };

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === "pending").length,
    applied: suggestions.filter(s => s.status === "applied").length,
    rejected: suggestions.filter(s => s.status === "rejected").length,
    inProgress: suggestions.filter(s => s.status === "in_progress").length,
    critical: suggestions.filter(s => s.priority === "critical" && s.status === "pending").length
  };

  const applySuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: "applied" as const, appliedAt: new Date().toISOString() }
          : s
      )
    );
  };

  const rejectSuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };

    return (
      <Badge variant="outline" className={styles[priority as keyof typeof styles]}>
        {priority}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      optimization: TrendingUp,
      security: AlertCircle,
      maintenance: Clock,
      compliance: FileText,
      efficiency: Zap
    };

    const Icon = icons[category as keyof typeof icons] || Lightbulb;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Suggestions Dashboard
          </h1>
          <p className="text-muted-foreground">
            PATCH 648 - Proactive intelligence and automated recommendations
          </p>
        </div>
        <Button onClick={loadSuggestions} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {/* Suggestions List */}
        <TabsContent value={filter} className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Suggestions ({filteredSuggestions.length})
              </CardTitle>
              <CardDescription>
                AI-powered recommendations for system optimization and automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(suggestion.category)}
                              <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                              {getPriorityBadge(suggestion.priority)}
                              <Badge variant="outline" className="text-xs">
                                {suggestion.module}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-500/10 text-purple-500"
                              >
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Impact: {suggestion.impact}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(suggestion.createdAt).toLocaleString()}
                              </span>
                              {suggestion.appliedAt && (
                                <span className="flex items-center gap-1 text-green-500">
                                  <CheckCircle className="h-3 w-3" />
                                  Applied: {new Date(suggestion.appliedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {suggestion.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleapplySuggestion}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlerejectSuggestion}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {suggestion.status === "applied" && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Applied
                            </Badge>
                          )}

                          {suggestion.status === "rejected" && (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-500">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}

                          {suggestion.status === "in_progress" && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Action Plan Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Plan Export
          </CardTitle>
          <CardDescription>
            Generate comprehensive action plan based on current suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export to Markdown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISuggestionsDashboard;
