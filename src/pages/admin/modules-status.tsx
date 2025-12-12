/**
 * PATCH 646 - Modules Status Dashboard
 * Central admin panel for module activation, monitoring, and control
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Filter,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Search,
  Settings,
  Shield,
  TestTube,
  XCircle,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { logger } from "@/lib/logger";

interface Module {
  id: string;
  name: string;
  category: string;
  status: "active" | "beta" | "inactive" | "deprecated";
  path: string;
  route: string;
  hasDatabase: boolean;
  aiEnabled: boolean;
  version: string;
  lastModified: string;
  description?: string;
  tests?: {
    total: number;
    passing: number;
  };
  integrations?: string[];
}

const ModulesStatusDashboard: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    filterModules();
  }, [modules, searchTerm, filterCategory, filterStatus]);

  const loadModules = async () => {
    try {
      // Load from modules-registry.json
      const response = await fetch("/modules-registry.json");
      
      if (!response.ok) {
        throw new Error(`Failed to load modules: ${response.status}`);
      }
      
      const data = await response.json();
      
      const modulesData: Module[] = data.modules.map((m: any) => ({
        id: m.id,
        name: m.name,
        category: m.category || "uncategorized",
        status: m.status || "inactive",
        path: m.path,
        route: m.route,
        hasDatabase: m.hasDatabase || false,
        aiEnabled: m.aiEnabled !== undefined ? m.aiEnabled : false,
        version: m.version || "1.0.0",
        lastModified: m.lastModified || new Date().toISOString().split("T")[0],
        description: m.description || "",
        integrations: m.integrations || []
      }));

      setModules(modulesData);
      setFilteredModules(modulesData);
    } catch (error) {
      logger.error("Error loading modules status", { error });
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = [...modules];

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((m) => m.category === filterCategory);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    setFilteredModules(filtered);
  };

  const toggleModuleStatus = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
            ...m,
            status: m.status === "active" ? "inactive" : "active"
          }
          : m
      )
    );
  };

  const toggleModuleVisibility = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
            ...m,
            status: m.status === "deprecated" ? "inactive" : "deprecated"
          }
          : m
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      beta: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      deprecated: "bg-red-500/10 text-red-500 border-red-500/20"
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3" />,
      beta: <AlertCircle className="h-3 w-3" />,
      inactive: <XCircle className="h-3 w-3" />,
      deprecated: <XCircle className="h-3 w-3" />
    };

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${styles[status as keyof typeof styles]}`}
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const categories = Array.from(new Set(modules.map((m) => m.category))).sort();
  const stats = {
    total: modules.length,
    active: modules.filter((m) => m.status === "active").length,
    beta: modules.filter((m) => m.status === "beta").length,
    inactive: modules.filter((m) => m.status === "inactive").length,
    deprecated: modules.filter((m) => m.status === "deprecated").length,
    withAI: modules.filter((m) => m.aiEnabled).length,
    withDB: modules.filter((m) => m.hasDatabase).length
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
          <h1 className="text-3xl font-bold tracking-tight">Modules Control Center</h1>
          <p className="text-muted-foreground">
            PATCH 646 - Manage and monitor all system modules
          </p>
        </div>
        <Button onClick={loadModules} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
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
            <CardTitle className="text-sm font-medium text-green-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.beta}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Deprecated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.deprecated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">AI Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.withAI}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-500">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.withDB}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="beta">Beta</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Modules ({filteredModules.length})
          </CardTitle>
          <CardDescription>
            Manage module activation, visibility, and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredModules.map((module) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{module.name}</h3>
                          {getStatusBadge(module.status)}
                          <Badge variant="outline" className="text-xs">
                            {module.category}
                          </Badge>
                          {module.aiEnabled && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
                              <Zap className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {module.hasDatabase && (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500">
                              Database
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            v{module.version}
                          </span>
                          <span>Updated: {module.lastModified}</span>
                          <span>Route: {module.route}</span>
                        </div>

                        {module.integrations && module.integrations.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {module.integrations.map((integration) => (
                              <Badge key={integration} variant="secondary" className="text-xs">
                                {integration}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Active</span>
                          <Switch
                            checked={module.status === "active" || module.status === "beta"}
                            onCheckedChange={() => toggleModuleStatus(module.id)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Visible</span>
                          <Switch
                            checked={module.status !== "deprecated"}
                            onCheckedChange={() => toggleModuleVisibility(module.id)}
                          />
                        </div>
                        <Link to={module.route}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/admin/modules-status/docs/${module.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesStatusDashboard;
