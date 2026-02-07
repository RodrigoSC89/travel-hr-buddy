/**
 * Fleet Pulse Page - Unified Fleet Overview
 */
import { FleetPulseDashboard } from "@/components/world-class/fleet/FleetPulseDashboard";

export default function FleetPulsePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏢 Fleet Pulse</h1>
        <p className="text-muted-foreground">Visão unificada em tempo real de toda a frota</p>
      </div>
      <FleetPulseDashboard />
    </div>
  );
}
