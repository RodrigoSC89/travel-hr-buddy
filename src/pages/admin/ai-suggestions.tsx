/**
 * PATCH 648 - AI Suggestions Dashboard
 * Proactive AI insights and automation recommendations
 * PATCH 649 - Migrated from mock data to real Supabase data
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
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
    
    try {
      // Fetch real AI suggestions from Supabase
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // If table doesn't exist or RLS blocks, use empty array
        console.warn("Could not fetch AI suggestions:", error.message);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mappedSuggestions: AISuggestion[] = data.map((item) => ({
          id: item.id,
          title: item.suggestion_text?.substring(0, 50) || "Sugestão IA",
          description: item.suggestion_text || item.issue_description || "",
          category: (item.suggestion_type as AISuggestion["category"]) || "optimization",
          priority: (item.severity as AISuggestion["priority"]) || "medium",
          status: (item.status as AISuggestion["status"]) || "pending",
          impact: item.expected_impact || "Melhoria do sistema",
          module: item.module_name || "system",
          createdAt: item.created_at || new Date().toISOString(),
          appliedAt: item.applied_at || undefined,
          confidence: item.confidence || 0.85
        }));
        setSuggestions(mappedSuggestions);
      } else {
        // No suggestions found - show empty state
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error loading AI suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

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
      critical: "bg-destructive/10 text-destructive border-destructive/20",
      high: "bg-warning/10 text-warning border-warning/20",
      medium: "bg-warning/10 text-warning/80 border-warning/20",
      low: "bg-primary/10 text-primary border-primary/20"
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
            <CardTitle className="text-sm font-medium text-warning">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-info">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success">Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
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
                                className="text-xs bg-secondary/10 text-secondary"
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
                                <span className="flex items-center gap-1 text-success">
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
                                onClick={() => applySuggestion(suggestion.id)}
                                className="bg-success hover:bg-success/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Apply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectSuggestion(suggestion.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {suggestion.status === "applied" && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Applied
                            </Badge>
                          )}

                          {suggestion.status === "rejected" && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}

                          {suggestion.status === "in_progress" && (
                            <Badge variant="outline" className="bg-info/10 text-info">
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
