/**
 * PATCH 602 - Epic Board Dashboard
 * Administrative panel for tracking patches and development progress
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  Clock,
  Download,
  FileCode,
  GitBranch,
  Layers,
  ListTodo,
  Package,
  Play,
  XCircle,
} from "lucide-react";

interface Epic {
  id: string;
  name: string;
  description: string;
  status: "todo" | "in_progress" | "testing" | "completed";
  patches: Patch[];
  start_date: string;
  target_date: string;
  owner: string;
}

interface Patch {
  id: string;
  number: string;
  name: string;
  description: string;
  status: "todo" | "in_progress" | "testing" | "completed" | "blocked";
  progress: number;
  modules: string[];
  dependencies: string[];
  validation_status: "pending" | "passed" | "failed";
}

export default function EpicsBoard() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // PATCH data from 597-601 and upcoming 602-606
  const epics: Epic[] = [
    {
      id: "epic-001",
      name: "Maritime Operations Core",
      description: "Core maritime operations modules including scheduling, training, drills, risk management, and reporting",
      status: "completed",
      start_date: "2025-10-01",
      target_date: "2025-11-30",
      owner: "Maritime Team",
      patches: [
        {
          id: "patch-597",
          number: "PATCH 597",
          name: "Smart Scheduler",
          description: "AI-powered task scheduling with compliance integration",
          status: "completed",
          progress: 100,
          modules: ["smart-scheduler", "llm-task-engine", "calendar"],
          dependencies: ["supabase", "psc", "mlc", "ovid", "lsa-ffa"],
          validation_status: "passed",
        },
        {
          id: "patch-598",
          number: "PATCH 598",
          name: "AI Training Module",
          description: "Intelligent training system with adaptive learning",
          status: "completed",
          progress: 100,
          modules: ["training", "ai-assistant", "adaptive-learning"],
          dependencies: ["supabase", "crew-management", "compliance-hub"],
          validation_status: "passed",
        },
        {
          id: "patch-599",
          number: "PATCH 599",
          name: "Smart Drills",
          description: "Drill planning, execution, and performance analysis",
          status: "completed",
          progress: 100,
          modules: ["drills", "drill-planner", "performance-analyzer"],
          dependencies: ["supabase", "emergency-response", "training"],
          validation_status: "passed",
        },
        {
          id: "patch-600",
          number: "PATCH 600",
          name: "Risk Operations",
          description: "Advanced risk assessment and mitigation system",
          status: "completed",
          progress: 100,
          modules: ["risk-operations", "risk-calculator", "predictive-ai"],
          dependencies: ["supabase", "incidents", "compliance-hub"],
          validation_status: "passed",
        },
        {
          id: "patch-601",
          number: "PATCH 601",
          name: "Reporting Engine",
          description: "Comprehensive reporting with AI insights",
          status: "completed",
          progress: 100,
          modules: ["reporting", "report-builder", "ai-insights"],
          dependencies: ["supabase", "analytics", "fleet-manager"],
          validation_status: "passed",
        },
      ],
    },
    {
      id: "epic-002",
      name: "Documentation & Testing Infrastructure",
      description: "Technical documentation, automated testing, and progress tracking",
      status: "in_progress",
      start_date: "2025-11-01",
      target_date: "2025-12-15",
      owner: "Quality Team",
      patches: [
        {
          id: "patch-602",
          number: "PATCH 602",
          name: "Documentation & Tests",
          description: "Module documentation, E2E tests, unit tests, and epic tracking",
          status: "in_progress",
          progress: 75,
          modules: ["docs", "tests", "epic-board"],
          dependencies: ["patches-597-601"],
          validation_status: "pending",
        },
      ],
    },
    {
      id: "epic-003",
      name: "Advanced AI & Automation",
      description: "Enhanced AI capabilities and automation features",
      status: "todo",
      start_date: "2025-12-01",
      target_date: "2026-01-31",
      owner: "AI Team",
      patches: [
        {
          id: "patch-603",
          number: "PATCH 603",
          name: "Smart Calendar AI",
          description: "Dynamic scheduling with predictive AI",
          status: "todo",
          progress: 0,
          modules: ["smart-scheduler-ai", "fleet-availability", "failure-detection"],
          dependencies: ["patch-597", "supabase"],
          validation_status: "pending",
        },
      ],
    },
    {
      id: "epic-004",
      name: "Compliance & Auditing",
      description: "ISM audits, ESG monitoring, and remote audit capabilities",
      status: "todo",
      start_date: "2025-12-15",
      target_date: "2026-02-28",
      owner: "Compliance Team",
      patches: [
        {
          id: "patch-604",
          number: "PATCH 604",
          name: "ISM Audit Module",
          description: "Complete ISM audit system with AI integration",
          status: "todo",
          progress: 0,
          modules: ["ism-audits", "audit-findings", "corrective-actions"],
          dependencies: ["compliance-hub", "supabase"],
          validation_status: "pending",
        },
        {
          id: "patch-605",
          number: "PATCH 605",
          name: "ESG & EEXI Monitoring",
          description: "Environmental compliance tracking and reporting",
          status: "todo",
          progress: 0,
          modules: ["esg-dashboard", "emissions-tracking", "forecast-ai"],
          dependencies: ["supabase", "analytics"],
          validation_status: "pending",
        },
        {
          id: "patch-606",
          number: "PATCH 606",
          name: "Remote Audit with AI",
          description: "Remote auditing with evidence validation",
          status: "todo",
          progress: 0,
          modules: ["remote-audits", "evidence-uploader", "ocr-ai"],
          dependencies: ["supabase", "document-hub"],
          validation_status: "pending",
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "testing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      testing: "outline",
      todo: "outline",
      blocked: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getValidationBadge = (status: string) => {
    const colors = {
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status}
      </Badge>
    );
  };

  const exportProgressJSON = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      total_epics: epics.length,
      total_patches: epics.reduce((sum, epic) => sum + epic.patches.length, 0),
      completed_patches: epics.reduce(
        (sum, epic) =>
          sum + epic.patches.filter((p) => p.status === "completed").length,
        0
      ),
      epics: epics.map((epic) => ({
        ...epic,
        completion_percentage:
          (epic.patches.filter((p) => p.status === "completed").length /
            epic.patches.length) *
          100,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `epics-status-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const filteredEpics =
    selectedStatus === "all"
      ? epics
      : epics.filter((epic) => epic.status === selectedStatus);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Epics & Patches Board
          </h1>
          <p className="text-muted-foreground mt-2">
            Track development progress across all patches and epics
          </p>
        </div>
        <Button onClick={exportProgressJSON} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Epics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epics.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Patches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {epics.reduce((sum, epic) => sum + epic.patches.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {epics.reduce(
                (sum, epic) =>
                  sum + epic.patches.filter((p) => p.status === "completed").length,
                0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {epics.reduce(
                (sum, epic) =>
                  sum +
                  epic.patches.filter((p) => p.status === "in_progress").length,
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Epics List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {filteredEpics.map((epic) => (
            <Card key={epic.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(epic.status)}
                      {epic.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {epic.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(epic.status)}
                </div>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {epic.patches.length} patches
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    Owner: {epic.owner}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Target: {epic.target_date}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {epic.patches.map((patch) => (
                    <Card key={patch.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{patch.number}</Badge>
                              <span className="font-semibold">{patch.name}</span>
                              {getStatusBadge(patch.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {patch.description}
                            </p>
                          </div>
                          {getValidationBadge(patch.validation_status)}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{patch.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${patch.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Modules */}
                        <div className="mt-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Modules:
                            </span>
                            {patch.modules.map((module) => (
                              <Badge key={module} variant="secondary" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Dependencies */}
                        {patch.dependencies.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ListTodo className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Dependencies:
                              </span>
                              {patch.dependencies.map((dep) => (
                                <Badge key={dep} variant="outline" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
