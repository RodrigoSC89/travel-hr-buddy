/**
 * Labs & Experimental Modules Status
 * PATCH 545 - Evaluation of experimental features
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  Cpu,
  Blocks,
  Gamepad2,
  Glasses,
  Mic,
  Activity,
  XCircle
} from "lucide-react";

interface ExperimentalModule {
  name: string;
  path: string;
  icon: React.ReactNode;
  status: "ready" | "beta" | "incomplete" | "disabled";
  tests: {
    coreLogic: boolean;
    supabase: boolean;
    ui: boolean;
    aiIntegration: boolean;
  };
  recommendation: "promote" | "keep-beta" | "disable";
  description: string;
  lastUpdated: string;
}

export default function LabsStatus() {
  const modules: ExperimentalModule[] = [
    {
      name: "Coordination AI",
      path: "/coordination-ai",
      icon: <Activity className="h-5 w-5" />,
      status: "ready",
      tests: {
        coreLogic: true,
        supabase: true,
        ui: true,
        aiIntegration: true
      },
      recommendation: "promote",
      description: "Multi-level coordination engine with AI agents",
      lastUpdated: "2025-10-29"
    },
    {
      name: "Edge AI Core",
      path: "/edge-ai",
      icon: <Cpu className="h-5 w-5" />,
      status: "beta",
      tests: {
        coreLogic: true,
        supabase: true,
        ui: true,
        aiIntegration: false
      },
      recommendation: "keep-beta",
      description: "On-device AI processing with WebGPU",
      lastUpdated: "2025-10-25"
    },
    {
      name: "Gamification",
      path: "/gamification",
      icon: <Gamepad2 className="h-5 w-5" />,
      status: "beta",
      tests: {
        coreLogic: true,
        supabase: false,
        ui: true,
        aiIntegration: false
      },
      recommendation: "keep-beta",
      description: "Crew engagement through gamification",
      lastUpdated: "2025-10-20"
    },
    {
      name: "AR (Augmented Reality)",
      path: "/ar",
      icon: <Glasses className="h-5 w-5" />,
      status: "incomplete",
      tests: {
        coreLogic: true,
        supabase: false,
        ui: false,
        aiIntegration: false
      },
      recommendation: "disable",
      description: "Augmented reality for maintenance",
      lastUpdated: "2025-09-15"
    },
    {
      name: "Blockchain",
      path: "/blockchain",
      icon: <Blocks className="h-5 w-5" />,
      status: "incomplete",
      tests: {
        coreLogic: false,
        supabase: false,
        ui: true,
        aiIntegration: false
      },
      recommendation: "disable",
      description: "Blockchain-based audit trail",
      lastUpdated: "2025-08-30"
    },
    {
      name: "Voice Assistant Advanced",
      path: "/voice",
      icon: <Mic className="h-5 w-5" />,
      status: "beta",
      tests: {
        coreLogic: true,
        supabase: true,
        ui: true,
        aiIntegration: true
      },
      recommendation: "keep-beta",
      description: "Advanced voice commands with AI",
      lastUpdated: "2025-10-28"
    },
    {
      name: "Drone Commander",
      path: "/drone-commander",
      icon: <Activity className="h-5 w-5" />,
      status: "incomplete",
      tests: {
        coreLogic: false,
        supabase: false,
        ui: true,
        aiIntegration: false
      },
      recommendation: "disable",
      description: "Drone operations management",
      lastUpdated: "2025-07-10"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "ready":
      return <Badge variant="default">Ready</Badge>;
    case "beta":
      return <Badge variant="secondary">Beta</Badge>;
    case "incomplete":
      return <Badge variant="destructive">Incomplete</Badge>;
    case "disabled":
      return <Badge variant="outline">Disabled</Badge>;
    default:
      return null;
    }
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
    case "promote":
      return <Badge variant="default" className="bg-green-600">Promote to Production</Badge>;
    case "keep-beta":
      return <Badge variant="secondary">Keep as Beta</Badge>;
    case "disable":
      return <Badge variant="destructive">Disable</Badge>;
    default:
      return null;
    }
  };

  const stats = {
    total: modules.length,
    ready: modules.filter(m => m.status === "ready").length,
    beta: modules.filter(m => m.status === "beta").length,
    incomplete: modules.filter(m => m.status === "incomplete").length,
    promoteRecommended: modules.filter(m => m.recommendation === "promote").length,
    disableRecommended: modules.filter(m => m.recommendation === "disable").length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Beaker className="h-8 w-8" />
            Labs & Experimental Modules
          </h1>
          <p className="text-muted-foreground mt-1">
            PATCH 545 - Status and evaluation of experimental features
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.beta}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Incomplete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.incomplete}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Promote Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.promoteRecommended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Summary */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Recommendation Summary</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-1">
            <p>• <strong>{stats.promoteRecommended}</strong> modules ready for production</p>
            <p>• <strong>{stats.beta}</strong> modules should remain in beta</p>
            <p>• <strong>{stats.disableRecommended}</strong> modules recommended for disabling</p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {module.icon}
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(module.status)}
                  {getRecommendationBadge(module.recommendation)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Test Results */}
                <div>
                  <p className="text-sm font-semibold mb-2">Test Results:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      {module.tests.coreLogic ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Core Logic</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {module.tests.supabase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Supabase</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {module.tests.ui ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>UI/UX</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {module.tests.aiIntegration ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>AI Integration</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Last Updated: {module.lastUpdated}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <a href={module.path}>View Module</a>
                  </Button>
                  {module.recommendation === "promote" && (
                    <Button size="sm" variant="default">
                      Promote
                    </Button>
                  )}
                  {module.recommendation === "disable" && (
                    <Button size="sm" variant="destructive">
                      Disable
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
