// PATCH: Removed @ts-nocheck - using ai_decisions + ai_insights tables instead of missing ai_strategies
/**
 * Executive Summary Generator AI
 * Generate executive summaries of AI decisions and predictions
 * 
 * Features:
 * - Consolidation of tactical and strategic decisions
 * - Natural language summary generation
 * - PDF and JSON export
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Brain,
  FileJson,
  Loader2
} from "lucide-react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import type { Strategy, StrategyProposal } from "@/ai/strategy/predictive-engine";
import type { SimulationResult } from "@/ai/decision-simulator";
import type { GovernanceEvaluation } from "@/ai/governance/neural-governance";
import type { ConsensusResult } from "@/ai/agents/consensus-builder";

export interface ExecutiveSummaryData {
  id: string;
  missionId?: string;
  period: {
    from: Date;
    to: Date;
  };
  strategies: Strategy[];
  proposals: StrategyProposal[];
  simulations: SimulationResult[];
  governanceEvaluations: GovernanceEvaluation[];
  consensusResults: ConsensusResult[];
  summary: {
    totalStrategies: number;
    approvedStrategies: number;
    rejectedStrategies: number;
    pendingStrategies: number;
    avgSuccessProbability: number;
    avgRiskLevel: number;
    totalEstimatedCost: number;
    criticalDecisions: number;
  };
  insights: string[];
  recommendations: string[];
  keyMetrics: Record<string, any>;
  generatedAt: Date;
}

interface ExecutiveSummaryGeneratorProps {
  missionId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const ExecutiveSummaryGenerator: React.FC<ExecutiveSummaryGeneratorProps> = ({
  missionId,
  startDate,
  endDate
}) => {
  const [summaryData, setSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);

    try {
      logger.info("[ExecutiveSummary] Generating executive summary", { missionId });

      // Fetch data from various AI modules
      const strategies = await fetchStrategies(missionId, startDate, endDate);
      const proposals = await fetchProposals(missionId, startDate, endDate);
      const simulations = await fetchSimulations(missionId, startDate, endDate);
      const governanceEvals = await fetchGovernanceEvaluations(missionId, startDate, endDate);
      const consensusResults = await fetchConsensusResults(missionId, startDate, endDate);

      // Generate summary statistics
      const summary = generateSummaryStatistics(
        strategies,
        governanceEvals,
        consensusResults
      );

      // Generate natural language insights
      const insights = await generateNaturalLanguageInsights(
        strategies,
        simulations,
        governanceEvals,
        consensusResults
      );

      // Generate recommendations
      const recommendations = generateRecommendations(
        strategies,
        simulations,
        governanceEvals,
        consensusResults
      );

      // Calculate key metrics
      const keyMetrics = calculateKeyMetrics(
        strategies,
        simulations,
        consensusResults
      );

      const summaryData: ExecutiveSummaryData = {
        id: `exec_summary_${Date.now()}`,
        missionId,
        period: {
          from: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: endDate || new Date()
        },
        strategies,
        proposals,
        simulations,
        governanceEvaluations: governanceEvals,
        consensusResults,
        summary,
        insights,
        recommendations,
        keyMetrics,
        generatedAt: new Date()
      };

      setSummaryData(summaryData);

      // Save to database
      await saveSummaryToDatabase(summaryData);

      logger.info("[ExecutiveSummary] Summary generated successfully");
    } catch (error) {
      logger.error("[ExecutiveSummary] Failed to generate summary", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!summaryData) return;

    setIsExporting(true);

    try {
      logger.info("[ExecutiveSummary] Exporting to PDF", { summaryId: summaryData.id });

      // Dynamic import to avoid loading jspdf unless needed
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      let yPosition = 20;
      const lineHeight = 10;
      const pageHeight = doc.internal.pageSize.height;

      // Title
      doc.setFontSize(20);
      doc.text("Executive Summary - AI Strategic Decisions", 20, yPosition);
      yPosition += lineHeight * 2;

      // Period
      doc.setFontSize(12);
      doc.text(
        `Period: ${summaryData.period.from.toLocaleDateString()} - ${summaryData.period.to.toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += lineHeight;

      if (summaryData.missionId) {
        doc.text(`Mission: ${summaryData.missionId}`, 20, yPosition);
        yPosition += lineHeight;
      }

      yPosition += lineHeight;

      // Summary Statistics
      doc.setFontSize(16);
      doc.text("Summary Statistics", 20, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(11);
      doc.text(`Total Strategies: ${summaryData.summary.totalStrategies}`, 30, yPosition);
      yPosition += lineHeight * 0.8;
      doc.text(`Approved: ${summaryData.summary.approvedStrategies}`, 30, yPosition);
      yPosition += lineHeight * 0.8;
      doc.text(`Rejected: ${summaryData.summary.rejectedStrategies}`, 30, yPosition);
      yPosition += lineHeight * 0.8;
      doc.text(`Pending: ${summaryData.summary.pendingStrategies}`, 30, yPosition);
      yPosition += lineHeight * 0.8;
      doc.text(
        `Avg Success Probability: ${(summaryData.summary.avgSuccessProbability * 100).toFixed(1)}%`,
        30,
        yPosition
      );
      yPosition += lineHeight * 0.8;
      doc.text(`Avg Risk Level: ${summaryData.summary.avgRiskLevel.toFixed(1)}`, 30, yPosition);
      yPosition += lineHeight * 0.8;
      doc.text(
        `Total Est. Cost: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(summaryData.summary.totalEstimatedCost)}`,
        30,
        yPosition
      );
      yPosition += lineHeight * 1.5;

      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Key Insights
      doc.setFontSize(16);
      doc.text("Key Insights", 20, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      for (const insight of summaryData.insights.slice(0, 5)) {
        const lines = doc.splitTextToSize(insight, 170);
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${line}`, 30, yPosition);
          yPosition += lineHeight * 0.7;
        }
        yPosition += 2;
      }

      yPosition += lineHeight;

      // Recommendations
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text("Recommendations", 20, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      for (const rec of summaryData.recommendations.slice(0, 5)) {
        const lines = doc.splitTextToSize(rec, 170);
        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${line}`, 30, yPosition);
          yPosition += lineHeight * 0.7;
        }
        yPosition += 2;
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Generated: ${summaryData.generatedAt.toLocaleString()} | Page ${i} of ${pageCount}`,
          20,
          pageHeight - 10
        );
      }

      // Save PDF
      const filename = `executive_summary_${summaryData.id}_${Date.now()}.pdf`;
      doc.save(filename);

      logger.info("[ExecutiveSummary] PDF exported successfully", { filename });
    } catch (error) {
      logger.error("[ExecutiveSummary] Failed to export PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!summaryData) return;

    try {
      logger.info("[ExecutiveSummary] Exporting to JSON", { summaryId: summaryData.id });

      const jsonString = JSON.stringify(summaryData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `executive_summary_${summaryData.id}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info("[ExecutiveSummary] JSON exported successfully");
    } catch (error) {
      logger.error("[ExecutiveSummary] Failed to export JSON", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <span>Executive Summary Generator</span>
              </CardTitle>
              <CardDescription>
                AI-powered executive summary of strategic decisions and predictions
              </CardDescription>
            </div>
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Summary</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Content */}
      {summaryData && (
        <>
          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Export to PDF</span>
                </Button>
                <Button
                  onClick={exportToJSON}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Export to JSON</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Overview</CardTitle>
              <CardDescription>
                Period: {summaryData.period.from.toLocaleDateString()} -{" "}
                {summaryData.period.to.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold">{summaryData.summary.approvedStrategies}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold">{summaryData.summary.rejectedStrategies}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{summaryData.summary.pendingStrategies}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {(summaryData.summary.avgSuccessProbability * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights and Recommendations */}
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>
                    Natural language analysis of strategic decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summaryData.insights.map((insight, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex items-start space-x-2">
                          <span className="font-semibold text-blue-600">{index + 1}.</span>
                          <span>{insight}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                  <CardDescription>
                    AI-powered recommendations for future decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summaryData.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(summaryData.keyMetrics).map(([key, value]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <p className="text-sm text-gray-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-xl font-semibold mt-1">
                          {typeof value === "number" ? value.toFixed(2) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Detailed Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Details</CardTitle>
              <CardDescription>
                {summaryData.strategies.length} strategies analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.strategies.slice(0, 5).map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{strategy.name}</h4>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                      <Badge variant="outline">{strategy.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-gray-500">Success: </span>
                        <span className="font-semibold">
                          {(strategy.successProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Risk: </span>
                        <span className="font-semibold">{strategy.estimatedImpact.risk}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time: </span>
                        <span className="font-semibold">{strategy.estimatedImpact.time}h</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost: </span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format(strategy.estimatedImpact.cost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {summaryData.strategies.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... and {summaryData.strategies.length - 5} more strategies
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

async function fetchStrategies(
  _missionId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<Strategy[]> {
  try {
    let query = supabase.from("ai_decisions").select("*");
    if (startDate) query = query.gte("created_at", startDate.toISOString());
    if (endDate) query = query.lte("created_at", endDate.toISOString());
    const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map((d) => ({
      id: d.id, name: d.title, description: d.description,
      type: d.type || "reactive",
      successProbability: d.confidence / 100, confidenceScore: d.confidence,
      estimatedImpact: { risk: d.impact === "critical" ? 90 : d.impact === "high" ? 70 : 50, time: 0, cost: 0 },
      actions: [], dependencies: [], prerequisites: [], signals: [],
      createdAt: new Date(d.created_at), generatedAt: new Date(d.created_at),
    })) as unknown as Strategy[];
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to fetch strategies", error);
    return [];
  }
}

async function fetchProposals(
  _missionId?: string, startDate?: Date, endDate?: Date
): Promise<StrategyProposal[]> {
  try {
    let query = supabase.from("ai_insights").select("*");
    if (startDate) query = query.gte("created_at", startDate.toISOString());
    if (endDate) query = query.lte("created_at", endDate.toISOString());
    const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map((d) => ({
      id: d.id, strategies: [], topStrategy: null,
      analysisContext: d.description, proposedAt: new Date(d.created_at),
    })) as unknown as StrategyProposal[];
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to fetch proposals", error);
    return [];
  }
}

async function fetchSimulations(
  _missionId?: string, startDate?: Date, endDate?: Date
): Promise<SimulationResult[]> {
  try {
    let query = supabase.from("ai_audit_logs").select("*");
    if (startDate) query = query.gte("created_at", startDate.toISOString());
    if (endDate) query = query.lte("created_at", endDate.toISOString());
    const { data, error } = await query.order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return (data || []).map((d) => ({
      id: d.id, strategyId: "", strategy: null, parameters: {},
      scenarios: [], status: "completed",
      confidenceLevel: d.confidence_score || 0,
      result: d.ai_response || "", createdAt: new Date(d.created_at || new Date()),
      completedAt: new Date(d.created_at || new Date()), metrics: {}, risks: [],
    })) as unknown as SimulationResult[];
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to fetch simulations", error);
    return [];
  }
}

async function fetchGovernanceEvaluations(
  _missionId?: string, startDate?: Date, endDate?: Date
): Promise<GovernanceEvaluation[]> {
  try {
    let query = supabase.from("ai_decisions").select("*");
    if (startDate) query = query.gte("created_at", startDate.toISOString());
    if (endDate) query = query.lte("created_at", endDate.toISOString());
    const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data || []).map((d) => ({
      id: d.id,
      decision: d.status === "approved" ? "approved" : d.status === "rejected" ? "vetoed" : "escalated",
      riskCategory: d.impact === "critical" ? "critical" : "medium",
      approvalRequired: d.status === "pending",
      approvedBy: d.created_by || undefined,
    })) as unknown as GovernanceEvaluation[];
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to fetch governance evaluations", error);
    return [];
  }
}

async function fetchConsensusResults(
  _missionId?: string, startDate?: Date, endDate?: Date
): Promise<ConsensusResult[]> {
  try {
    let query = supabase.from("ai_feedback_scores").select("*");
    if (startDate) query = query.gte("created_at", startDate.toISOString());
    if (endDate) query = query.lte("created_at", endDate.toISOString());
    const { data, error } = await query.order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return (data || []).map((d) => ({
      id: d.id, strategyId: "", strategy: null, status: "completed",
      participatingAgents: [], consensusScore: d.self_score * 10,
      disagreements: [], finalDecision: null, votingRounds: [],
      completedAt: new Date(d.created_at), reasoning: "", metadata: {},
    })) as unknown as ConsensusResult[];
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to fetch consensus results", error);
    return [];
  }
}

function generateSummaryStatistics(
  strategies: Strategy[],
  governanceEvals: GovernanceEvaluation[],
  _consensusResults: ConsensusResult[]
) {
  const g = governanceEvals as unknown as AnyRecord[];
  return {
    totalStrategies: strategies.length,
    approvedStrategies: g.filter((e) => e.decision === "approved").length,
    rejectedStrategies: g.filter((e) => e.decision === "vetoed").length,
    pendingStrategies: g.filter((e) => e.decision === "escalated" || e.approvalRequired).length,
    avgSuccessProbability: strategies.length > 0 ? strategies.reduce((s, x) => s + x.successProbability, 0) / strategies.length : 0,
    avgRiskLevel: strategies.length > 0 ? strategies.reduce((s, x) => s + x.estimatedImpact.risk, 0) / strategies.length : 0,
    totalEstimatedCost: strategies.reduce((s, x) => s + (x.estimatedImpact.cost || 0), 0),
    criticalDecisions: g.filter((e) => e.riskCategory === "critical").length,
  };
}

async function generateNaturalLanguageInsights(
  strategies: Strategy[], simulations: SimulationResult[],
  governanceEvals: GovernanceEvaluation[], consensusResults: ConsensusResult[]
): Promise<string[]> {
  const insights: string[] = [];
  const g = governanceEvals as unknown as AnyRecord[];
  const c = consensusResults as unknown as AnyRecord[];
  const sim = simulations as unknown as AnyRecord[];

  if (strategies.length > 0) {
    const prev = strategies.filter((s) => s.type === "preventive").length;
    const react = strategies.filter((s) => s.type === "reactive").length;
    if (prev > react * 2) insights.push(`Preventive focus: ${prev} vs ${react} reactive.`);
    const high = strategies.filter((s) => s.successProbability > 0.8).length;
    if (high > strategies.length * 0.5) insights.push(`${high} strategies with >80% success rate.`);
  }
  const vetoed = g.filter((e) => e.decision === "vetoed").length;
  if (vetoed > 0) insights.push(`Governance vetoed ${vetoed} strategies.`);
  if (c.length > 0) {
    const avg = c.reduce((s, x) => s + (x.consensusScore || 0), 0) / c.length;
    if (avg > 80) insights.push(`High consensus score (${avg.toFixed(1)}).`);
  }
  const completed = sim.filter((s) => s.status === "completed").length;
  if (completed > 0) insights.push(`${completed} simulations completed.`);
  return insights;
}

function generateRecommendations(
  strategies: Strategy[], simulations: SimulationResult[],
  governanceEvals: GovernanceEvaluation[], _consensusResults: ConsensusResult[]
): string[] {
  const r: string[] = [];
  const g = governanceEvals as unknown as AnyRecord[];
  const sim = simulations as unknown as AnyRecord[];
  const highRisk = strategies.filter((s) => s.estimatedImpact.risk > 70).length;
  if (highRisk > 0) r.push(`Review ${highRisk} high-risk strategies.`);
  const pending = g.filter((e) => e.approvalRequired).length;
  if (pending > 0) r.push(`${pending} strategies pending approval.`);
  const lowConf = sim.filter((s) => (s.confidenceLevel || 0) < 50).length;
  if (lowConf > 0) r.push(`${lowConf} simulations show low confidence.`);
  if (strategies.length > 0) r.push("Continue monitoring and gather feedback.");
  return r;
}

function calculateKeyMetrics(
  strategies: Strategy[], simulations: SimulationResult[], consensusResults: ConsensusResult[]
): Record<string, number> {
  const sim = simulations as unknown as AnyRecord[];
  const c = consensusResults as unknown as AnyRecord[];
  const done = sim.filter((s) => s.status === "completed");
  return {
    total_strategies: strategies.length,
    avg_confidence_score: strategies.length > 0 ? strategies.reduce((s, x) => s + x.confidenceScore, 0) / strategies.length : 0,
    avg_consensus_score: c.length > 0 ? c.reduce((s, x) => s + (x.consensusScore || 0), 0) / c.length : 0,
    total_simulations: simulations.length,
    completed_simulations: done.length,
    avg_simulation_confidence: done.length > 0 ? done.reduce((s, x) => s + (x.confidenceLevel || 0), 0) / done.length : 0,
  };
}

async function saveSummaryToDatabase(summaryData: ExecutiveSummaryData): Promise<void> {
  try {
    await supabase.from("ai_insights").insert({
      title: `Executive Summary - ${summaryData.id}`,
      description: `${summaryData.summary.totalStrategies} strategies, ${summaryData.summary.approvedStrategies} approved`,
      category: "executive_summary",
      confidence: summaryData.summary.avgSuccessProbability * 100,
      priority: "high",
      actionable: true,
      status: "active",
      user_id: (await supabase.auth.getUser()).data.user?.id || "",
      metadata: {
        summary_id: summaryData.id,
        mission_id: summaryData.missionId,
        insights: summaryData.insights,
        recommendations: summaryData.recommendations,
        key_metrics: summaryData.keyMetrics,
      },
    });
    logger.info("[ExecutiveSummary] Summary saved", { summaryId: summaryData.id });
  } catch (error) {
    logger.error("[ExecutiveSummary] Failed to save summary", error);
  }
}
