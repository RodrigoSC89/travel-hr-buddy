import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Calendar, Ship, MapPin, AlertTriangle } from "lucide-react";

interface DPIncident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  root_cause: string;
  class_dp: string;
  source: string;
  link: string;
  summary: string;
  tags: string[];
}

interface IncidentCardsProps {
  incidents: DPIncident[];
  onAnalyzeClick: (incident: DPIncident) => void;
  onViewReport: (incident: DPIncident) => void;
}

export const IncidentCards: React.FC<IncidentCardsProps> = ({
  incidents,
  onAnalyzeClick,
  onViewReport,
}) => {
  const getClassColor = (classDP: string) => {
    switch (classDP) {
    case "DP-1":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "DP-2":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "DP-3":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      "drive-off": "bg-red-50 text-red-700 border-red-200",
      "thruster-failure": "bg-orange-50 text-orange-700 border-orange-200",
      "blackout": "bg-purple-50 text-purple-700 border-purple-200",
      "position-reference": "bg-blue-50 text-blue-700 border-blue-200",
      "human-error": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "software": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "sensor-failure": "bg-pink-50 text-pink-700 border-pink-200",
      "weather": "bg-cyan-50 text-cyan-700 border-cyan-200",
      "fmea": "bg-green-50 text-green-700 border-green-200",
    };

    for (const [key, value] of Object.entries(colors)) {
      if (tag.includes(key)) return value;
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {incidents.map((incident) => (
        <Card
          key={incident.id}
          className="hover:shadow-lg transition-all duration-200 border-2"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge
                variant="outline"
                className={`${getClassColor(incident.class_dp)} font-semibold`}
              >
                {incident.class_dp}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {incident.source}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>{incident.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(incident.date)}</span>
              </div>
              {incident.vessel && (
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  <span className="font-medium">{incident.vessel}</span>
                </div>
              )}
              {incident.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{incident.location}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            <CardDescription className="text-sm line-clamp-3">
              {incident.summary}
            </CardDescription>

            {/* Root Cause */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <p className="text-xs font-semibold text-amber-900 mb-1">Causa Raiz:</p>
              <p className="text-xs text-amber-800">{incident.root_cause}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {incident.tags?.slice(0, 4).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`text-xs ${getTagColor(tag)}`}
                >
                  {tag}
                </Badge>
              ))}
              {incident.tags?.length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                  +{incident.tags.length - 4}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onViewReport(incident)}
              >
                <FileText className="h-3 w-3 mr-1" />
                Ver Relatório
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onAnalyzeClick(incident)}
              >
                <Brain className="h-3 w-3 mr-1" />
                Analisar com IA
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
