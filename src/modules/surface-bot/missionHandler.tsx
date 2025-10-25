/**
 * PATCH 173.0 - Mission Handler (UI)
 * Supervision interface and logs for surface bots
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, Activity, AlertTriangle } from "lucide-react";
import { surfaceBotCore, type SurfaceBotStatus } from "./surfaceBotCore";
import { sensorIntegration } from "./sensorIntegration";

export const MissionHandler: React.FC = () => {
  const [bots, setBots] = useState<SurfaceBotStatus[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBots(surfaceBotCore.listBots());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Surface Bot Fleet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <p className="text-muted-foreground">No bots registered</p>
          ) : (
            <div className="space-y-2">
              {bots.map(bot => (
                <div
                  key={bot.id}
                  className="p-4 border rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{bot.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Mode: {bot.navigationState.mode}
                    </div>
                  </div>
                  <Badge>{bot.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionHandler;
