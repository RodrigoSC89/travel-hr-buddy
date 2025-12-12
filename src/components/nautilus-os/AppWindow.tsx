import React from "react";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appsRegistry } from "./appsRegistry";
import { Card } from "@/components/ui/card";

type AppId = keyof typeof appsRegistry;

interface AppWindowProps {
  id: AppId;
  onClose: () => void;
}

export const AppWindow = memo(function({ id, onClose }: AppWindowProps) {
  const app = appsRegistry[id];
  const AppComponent = app.component;

  return (
    <Card className="bg-card p-4 rounded-lg shadow-lg border border-border animate-scale-in h-fit">
      {/* Window header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <app.icon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">{app.title}</h2>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Window content */}
      <div className="max-h-[500px] overflow-auto text-sm">
        <AppComponent />
      </div>
    </Card>
  );
});
