/**
 * PATCH 652 - Error Tracking Page
 * Centralized error monitoring and logging
 */

import { ErrorDashboard } from "@/components/admin/error-dashboard";

export default function ErrorsPage() {
  return (
    <div className="container mx-auto py-6">
      <ErrorDashboard />
    </div>
  );
}
