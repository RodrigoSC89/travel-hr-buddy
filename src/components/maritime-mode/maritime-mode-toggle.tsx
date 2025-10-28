/**
 * Maritime Mode Toggle Component
 * PATCH 157.0 - Field-Ready UI/UX
 * 
 * Enables/disables maritime mode for field operations
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Ship, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MaritimeModeContextType {
  isMaritimeMode: boolean;
  toggleMaritimeMode: () => void;
}

const MaritimeModeContext = createContext<MaritimeModeContextType | undefined>(undefined);

export function MaritimeModeProvider({ children }: { children: React.ReactNode }) {
  const [isMaritimeMode, setIsMaritimeMode] = useState(false);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem("maritime-mode");
    if (saved === "enabled") {
      setIsMaritimeMode(true);
      document.documentElement.classList.add("maritime-mode");
    }

    // Also load the maritime CSS
    import("@/styles/maritime-mode.css");
  }, []);

  const toggleMaritimeMode = () => {
    const newValue = !isMaritimeMode;
    setIsMaritimeMode(newValue);

    if (newValue) {
      document.documentElement.classList.add("maritime-mode");
      localStorage.setItem("maritime-mode", "enabled");
    } else {
      document.documentElement.classList.remove("maritime-mode");
      localStorage.setItem("maritime-mode", "disabled");
    }
  };

  return (
    <MaritimeModeContext.Provider value={{ isMaritimeMode, toggleMaritimeMode }}>
      {children}
    </MaritimeModeContext.Provider>
  );
}

export function useMaritimeMode() {
  const context = useContext(MaritimeModeContext);
  if (context === undefined) {
    throw new Error("useMaritimeMode must be used within MaritimeModeProvider");
  }
  return context;
}

export function MaritimeModeToggle() {
  const { isMaritimeMode, toggleMaritimeMode } = useMaritimeMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle maritime mode"
          title="Toggle maritime mode for outdoor/field operations"
        >
          {isMaritimeMode ? (
            <Ship className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleMaritimeMode}>
          <Ship className="mr-2 h-4 w-4" />
          {isMaritimeMode ? "Disable" : "Enable"} Maritime Mode
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <span className="text-xs text-muted-foreground">
            High contrast mode for outdoor/field operations
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Maritime Mode Settings Panel
 * Full settings panel for maritime mode configuration
 */
export function MaritimeModeSettings() {
  const { isMaritimeMode, toggleMaritimeMode } = useMaritimeMode();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Maritime Mode</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Optimize the interface for outdoor and field operations with enhanced
          contrast, larger touch targets, and improved readability in sunlight.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              <span className="font-medium">Field-Ready Mode</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable for offshore/maritime operations
            </p>
          </div>
          <Button
            onClick={toggleMaritimeMode}
            variant={isMaritimeMode ? "default" : "outline"}
          >
            {isMaritimeMode ? "Enabled" : "Disabled"}
          </Button>
        </div>

        {isMaritimeMode && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Maritime Mode Active
            </h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Maximum contrast for sunlight readability</li>
              <li>Larger fonts (18px base, up to 48px headers)</li>
              <li>Enhanced touch targets (56px minimum)</li>
              <li>Thicker borders and stronger shadows</li>
              <li>Optimized dark mode for bridge operations</li>
            </ul>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>High contrast text (WCAG AAA 21:1)</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>56px minimum touch targets</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Sunlight-optimized colors</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Glove-friendly controls</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Bridge command dark mode</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Enhanced skeleton loading</span>
          </div>
        </div>
      </div>
    </div>
  );
}
