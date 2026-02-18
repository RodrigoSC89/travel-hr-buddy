/**
 * VesselContextSelector - Quick vessel switcher for the header
 * Allows operators to set active vessel context globally
 */
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Ship, ChevronDown, Check, Search, Anchor } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Vessel {
  id: string;
  name: string;
  status: string | null;
  vessel_type: string | null;
  imo_number: string | null;
}

const VESSEL_CONTEXT_KEY = "nautilus-active-vessel";

export function useVesselContext() {
  const [activeVesselId, setActiveVesselId] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(VESSEL_CONTEXT_KEY);
    } catch {
      return null;
    }
  });

  const setVessel = React.useCallback((vesselId: string | null) => {
    setActiveVesselId(vesselId);
    try {
      if (vesselId) {
        localStorage.setItem(VESSEL_CONTEXT_KEY, vesselId);
      } else {
        localStorage.removeItem(VESSEL_CONTEXT_KEY);
      }
    } catch {
      // ignore
    }
    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent("vessel-context-change", { detail: { vesselId } }));
  }, []);

  return { activeVesselId, setVessel };
}

export function VesselContextSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { activeVesselId, setVessel } = useVesselContext();

  const { data: vessels = [] } = useQuery({
    queryKey: ["vessel-context-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type, imo_number")
        .order("name");
      return (data || []) as Vessel[];
    },
    staleTime: 5 * 60_000,
  });

  const activeVessel = vessels.find(v => v.id === activeVesselId);
  const filtered = vessels.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.imo_number && v.imo_number.includes(search))
  );

  const statusDot: Record<string, string> = {
    active: "bg-success",
    operational: "bg-success",
    maintenance: "bg-warning",
    drydock: "bg-warning",
    docked: "bg-primary",
    idle: "bg-muted-foreground",
    laid_up: "bg-muted-foreground",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
            activeVessel
              ? "border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground"
              : "border-border/50 bg-muted/30 hover:bg-muted/50 text-muted-foreground"
          )}
          aria-label="Selecionar embarcação"
        >
          <Ship className="h-3.5 w-3.5" />
          <span className="max-w-[100px] truncate font-medium">
            {activeVessel ? activeVessel.name : "Todas"}
          </span>
          {activeVessel && (
            <span className={cn("w-1.5 h-1.5 rounded-full", statusDot[activeVessel.status || "active"] || "bg-muted-foreground")} />
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
        {/* Search */}
        <div className="p-2 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar embarcação..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* All vessels option */}
        <div className="max-h-60 overflow-y-auto p-1">
          <button
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
              !activeVesselId ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
            )}
            onClick={() => { setVessel(null); setOpen(false); }}
          >
            <Anchor className="h-3.5 w-3.5" />
            <span className="font-medium">Todas as Embarcações</span>
            {!activeVesselId && <Check className="h-3 w-3 ml-auto text-primary" />}
          </button>

          {filtered.length > 0 && (
            <div className="h-px bg-border/50 my-1" />
          )}

          <AnimatePresence>
            {filtered.map((vessel, i) => (
              <motion.button
                key={vessel.id}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                  vessel.id === activeVesselId ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                )}
                onClick={() => { setVessel(vessel.id); setOpen(false); setSearch(""); }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[vessel.status || "active"] || "bg-muted-foreground")} />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{vessel.name}</div>
                  {vessel.vessel_type && (
                    <div className="text-[9px] text-muted-foreground">{vessel.vessel_type}</div>
                  )}
                </div>
                {vessel.id === activeVesselId && <Check className="h-3 w-3 text-primary shrink-0" />}
              </motion.button>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              Nenhuma embarcação encontrada
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default VesselContextSelector;
