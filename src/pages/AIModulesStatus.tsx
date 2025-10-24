/**
 * AI Modules Status Page
 * Dedicated page for monitoring AI module health
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp } from "lucide-react";
import { AIModulesDashboard } from "@/components/ai/ai-modules-dashboard";

export default function AIModulesStatus() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation bar */}
      <div className="mb-6 flex gap-2">
        <Link to="/developer/module-health">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Module Health
          </Button>
        </Link>
        <Link to="/developer/watchdog">
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Watchdog Monitor
          </Button>
        </Link>
      </div>
      
      <AIModulesDashboard />
    </div>
  );
}
