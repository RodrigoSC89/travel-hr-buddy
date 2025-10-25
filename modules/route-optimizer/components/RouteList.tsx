/**
 * Route List Component
 * PATCH 104.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Fuel, Eye } from "lucide-react";
import type { Route } from "../types";
import { format } from "date-fns";

interface RouteListProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
}

export function RouteList({ routes, onSelectRoute }: RouteListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "delayed":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (routes.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-400">
            <p>No routes found. Create your first route above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Card key={route.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                {route.origin} → {route.destination}
              </CardTitle>
              <Badge variant="outline" className={getStatusColor(route.status)}>
                {route.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Route Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {route.distance_nm && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{Math.round(route.distance_nm)} nm</span>
                </div>
              )}

              {route.fuel_estimate && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Fuel className="h-4 w-4 text-gray-400" />
                  <span>{route.fuel_estimate} tons</span>
                </div>
              )}

              {route.planned_departure && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(route.planned_departure), "MMM d, yyyy")}</span>
                </div>
              )}

              {route.estimated_arrival && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    ETA: {format(new Date(route.estimated_arrival), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* AI Recommendation Preview */}
            {route.ai_recommendation && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">
                <p className="line-clamp-2">{route.ai_recommendation}</p>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => onSelectRoute(route)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
