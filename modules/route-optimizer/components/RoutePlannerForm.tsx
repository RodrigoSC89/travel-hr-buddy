/**
 * Route Planner Form Component
 * PATCH 104.0
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Gauge, Loader2 } from "lucide-react";
import type { RouteOptimizationRequest } from "../types";

interface RoutePlannerFormProps {
  vesselId: string;
  onRouteCreated: () => void;
}

export function RoutePlannerForm({ vesselId, onRouteCreated }: RoutePlannerFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [preferredSpeed, setPreferredSpeed] = useState("15");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const request: RouteOptimizationRequest = {
        vessel_id: vesselId,
        origin,
        destination,
        departure_date: departureDate || undefined,
        preferred_speed: parseFloat(preferredSpeed) || 15,
      };

      // Import dynamically to avoid circular dependencies
      const { optimizeRoute } = await import("../services/route-service");
      await optimizeRoute(request);

      // Reset form
      setOrigin("");
      setDestination("");
      setDepartureDate("");
      setPreferredSpeed("15");

      // Notify parent
      onRouteCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create route");
      console.error("Error creating route:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Plan New Route</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Origin */}
          <div className="space-y-2">
            <Label htmlFor="origin" className="text-gray-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Origin Port
            </Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Port of Santos, Brazil"
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label
              htmlFor="destination"
              className="text-gray-300 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Destination Port
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Port of Rotterdam, Netherlands"
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Departure Date */}
          <div className="space-y-2">
            <Label
              htmlFor="departure"
              className="text-gray-300 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Planned Departure
            </Label>
            <Input
              id="departure"
              type="datetime-local"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Preferred Speed */}
          <div className="space-y-2">
            <Label htmlFor="speed" className="text-gray-300 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Preferred Speed (knots)
            </Label>
            <Input
              id="speed"
              type="number"
              min="5"
              max="30"
              step="0.5"
              value={preferredSpeed}
              onChange={(e) => setPreferredSpeed(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing Route...
              </>
            ) : (
              "Optimize Route with AI"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
