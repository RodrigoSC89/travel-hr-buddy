/**
 * PATCH 426 - Mission Logs Component
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Info,
  AlertTriangle,
  XCircle,
  AlertCircle,
  CheckCircle,
  Filter
} from "lucide-react";
import type { MissionLog } from "../types";

interface MissionLogsProps {
  logs: MissionLog[];
  onRefresh: () => void;
}

export const MissionLogs: React.FC<MissionLogsProps> = ({ logs, onRefresh }) => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getLogIcon = (type: string) => {
    switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "critical":
      return <AlertCircle className="h-4 w-4 text-red-700" />;
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-500";
    case "high":
      return "bg-orange-500/10 text-orange-500";
    case "medium":
      return "bg-yellow-500/10 text-yellow-500";
    case "low":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = selectedType === "all" || log.logType === selectedType;
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    const matchesSearch = searchTerm === "" || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSeverity && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mission Logs</CardTitle>
            <CardDescription>Detailed mission event history</CardDescription>
          </div>
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No logs found
            </p>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="p-4 border rounded hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getLogIcon(log.logType)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium">{log.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.eventTimestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{log.category}</span>
                      <span>•</span>
                      <span>{log.sourceModule}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
