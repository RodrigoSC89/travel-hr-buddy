/**
 * Crew Wellbeing Page - Burnout prediction & wellness tracking
 */
import { CrewWellbeingDashboard } from "@/components/world-class/people/CrewWellbeingDashboard";

export default function CrewWellbeingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">❤️ Crew Wellbeing Score</h1>
        <p className="text-muted-foreground">Monitoramento de bem-estar e predição de burnout da tripulação</p>
      </div>
      <CrewWellbeingDashboard />
    </div>
  );
}
