/**
 * Vessel Detail Card Component
 * PATCH 103.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ship,
  MapPin,
  Gauge,
  Calendar,
  Flag,
  Anchor,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Vessel } from "../types";

interface VesselDetailCardProps {
  vessel: Vessel;
  onClose: () => void;
}

export function VesselDetailCard({ vessel, onClose }: VesselDetailCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "maintenance":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "inactive":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    case "critical":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getMaintenanceColor = (status: string) => {
    switch (status) {
    case "ok":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "scheduled":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "urgent":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "critical":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Vessel Details
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vessel Name and IMO */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{vessel.name}</h3>
          <p className="text-sm text-gray-400">IMO: {vessel.imo_code}</p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getStatusColor(vessel.status)}>
            Status: {vessel.status}
          </Badge>
          <Badge
            variant="outline"
            className={getMaintenanceColor(vessel.maintenance_status)}
          >
            Maintenance: {vessel.maintenance_status}
          </Badge>
        </div>

        {/* Vessel Information */}
        <div className="space-y-3 pt-2">
          {vessel.vessel_type && (
            <div className="flex items-center gap-2 text-sm">
              <Ship className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{vessel.vessel_type}</span>
            </div>
          )}

          {vessel.flag && (
            <div className="flex items-center gap-2 text-sm">
              <Flag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{vessel.flag}</span>
            </div>
          )}

          {vessel.built_year && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">Built: {vessel.built_year}</span>
            </div>
          )}

          {vessel.gross_tonnage && (
            <div className="flex items-center gap-2 text-sm">
              <Anchor className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">
                {vessel.gross_tonnage.toLocaleString()} GT
              </span>
            </div>
          )}
        </div>

        {/* Position Information */}
        {vessel.last_known_position && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Last Known Position
            </h4>
            <div className="text-sm space-y-2 text-gray-300">
              <p>
                Latitude: {vessel.last_known_position.lat.toFixed(6)}°
              </p>
              <p>
                Longitude: {vessel.last_known_position.lng.toFixed(6)}°
              </p>
              {vessel.last_known_position.speed !== undefined && (
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-gray-400" />
                  <span>Speed: {vessel.last_known_position.speed} knots</span>
                </div>
              )}
              {vessel.last_known_position.course !== undefined && (
                <p>Course: {vessel.last_known_position.course}°</p>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Notes */}
        {vessel.maintenance_notes && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Maintenance Notes
            </h4>
            <p className="text-sm text-gray-300">{vessel.maintenance_notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-700 pt-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Open Full Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
