/**
 * Crew Fatigue Predictor - AI-driven fatigue risk management
 * STCW Work/Rest Hours compliance with predictive analytics
 * Uses real data from Supabase
 */
import { CrewFatiguePredictorDashboard } from "@/components/crew/CrewFatiguePredictorDashboard";

export default function CrewFatiguePredictorPage() {
  return (
    <div className="py-4">
      <CrewFatiguePredictorDashboard />
    </div>
  );
}
