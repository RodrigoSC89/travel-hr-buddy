/**
 * Voyage Simulator Page
 */
import { VoyageSimulatorPanel } from "@/components/world-class/operations/VoyageSimulatorPanel";

export default function VoyageSimulatorPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🧠 Voyage Simulator</h1>
        <p className="text-muted-foreground">Simulações what-if para otimização de viagens marítimas</p>
      </div>
      <VoyageSimulatorPanel />
    </div>
  );
}
