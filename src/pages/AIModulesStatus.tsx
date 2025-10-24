/**
 * AI Modules Status Page
 * Dedicated page for monitoring AI module health
 */

import { AIModulesDashboard } from "@/components/ai/ai-modules-dashboard";

export default function AIModulesStatus() {
  return (
    <div className="container mx-auto py-8 px-4">
      <AIModulesDashboard />
    </div>
  );
}
