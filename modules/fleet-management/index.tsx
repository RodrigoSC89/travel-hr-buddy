/**
 * Fleet Management Module - Main Component
 * PATCH 103.0: Real-time vessel tracking and management
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Ship, AlertCircle, RefreshCw } from "lucide-react";
import { FleetMap } from "./components/FleetMap";
import { VesselList } from "./components/VesselList";
import { VesselDetailCard } from "./components/VesselDetailCard";
import {
  fetchVessels,
  subscribeToVesselUpdates,
} from "./services/vessel-service";
import type { Vessel, VesselFilter, VesselStatus, MaintenanceStatus } from "./types";

export default function FleetManagement() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VesselStatus[]>([]);
  const [maintenanceFilter, setMaintenanceFilter] = useState<MaintenanceStatus[]>([]);

  // Load vessels
  const loadVessels = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: VesselFilter = {
        searchTerm: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        maintenanceStatus: maintenanceFilter.length > 0 ? maintenanceFilter : undefined,
      };

      const data = await fetchVessels(filter);
      setVessels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vessels");
      console.error("Error loading vessels:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadVessels();
  }, []);

  // Apply filters
  useEffect(() => {
    loadVessels();
  }, [searchTerm, statusFilter, maintenanceFilter]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = subscribeToVesselUpdates((payload) => {
      console.log("Vessel update received:", payload);
      // Reload vessels on any change
      loadVessels();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Toggle status filter
  const toggleStatusFilter = (status: VesselStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Toggle maintenance filter
  const toggleMaintenanceFilter = (status: MaintenanceStatus) => {
    setMaintenanceFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Get statistics
  const stats = {
    total: vessels.length,
    active: vessels.filter((v) => v.status === "active").length,
    maintenance: vessels.filter((v) => v.status === "maintenance").length,
    critical: vessels.filter(
      (v) => v.status === "critical" || v.maintenance_status === "critical"
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Ship className="h-8 w-8" />
          Fleet Management
        </h1>
        <p className="text-gray-400">Real-time vessel tracking and monitoring</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400 mt-1">Total Vessels</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{stats.active}</p>
              <p className="text-sm text-gray-400 mt-1">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {stats.maintenance}
              </p>
              <p className="text-sm text-gray-400 mt-1">In Maintenance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
              <p className="text-sm text-gray-400 mt-1">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by vessel name or IMO code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Status Filters */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {(["active", "maintenance", "inactive", "critical"] as VesselStatus[]).map(
                (status) => (
                  <Badge
                    key={status}
                    variant={statusFilter.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {status}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Maintenance Filters */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Maintenance Status</p>
            <div className="flex flex-wrap gap-2">
              {(["ok", "scheduled", "urgent", "critical"] as MaintenanceStatus[]).map(
                (status) => (
                  <Badge
                    key={status}
                    variant={maintenanceFilter.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMaintenanceFilter(status)}
                  >
                    {status}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={loadVessels}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Error loading vessels</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Fleet Map</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[500px] flex items-center justify-center bg-gray-800 rounded-lg">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <FleetMap
                  vessels={vessels}
                  selectedVesselId={selectedVessel?.id}
                  onVesselSelect={setSelectedVessel}
                  height="500px"
                />
              )}
            </CardContent>
          </Card>

          {/* Vessel List */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Vessel List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
                  <p className="text-gray-400 mt-2">Loading vessels...</p>
                </div>
              ) : (
                <VesselList
                  vessels={vessels}
                  selectedVesselId={selectedVessel?.id}
                  onVesselSelect={setSelectedVessel}
                  onViewDetails={setSelectedVessel}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vessel Detail Card */}
        <div className="lg:col-span-1">
          {selectedVessel ? (
            <VesselDetailCard
              vessel={selectedVessel}
              onClose={() => setSelectedVessel(null)}
            />
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Ship className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Select a vessel to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
