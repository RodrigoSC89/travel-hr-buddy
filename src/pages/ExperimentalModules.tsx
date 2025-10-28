import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useNavigate } from "react-router-dom";
import {
  Beaker,
  Search,
  Filter,
  Brain,
  Plane,
  Sonar,
  Navigation,
  Zap,
  Droplet,
  Glasses,
  Activity,
  Package,
  Clock,
  User,
} from "lucide-react";

interface ExperimentalModule {
  id: string;
  name: string;
  description: string;
  status: "active" | "testing" | "prototype" | "deprecated";
  stability: "stable" | "beta" | "alpha" | "experimental";
  tags: string[];
  version: string;
  author: string;
  lastExecution: string;
  usagePercentage: number;
  route?: string;
}

const ExperimentalModules = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stabilityFilter, setStabilityFilter] = useState("all");

  const modules: ExperimentalModule[] = useMemo(
    () => [
      {
        id: "ocean-sonar",
        name: "Ocean Sonar AI",
        description: "Advanced underwater sonar detection and mapping with AI-powered analysis",
        status: "active",
        stability: "beta",
        tags: ["AI", "sonar", "underwater"],
        version: "2.1.0",
        author: "Marine Systems Team",
        lastExecution: "2 hours ago",
        usagePercentage: 78,
        route: "/ocean-sonar",
      },
      {
        id: "underwater-drone",
        name: "Underwater Drone Control",
        description: "Autonomous underwater drone navigation and mission control system",
        status: "active",
        stability: "beta",
        tags: ["drone", "automation", "underwater"],
        version: "1.8.5",
        author: "Robotics Division",
        lastExecution: "5 hours ago",
        usagePercentage: 65,
        route: "/underwater-drone",
      },
      {
        id: "ai-predictor",
        name: "AI Price Predictor",
        description: "Machine learning model for predicting travel price trends",
        status: "testing",
        stability: "alpha",
        tags: ["AI", "prediction", "analytics"],
        version: "0.9.2",
        author: "Data Science Team",
        lastExecution: "1 day ago",
        usagePercentage: 42,
      },
      {
        id: "voice-assistant",
        name: "Voice Assistant Module",
        description: "Natural language processing for voice-controlled operations",
        status: "active",
        stability: "stable",
        tags: ["AI", "voice", "automation"],
        version: "3.2.1",
        author: "AI Team",
        lastExecution: "30 minutes ago",
        usagePercentage: 89,
        route: "/voice-assistant",
      },
      {
        id: "xr-training",
        name: "XR Training Simulator",
        description: "Extended reality training simulations for crew members",
        status: "prototype",
        stability: "experimental",
        tags: ["xr", "training", "simulation"],
        version: "0.3.0",
        author: "Training Academy",
        lastExecution: "3 days ago",
        usagePercentage: 15,
      },
      {
        id: "smart-nav",
        name: "Smart Navigation AI",
        description: "AI-powered route optimization and navigation assistance",
        status: "active",
        stability: "beta",
        tags: ["AI", "nav", "optimization"],
        version: "2.0.4",
        author: "Navigation Systems",
        lastExecution: "1 hour ago",
        usagePercentage: 72,
      },
      {
        id: "bio-sensors",
        name: "Biometric Sensor Array",
        description: "Real-time crew health monitoring through biometric sensors",
        status: "testing",
        stability: "alpha",
        tags: ["sensors", "health", "monitoring"],
        version: "1.1.0",
        author: "Medical Systems",
        lastExecution: "6 hours ago",
        usagePercentage: 38,
      },
      {
        id: "quantum-comm",
        name: "Quantum Communication",
        description: "Experimental quantum-encrypted communication system",
        status: "prototype",
        stability: "experimental",
        tags: ["communication", "security", "quantum"],
        version: "0.1.5",
        author: "Research Lab",
        lastExecution: "1 week ago",
        usagePercentage: 5,
      },
      {
        id: "auto-maintenance",
        name: "Autonomous Maintenance",
        description: "Predictive maintenance with autonomous scheduling and execution",
        status: "testing",
        stability: "alpha",
        tags: ["AI", "automation", "maintenance"],
        version: "1.3.2",
        author: "Maintenance Division",
        lastExecution: "12 hours ago",
        usagePercentage: 51,
      },
      {
        id: "emergency-ai",
        name: "Emergency Response AI",
        description: "AI coordinator for emergency situations and crisis management",
        status: "active",
        stability: "stable",
        tags: ["AI", "emergency", "automation"],
        version: "2.5.0",
        author: "Safety Systems",
        lastExecution: "4 hours ago",
        usagePercentage: 83,
        route: "/emergency-drill",
      },
      {
        id: "weather-predictor",
        name: "Weather Prediction ML",
        description: "Machine learning model for localized weather forecasting",
        status: "testing",
        stability: "beta",
        tags: ["AI", "weather", "prediction"],
        version: "1.6.8",
        author: "Meteorology Team",
        lastExecution: "2 hours ago",
        usagePercentage: 67,
        route: "/weather-dashboard",
      },
      {
        id: "cargo-optimizer",
        name: "Cargo Load Optimizer",
        description: "AI-optimized cargo loading and weight distribution system",
        status: "deprecated",
        stability: "stable",
        tags: ["AI", "optimization", "logistics"],
        version: "1.9.5",
        author: "Logistics Team",
        lastExecution: "2 months ago",
        usagePercentage: 8,
      },
    ],
    []
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    modules.forEach((m) => m.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [modules]);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      // Search filter
      if (
        searchTerm &&
        !module.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !module.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Tag filter
      if (tagFilter !== "all" && !module.tags.includes(tagFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && module.status !== statusFilter) {
        return false;
      }

      // Stability filter
      if (stabilityFilter !== "all" && module.stability !== stabilityFilter) {
        return false;
      }

      return true;
    });
  }, [modules, searchTerm, tagFilter, statusFilter, stabilityFilter]);

  const statistics = useMemo(() => {
    return {
      total: modules.length,
      active: modules.filter((m) => m.status === "active").length,
      testing: modules.filter((m) => m.status === "testing").length,
      prototype: modules.filter((m) => m.status === "prototype").length,
      stable: modules.filter((m) => m.stability === "stable").length,
    };
  }, [modules]);

  const getStatusColor = (status: ExperimentalModule["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "testing":
        return "secondary";
      case "prototype":
        return "outline";
      case "deprecated":
        return "destructive";
    }
  };

  const getStabilityColor = (stability: ExperimentalModule["stability"]) => {
    switch (stability) {
      case "stable":
        return "text-green-600";
      case "beta":
        return "text-blue-600";
      case "alpha":
        return "text-yellow-600";
      case "experimental":
        return "text-orange-600";
    }
  };

  const getIcon = (tags: string[]) => {
    if (tags.includes("AI")) return Brain;
    if (tags.includes("drone")) return Plane;
    if (tags.includes("sonar")) return Sonar;
    if (tags.includes("nav")) return Navigation;
    if (tags.includes("automation")) return Zap;
    if (tags.includes("underwater")) return Droplet;
    if (tags.includes("xr")) return Glasses;
    return Package;
  };

  const handleModuleClick = (module: ExperimentalModule) => {
    if (module.route) {
      navigate(module.route);
    }
  };

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Beaker}
        title="Experimental Modules Overview"
        description="Painel de monitoramento e categorização de módulos experimentais"
        gradient="green"
        badges={[
          { icon: Beaker, label: "Experimental" },
          { icon: Activity, label: "Live Monitoring" },
          { icon: Package, label: `${statistics.total} Modules` },
        ]}
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground">Total Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{statistics.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{statistics.testing}</div>
            <div className="text-xs text-muted-foreground">Testing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{statistics.prototype}</div>
            <div className="text-xs text-muted-foreground">Prototype</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-600">{statistics.stable}</div>
            <div className="text-xs text-muted-foreground">Stable</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stabilityFilter} onValueChange={setStabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stability</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="experimental">Experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => {
            const Icon = getIcon(module.tags);
            return (
              <Card
                key={module.id}
                className={`transition-all ${
                  module.route ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]" : ""
                }`}
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(module.status) as any}>{module.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stability</span>
                    <span className={`font-semibold ${getStabilityColor(module.stability)}`}>
                      {module.stability}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-semibold">{module.usagePercentage}%</span>
                    </div>
                    <Progress value={module.usagePercentage} className="h-2" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {module.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Version:</span>
                      <span className="font-mono">{module.version}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{module.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last run: {module.lastExecution}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No modules found matching the current filters
          </div>
        )}
      </div>
    </ModulePageWrapper>
  );
};

export default ExperimentalModules;
