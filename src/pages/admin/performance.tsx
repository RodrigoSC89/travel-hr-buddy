/**
 * PATCH 652 - Performance Monitoring Page
 * Dashboard for real-time performance metrics
 */

import { PerformanceDashboard } from "@/components/admin/performance-dashboard";

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-6">
      <PerformanceDashboard />
    </div>
  );
}
