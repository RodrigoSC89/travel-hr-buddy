/**
 * Vessel List Table Component
 * PATCH 103.0
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin } from "lucide-react";
import type { Vessel } from "../types";

interface VesselListProps {
  vessels: Vessel[];
  selectedVesselId?: string;
  onVesselSelect: (vessel: Vessel) => void;
  onViewDetails: (vessel: Vessel) => void;
}

export function VesselList({
  vessels,
  selectedVesselId,
  onVesselSelect,
  onViewDetails,
}: VesselListProps) {
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

  if (vessels.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No vessels found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Vessel Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              IMO Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Maintenance
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Position
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {vessels.map((vessel) => (
            <tr
              key={vessel.id}
              className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${
                selectedVesselId === vessel.id ? "bg-blue-900/20" : ""
              }`}
              onClick={() => onVesselSelect(vessel)}
            >
              <td className="px-4 py-3 text-sm text-white font-medium">
                {vessel.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {vessel.imo_code}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {vessel.vessel_type || "—"}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={getStatusColor(vessel.status)}
                >
                  {vessel.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={getMaintenanceColor(vessel.maintenance_status)}
                >
                  {vessel.maintenance_status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {vessel.last_known_position ? (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">
                      {vessel.last_known_position.lat.toFixed(4)},
                      {vessel.last_known_position.lng.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(vessel);
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
