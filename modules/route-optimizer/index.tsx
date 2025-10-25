/**
 * Route Optimizer Module - Main Component
 * PATCH 104.0: AI-powered maritime route planning
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, RefreshCw, TrendingUp } from "lucide-react";
import { RoutePlannerForm } from "./components/RoutePlannerForm";
import { RouteList } from "./components/RouteList";
import { RouteDetail } from "./components/RouteDetail";
import { fetchRoutes } from "./services/route-service";
import { fetchVessels } from "../fleet-management/services/vessel-service";
import type { Route } from "./types";
import type { Vessel } from "../fleet-management/types";

export default function RouteOptimizer() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [routesData, vesselsData] = await Promise.all([
        fetchRoutes(),
        fetchVessels(),
      ]);
      setRoutes(routesData);
      setVessels(vesselsData);

      // Set default vessel
      if (vesselsData.length > 0 && !selectedVesselId) {
        setSelectedVesselId(vesselsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRouteCreated = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8" />
          Route Optimizer
        </h1>
        <p className="text-gray-400">
          AI-powered maritime route planning with weather awareness
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{routes.length}</p>
              <p className="text-sm text-gray-400 mt-1">Total Routes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {routes.filter((r) => r.status === "planned").length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Planned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {routes.filter((r) => r.status === "active").length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">
                {routes.filter((r) => r.status === "completed").length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planner Form */}
        <div className="lg:col-span-1">
          {/* Vessel Selector */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Select Vessel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : vessels.length > 0 ? (
                <select
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
                >
                  {vessels.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name} ({vessel.imo_code})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-400 text-sm">No vessels available</p>
              )}
            </CardContent>
          </Card>

          {/* Route Planner Form */}
          {selectedVesselId && (
            <RoutePlannerForm
              vesselId={selectedVesselId}
              onRouteCreated={handleRouteCreated}
            />
          )}

          {/* Refresh Button */}
          <Button
            onClick={loadData}
            variant="outline"
            className="w-full mt-4"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Routes List */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700 mb-4">
            <CardHeader>
              <CardTitle className="text-white">Optimized Routes</CardTitle>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
                  <p className="text-gray-400 mt-2">Loading routes...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <RouteList routes={routes} onSelectRoute={setSelectedRoute} />
          )}
        </div>
      </div>

      {/* Route Detail Modal */}
      {selectedRoute && (
        <RouteDetail route={selectedRoute} onClose={() => setSelectedRoute(null)} />
      )}
    </div>
  );
}
