/**
 * Admin Control Center
 * PATCH 541 - Centralized hub for all admin tools & validations
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Code,
  Database,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  TestTube,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { autoValidator } from "@/lib/validation/auto-validator";

export default function ControlCenter() {
  const [healthStatus, setHealthStatus] = useState<{
    healthy: boolean;
    message: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      const result = await autoValidator.quickHealthCheck();
      setHealthStatus(result);
    } catch (error) {
      setHealthStatus({
        healthy: false,
        message: 'Health check failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const toolCategories = [
    {
      title: "Performance & Validation",
      icon: <Zap className="h-5 w-5" />,
      description: "System performance monitoring & validation tools",
      tools: [
        {
          name: "CPU Benchmark",
          path: "/admin/benchmark",
          icon: <Activity className="h-4 w-4" />,
          description: "Run performance benchmarks",
          badge: "PATCH 541"
        },
        {
          name: "System Health",
          path: "/admin/health-validation",
          icon: <Shield className="h-4 w-4" />,
          description: "Automated system validation",
          badge: "PATCH 541"
        },
        {
          name: "Code Quality",
          path: "/admin/code-health",
          icon: <Code className="h-4 w-4" />,
          description: "Technical debt analysis",
          badge: "PATCH 541"
        },
        {
          name: "Virtualized Logs",
          path: "/logs-center-virtual",
          icon: <FileText className="h-4 w-4" />,
          description: "High-performance log viewer",
          badge: "98% faster"
        },
        {
          name: "Image Optimization",
          path: "/admin/image-optimization",
          icon: <Activity className="h-4 w-4" />,
          description: "WebP/AVIF & CDN optimization",
          badge: "PATCH 542"
        }
      ]
    },
    {
      title: "PATCHES 506-510",
      icon: <Layers className="h-5 w-5" />,
      description: "Admin interfaces for core system patches",
      tools: [
        {
          name: "AI Memory",
          path: "/admin/patches-506-510/ai-memory",
          icon: <Database className="h-4 w-4" />,
          description: "AI memory events & embeddings",
          badge: "PATCH 506"
        },
        {
          name: "Backups",
          path: "/admin/patches-506-510/backups",
          icon: <Database className="h-4 w-4" />,
          description: "System backup management",
          badge: "PATCH 507"
        },
        {
          name: "RLS Audit",
          path: "/admin/patches-506-510/rls-audit",
          icon: <Lock className="h-4 w-4" />,
          description: "Row-level security logs",
          badge: "PATCH 508"
        },
        {
          name: "AI Feedback",
          path: "/admin/patches-506-510/ai-feedback",
          icon: <MessageSquare className="h-4 w-4" />,
          description: "AI feedback loop scores",
          badge: "PATCH 509"
        },
        {
          name: "Sessions",
          path: "/admin/patches-506-510/sessions",
          icon: <Users className="h-4 w-4" />,
          description: "Active session management",
          badge: "PATCH 510"
        },
        {
          name: "Validation",
          path: "/admin/patches-506-510/validation",
          icon: <CheckCircle className="h-4 w-4" />,
          description: "Patch validation dashboard",
          badge: "All Patches"
        }
      ]
    },
    {
      title: "System Monitoring",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "System status, analytics & reporting",
      tools: [
        {
          name: "Admin Dashboard",
          path: "/admin",
          icon: <Settings className="h-4 w-4" />,
          description: "Main admin interface",
          badge: "Core"
        },
        {
          name: "System Status",
          path: "/admin/system-status",
          icon: <Activity className="h-4 w-4" />,
          description: "Real-time system monitoring",
          badge: "Live"
        },
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: <TrendingUp className="h-4 w-4" />,
          description: "Usage analytics & metrics",
          badge: "Insights"
        }
      ]
    },
    {
      title: "Testing & QA",
      icon: <TestTube className="h-5 w-5" />,
      description: "Quality assurance & testing tools",
      tools: [
        {
          name: "Test Dashboard",
          path: "/admin/tests",
          icon: <TestTube className="h-4 w-4" />,
          description: "Test results & coverage",
          badge: "QA"
        },
        {
          name: "CI History",
          path: "/admin/ci/history",
          icon: <Clock className="h-4 w-4" />,
          description: "CI/CD pipeline history",
          badge: "DevOps"
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-muted-foreground">
            Centralized hub for system administration & monitoring
          </p>
        </div>
        <Button 
          onClick={checkSystemHealth}
          disabled={isChecking}
          variant="outline"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </div>

      {/* System Status Alert */}
      {healthStatus && (
        <Alert variant={healthStatus.healthy ? "default" : "destructive"}>
          {healthStatus.healthy ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {healthStatus.healthy ? "System Healthy" : "System Issue Detected"}
          </AlertTitle>
          <AlertDescription>{healthStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              List render improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Tools</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17</div>
            <p className="text-xs text-muted-foreground">
              Total admin interfaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PATCHES</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">506-510</div>
            <p className="text-xs text-muted-foreground">
              Fully implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {healthStatus?.healthy ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus?.healthy ? "OK" : "Check"}
            </div>
            <p className="text-xs text-muted-foreground">
              System health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool Categories */}
      {toolCategories.map((category, idx) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {category.icon}
              <div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool, toolIdx) => (
                <Link key={toolIdx} to={tool.path}>
                  <Card className="transition-colors hover:bg-accent cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tool.icon}
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tool.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Documentation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/PATCH_541_FINAL.md" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                PATCH 541 Complete Documentation
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/PATCH_542_IMAGE_OPTIMIZATION.md" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                PATCH 542 Image Optimization Guide
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/modules/system-validation.md" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                System Validation Guide
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/modules/virtualized-lists.md" target="_blank">
                <FileText className="mr-2 h-4 w-4" />
                Performance Optimization Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
