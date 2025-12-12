/**
import { useMemo, useState, useCallback } from "react";;
 * PATCH 655 - Module Control Admin Page
 * Dynamic module activation panel
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationStructure, ModuleStatus } from "@/hooks/useNavigationStructure";
import { ModuleToggleCard } from "@/components/ui/ModuleToggleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logger } from "@/lib/logger";

export const ModuleControl: React.FC = () => {
  const navigate = useNavigate();
  const {
    modules,
    getModulesByStatus,
    getModulesByCategory,
    statistics,
  } = useNavigationStructure({
    includeProduction: true,
    includeDevelopment: true,
    includeExperimental: true,
    includeDeprecated: true,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModules, setActiveModules] = useState<Set<string>>(
    new Set(modules.filter((m) => m.status === "production").map((m) => m.id))
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(modules.map((m) => m.category));
    return ["all", ...Array.from(cats)].sort();
  }, [modules]);

  // Filter modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    return filtered;
  }, [modules, searchQuery, selectedCategory]);

  const handleToggle = (id: string, newState: boolean) => {
    setActiveModules((prev) => {
      const updated = new Set(prev);
      if (newState) {
        updated.add(id);
      } else {
        updated.delete(id);
      }
      return updated;
  };

    // Log activation change
    logger.info("Module activation state changed", { moduleId: id, newState });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleViewHistory = (id: string) => {
    logger.info("Viewing module history", { moduleId: id });
    // TODO: Implement history view
  };

  const renderModuleGrid = (moduleList: typeof modules) => {
    if (moduleList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No modules found matching your criteria
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleList.map((module) => (
          <ModuleToggleCard
            key={module.id}
            id={module.id}
            name={module.name}
            description={module.description}
            status={module.status}
            category={module.category}
            isActive={activeModules.has(module.id)}
            aiEnabled={module.aiEnabled}
            requiresRole={module.requiresRole}
            onToggle={handleToggle}
            onViewHistory={handleViewHistory}
            onNavigate={handleNavigate}
            path={module.path}
          />
        ))}
      </div>
    );
  });

  return (
    <main className="container mx-auto p-6 space-y-6" role="main" aria-label="Module Control Center">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Module Control Center</h1>
        <p className="text-muted-foreground">
          Manage and activate modules dynamically by status and role
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">✅ Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.production}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">⚠️ Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.development}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🧪 Experimental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.experimental}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.withAI}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Module Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredModules.length})
          </TabsTrigger>
          <TabsTrigger value="production">
            ✅ Production ({getModulesByStatus("production").length})
          </TabsTrigger>
          <TabsTrigger value="development">
            ⚠️ Development ({getModulesByStatus("development").length})
          </TabsTrigger>
          <TabsTrigger value="experimental">
            🧪 Experimental ({getModulesByStatus("experimental").length})
          </TabsTrigger>
          <TabsTrigger value="deprecated">
            ❌ Deprecated ({getModulesByStatus("deprecated").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderModuleGrid(filteredModules)}
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === "production")
          )}
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === "development")
          )}
        </TabsContent>

        <TabsContent value="experimental" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === "experimental")
          )}
        </TabsContent>

        <TabsContent value="deprecated" className="mt-6">
          {renderModuleGrid(
            filteredModules.filter((m) => m.status === "deprecated")
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ModuleControl;
