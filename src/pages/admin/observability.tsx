/**
 * Observability Dashboard Page
 * Technical monitoring and system health visualization
 */

import { Suspense } from 'react';
import ObservabilityDashboard from '@/components/ObservabilityDashboard';

export default function ObservabilityPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Observability Dashboard...</p>
        </div>
      </div>
    }>
      <ObservabilityDashboard />
    </Suspense>
  );
}
