/**
 * PATCH 376: Route Planning with Map Integration
 * Interactive route planning with Leaflet map visualization
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Plus, Edit, Trash2, Route } from "lucide-react";

interface RouteData {
  id: string;
  vessel_id?: string;
  origin: string;
  origin_coordinates?: { lat: number; lng: number };
  destination: string;
  destination_coordinates?: { lat: number; lng: number };
  planned_departure?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  status: string;
  distance_nm?: number;
  fuel_estimate?: number;
  fuel_actual?: number;
  route_geometry?: any;
  ai_recommendation?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Waypoint {
  id: string;
  sequence_order: number;
  location_name: string;
  coordinates: { lat: number; lng: number };
  waypoint_type: string;
  estimated_arrival?: string;
  notes?: string;
}

export const RoutePlanning: React.FC = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    origin: "",
    origin_lat: 0,
    origin_lng: 0,
    destination: "",
    destination_lat: 0,
    destination_lng: 0,
    planned_departure: "",
    estimated_arrival: "",
    status: "planned",
    distance_nm: 0,
    fuel_estimate: 0,
    notes: ""
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      loadWaypoints(selectedRoute.id);
      initializeMap();
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error loading routes:", error);
      toast({
        title: "Error",
        description: "Failed to load routes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWaypoints = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from("route_waypoints")
        .select("*")
        .eq("route_id", routeId)
        .order("sequence_order", { ascending: true });

      if (error) throw error;
      setWaypoints(data || []);
    } catch (error) {
      console.error("Error loading waypoints:", error);
    }
  };

  const initializeMap = () => {
    // Simple map placeholder - in production, use Leaflet or Mapbox
    if (!mapRef.current) return;
    
    // This is a placeholder. In production, you would initialize:
    // const L = require('leaflet');
    // const map = L.map(mapRef.current).setView([0, 0], 2);
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  };

  const handleCreate = async () => {
    try {
      const routeData = {
        origin: formData.origin,
        origin_coordinates: {
          lat: formData.origin_lat,
          lng: formData.origin_lng
        },
        destination: formData.destination,
        destination_coordinates: {
          lat: formData.destination_lat,
          lng: formData.destination_lng
        },
        planned_departure: formData.planned_departure || null,
        estimated_arrival: formData.estimated_arrival || null,
        status: formData.status,
        distance_nm: formData.distance_nm || null,
        fuel_estimate: formData.fuel_estimate || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from("routes")
        .insert([routeData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route created successfully"
      });

      setIsCreateOpen(false);
      resetForm();
      loadRoutes();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedRoute) return;

    try {
      const routeData = {
        origin: formData.origin,
        origin_coordinates: {
          lat: formData.origin_lat,
          lng: formData.origin_lng
        },
        destination: formData.destination,
        destination_coordinates: {
          lat: formData.destination_lat,
          lng: formData.destination_lng
        },
        planned_departure: formData.planned_departure || null,
        estimated_arrival: formData.estimated_arrival || null,
        status: formData.status,
        distance_nm: formData.distance_nm || null,
        fuel_estimate: formData.fuel_estimate || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from("routes")
        .update(routeData)
        .eq("id", selectedRoute.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route updated successfully"
      });

      setIsEditOpen(false);
      setSelectedRoute(null);
      resetForm();
      loadRoutes();
    } catch (error) {
      console.error("Error updating route:", error);
      toast({
        title: "Error",
        description: "Failed to update route",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route deleted successfully"
      });

      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
      loadRoutes();
    } catch (error) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: "Failed to delete route",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (route: RouteData) => {
    setSelectedRoute(route);
    setFormData({
      origin: route.origin,
      origin_lat: route.origin_coordinates?.lat || 0,
      origin_lng: route.origin_coordinates?.lng || 0,
      destination: route.destination,
      destination_lat: route.destination_coordinates?.lat || 0,
      destination_lng: route.destination_coordinates?.lng || 0,
      planned_departure: route.planned_departure || "",
      estimated_arrival: route.estimated_arrival || "",
      status: route.status,
      distance_nm: route.distance_nm || 0,
      fuel_estimate: route.fuel_estimate || 0,
      notes: route.notes || ""
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      origin: "",
      origin_lat: 0,
      origin_lng: 0,
      destination: "",
      destination_lat: 0,
      destination_lng: 0,
      planned_departure: "",
      estimated_arrival: "",
      status: "planned",
      distance_nm: 0,
      fuel_estimate: 0,
      notes: ""
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      planned: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      delayed: "bg-yellow-100 text-yellow-800"
    };

    return (
      <Badge className={variants[status] || "bg-gray-100"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Routes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Planning
              </CardTitle>
              <CardDescription>
                Plan and manage logistics routes
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Route
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Route</DialogTitle>
                  <DialogDescription>
                    Plan a new logistics route
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Origin</Label>
                    <Input
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="Port of Santos, Brazil"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.origin_lat}
                        onChange={(e) => setFormData({ ...formData, origin_lat: parseFloat(e.target.value) })}
                        placeholder="Latitude"
                      />
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.origin_lng}
                        onChange={(e) => setFormData({ ...formData, origin_lng: parseFloat(e.target.value) })}
                        placeholder="Longitude"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Destination</Label>
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="Port of Rotterdam, Netherlands"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.destination_lat}
                        onChange={(e) => setFormData({ ...formData, destination_lat: parseFloat(e.target.value) })}
                        placeholder="Latitude"
                      />
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.destination_lng}
                        onChange={(e) => setFormData({ ...formData, destination_lng: parseFloat(e.target.value) })}
                        placeholder="Longitude"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Planned Departure</Label>
                      <Input
                        type="datetime-local"
                        value={formData.planned_departure}
                        onChange={(e) => setFormData({ ...formData, planned_departure: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Estimated Arrival</Label>
                      <Input
                        type="datetime-local"
                        value={formData.estimated_arrival}
                        onChange={(e) => setFormData({ ...formData, estimated_arrival: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Distance (NM)</Label>
                      <Input
                        type="number"
                        value={formData.distance_nm}
                        onChange={(e) => setFormData({ ...formData, distance_nm: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Fuel Est. (tons)</Label>
                      <Input
                        type="number"
                        value={formData.fuel_estimate}
                        onChange={(e) => setFormData({ ...formData, fuel_estimate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional route information..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Route</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading routes...</div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No routes found. Create your first route to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoute?.id === route.id ? "ring-2 ring-primary" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{route.origin}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Navigation className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{route.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {route.distance_nm && (
                            <span>{route.distance_nm} NM</span>
                          )}
                          {route.fuel_estimate && (
                            <span>{route.fuel_estimate} tons fuel</span>
                          )}
                          {getStatusBadge(route.status)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(route);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(route.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map View */}
      <Card>
        <CardHeader>
          <CardTitle>Route Visualization</CardTitle>
          <CardDescription>
            Interactive map view of selected route
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRoute ? (
            <div className="space-y-4">
              <div
                ref={mapRef}
                className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Map Integration</p>
                  <p className="text-xs mt-1">
                    Leaflet/Mapbox visualization placeholder
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    In production: npm install react-leaflet leaflet
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Route Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Origin:</span>
                    <div className="font-medium">{selectedRoute.origin}</div>
                    {selectedRoute.origin_coordinates && (
                      <div className="text-xs text-gray-500">
                        {selectedRoute.origin_coordinates.lat.toFixed(4)}, {selectedRoute.origin_coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Destination:</span>
                    <div className="font-medium">{selectedRoute.destination}</div>
                    {selectedRoute.destination_coordinates && (
                      <div className="text-xs text-gray-500">
                        {selectedRoute.destination_coordinates.lat.toFixed(4)}, {selectedRoute.destination_coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {waypoints.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Waypoints ({waypoints.length})</h4>
                  <div className="space-y-2">
                    {waypoints.map((waypoint, index) => (
                      <div key={waypoint.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span>{waypoint.location_name}</span>
                        <Badge className="ml-auto">{waypoint.waypoint_type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Select a route to view on map
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update route information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Origin</Label>
              <Input
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.origin_lat}
                  onChange={(e) => setFormData({ ...formData, origin_lat: parseFloat(e.target.value) })}
                  placeholder="Latitude"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.origin_lng}
                  onChange={(e) => setFormData({ ...formData, origin_lng: parseFloat(e.target.value) })}
                  placeholder="Longitude"
                />
              </div>
            </div>

            <div>
              <Label>Destination</Label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.destination_lat}
                  onChange={(e) => setFormData({ ...formData, destination_lat: parseFloat(e.target.value) })}
                  placeholder="Latitude"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.destination_lng}
                  onChange={(e) => setFormData({ ...formData, destination_lng: parseFloat(e.target.value) })}
                  placeholder="Longitude"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Planned Departure</Label>
                <Input
                  type="datetime-local"
                  value={formData.planned_departure}
                  onChange={(e) => setFormData({ ...formData, planned_departure: e.target.value })}
                />
              </div>
              <div>
                <Label>Estimated Arrival</Label>
                <Input
                  type="datetime-local"
                  value={formData.estimated_arrival}
                  onChange={(e) => setFormData({ ...formData, estimated_arrival: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Distance (NM)</Label>
                <Input
                  type="number"
                  value={formData.distance_nm}
                  onChange={(e) => setFormData({ ...formData, distance_nm: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Fuel Est. (tons)</Label>
                <Input
                  type="number"
                  value={formData.fuel_estimate}
                  onChange={(e) => setFormData({ ...formData, fuel_estimate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
