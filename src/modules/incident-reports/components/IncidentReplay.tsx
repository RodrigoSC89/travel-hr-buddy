/**
import { useEffect, useState } from "react";;
 * PATCH 472 - Incident Replay Component
 * Timeline-based incident replay with AI analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle,
  Brain,
  Download,
  User,
  Calendar,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  incidentReplayService,
  type IncidentData,
  type TimelineEvent,
  type AIAnalysis,
} from "../services/incidentReplayService";
import { toast } from "sonner";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

interface IncidentReplayProps {
  incidentId: string;
  onClose?: () => void;
}

export const IncidentReplay: React.FC<IncidentReplayProps> = ({ incidentId, onClose }) => {
  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadIncidentData();
  }, [incidentId]);

  const loadIncidentData = async () => {
    setIsLoading(true);
    try {
      const [incidentData, timelineData] = await Promise.all([
        incidentReplayService.getIncident(incidentId),
        incidentReplayService.getIncidentTimeline(incidentId),
      ]);

      setIncident(incidentData);
      setTimeline(timelineData);

      if (incidentData) {
        performAnalysis(incidentData);
      }
    } catch (error) {
      console.error("Failed to load incident data:", error);
      toast.error("Falha ao carregar dados do incidente");
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async (incidentData: IncidentData) => {
    setIsAnalyzing(true);
    try {
      const analysisResult = await incidentReplayService.analyzeIncident(incidentData);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error("Failed to analyze incident:", error);
      toast.error("Falha na análise de IA");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playReplay = () => {
    setIsPlaying(true);
    setCurrentEventIndex(0);

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= timeline.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const exportToPDF = async () => {
    if (!incident || !analysis) return;

    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.text("Análise de Incidente - Replay com IA", 20, yPos);
      yPos += 10;

      // Incident details
      doc.setFontSize(12);
      doc.text(`Título: ${incident.title}`, 20, yPos);
      yPos += 7;
      doc.text(`Data: ${new Date(incident.incidentDate).toLocaleString()}`, 20, yPos);
      yPos += 7;
      doc.text(`Severidade: ${incident.severity.toUpperCase()}`, 20, yPos);
      yPos += 7;
      doc.text(`Status: ${incident.status}`, 20, yPos);
      yPos += 10;

      // Description
      doc.setFontSize(14);
      doc.text("Descrição:", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      const descLines = doc.splitTextToSize(incident.description, 170);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 10;

      // AI Analysis
      doc.setFontSize(14);
      doc.text("Análise de IA:", 20, yPos);
      yPos += 7;

      doc.setFontSize(12);
      doc.text("Causas Prováveis:", 20, yPos);
      yPos += 7;

      analysis.probableCauses.forEach((cause, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${cause.cause} (${cause.confidence}% confiança)`, 25, yPos);
        yPos += 5;
        const expLines = doc.splitTextToSize(cause.explanation, 165);
        doc.text(expLines, 30, yPos);
        yPos += expLines.length * 5 + 3;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      yPos += 5;
      doc.setFontSize(12);
      doc.text("Recomendações:", 20, yPos);
      yPos += 7;

      analysis.recommendations.forEach((rec, index) => {
        doc.setFontSize(10);
        const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
        doc.text(recLines, 25, yPos);
        yPos += recLines.length * 5 + 3;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      // Timeline
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }

      doc.setFontSize(14);
      doc.text("Timeline de Eventos:", 20, yPos);
      yPos += 7;

      timeline.slice(0, 10).forEach((event) => {
        doc.setFontSize(10);
        const eventTime = new Date(event.timestamp).toLocaleString();
        doc.text(`[${eventTime}] ${event.description}`, 25, yPos);
        yPos += 6;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      // Save PDF
      doc.save(`incident-replay-${incidentId}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Falha ao exportar PDF");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
    }
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
    case "creation":
      return <FileText className="w-4 h-4" />;
    case "comment":
      return <User className="w-4 h-4" />;
    case "status_change":
      return <TrendingUp className="w-4 h-4" />;
    case "resolution":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p>Carregando dados do incidente...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
        <p>Incidente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                {incident.title}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(incident.incidentDate).toLocaleString()}
                </span>
                {incident.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {incident.location}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getSeverityColor(incident.severity)}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{incident.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{incident.description}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={playReplay} disabled={isPlaying || timeline.length === 0}>
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? "Reproduzindo..." : "Reproduzir Timeline"}
            </Button>
            <Button onClick={exportToPDF} variant="outline" disabled={!analysis}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Timeline de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div
                    key={event.id}
                    className={`relative pl-8 pb-4 ${
                      index <= currentEventIndex ? "opacity-100" : "opacity-30"
                    } transition-opacity duration-500`}
                  >
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-3 top-6 w-0.5 h-full bg-border"></div>
                    )}

                    {/* Event icon */}
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event content */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{event.description}</p>
                      <p className="text-xs text-muted-foreground">por {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Análise de IA
              {isAnalyzing && <Clock className="w-4 h-4 animate-spin ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Analisando incidente...</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {/* Risk Score */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Score de Risco</span>
                      <span className="text-2xl font-bold">{analysis.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${analysis.riskScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Probable Causes */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Causas Prováveis ({analysis.probableCauses.length})
                    </h3>
                    <div className="space-y-3">
                      {analysis.probableCauses.map((cause, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{cause.cause}</h4>
                            <Badge variant="outline">{cause.confidence}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {cause.explanation}
                          </p>
                          <div className="space-y-1">
                            {cause.supportingData.map((data, idx) => (
                              <div key={idx} className="text-xs flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                                <span>{data}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Recomendações ({analysis.recommendations.length})
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentReplay;
