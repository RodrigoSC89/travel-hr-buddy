/**
 * Training LXP Page - Learning Experience Platform
 * Adaptive Learning + Microlearning + Gamification
 */

import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

const TrainingDashboard = lazy(() => import("@/modules/training-lxp"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function TrainingLXPPage() {
  return (
    <>
      <Helmet>
        <title>Training LXP | Plataforma de Aprendizagem Adaptativa</title>
        <meta 
          name="description" 
          content="Plataforma de Learning Experience com aprendizado adaptativo, microlearning gamificado, XP, badges e leaderboard" 
        />
      </Helmet>
      <Suspense fallback={<LoadingFallback />}>
        <TrainingDashboard />
      </Suspense>
    </>
  );
}
