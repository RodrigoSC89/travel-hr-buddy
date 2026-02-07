/**
 * PSC Readiness Page - Port State Control AI Briefing
 */
import { PSCReadinessDashboard } from "@/components/world-class/compliance/PSCReadinessDashboard";

export default function PSCReadinessPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🛡️ PSC Readiness & AI Briefing</h1>
        <p className="text-muted-foreground">Preparação inteligente para inspeções Port State Control</p>
      </div>
      <PSCReadinessDashboard />
    </div>
  );
}
