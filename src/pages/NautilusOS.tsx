import React, { useState } from "react";
import { AppWindow } from "@/components/nautilus-os/AppWindow";
import { Brain, Plus, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppId = "SystemMonitor" | "LLMConsole" | "Copilot" | "LogsViewer" | "ModulesControl";

export default function NautilusOS() {
  const [activeApps, setActiveApps] = useState<AppId[]>(["SystemMonitor", "Copilot"]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openApp = (appId: AppId) => {
    if (!activeApps.includes(appId)) {
      setActiveApps([...activeApps, appId]);
    }
  };

  const closeApp = (appId: AppId) => {
    setActiveApps(activeApps.filter((id) => id !== appId));
  };

  return (
    <div className="relative h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-10 relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-widest">Nautilus One — OS UI</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => openApp("LLMConsole")}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Console IA
          </Button>
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="outline"
            size="sm"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className={`p-4 relative z-10 h-[calc(100vh-73px)] overflow-auto`}>
        <div className={`grid gap-4 ${
          activeApps.length === 1 ? "grid-cols-1" :
          activeApps.length === 2 ? "grid-cols-1 md:grid-cols-2" :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {activeApps.map((appId) => (
            <AppWindow
              key={appId}
              id={appId}
              onClose={() => closeApp(appId)}
            />
          ))}
        </div>

        {activeApps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Brain className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg">Nenhum módulo ativo</p>
            <p className="text-sm">Abra o Console IA para começar</p>
          </div>
        )}
      </main>
    </div>
  );
}
