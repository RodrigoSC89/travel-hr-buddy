/**
 * Live Activity Feed - Real-time operational activity stream
 * Shows latest system events with live updates
 */
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Ship, Users, Wrench, FileCheck, AlertTriangle,
  DollarSign, Shield, Clock, Anchor
} from "lucide-react";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<FeedItem[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      const results: FeedItem[] = [];

      // Fetch latest maintenance tasks
      const { data: maint } = await supabase
        .from("maintenance_tasks")
        .select("id, title, status, updated_at, vessel_id")
        .order("updated_at", { ascending: false })
        .limit(5);

      maint?.forEach(m => {
        results.push({
          id: `maint-${m.id}`,
          type: "maintenance",
          title: m.title || "Manutenção",
          detail: `Status: ${m.status}`,
          timestamp: m.updated_at || new Date().toISOString(),
          icon: <Wrench className="h-3.5 w-3.5" />,
          color: "text-amber-500",
        });
      });

      // Fetch latest certificates
      const { data: certs } = await supabase
        .from("certificates")
        .select("id, certificate_type, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(3);

      certs?.forEach(c => {
        results.push({
          id: `cert-${c.id}`,
          type: "certificate",
          title: c.certificate_type || "Certificado",
          detail: `Status: ${c.status}`,
          timestamp: c.updated_at || new Date().toISOString(),
          icon: <FileCheck className="h-3.5 w-3.5" />,
          color: "text-emerald-500",
        });
      });

      // Fetch latest NCs
      const { data: ncs } = await supabase
        .from("non_conformities")
        .select("id, title, severity, updated_at")
        .order("updated_at", { ascending: false })
        .limit(3);

      ncs?.forEach(n => {
        results.push({
          id: `nc-${n.id}`,
          type: "nc",
          title: n.title || "Não Conformidade",
          detail: `Severidade: ${n.severity}`,
          timestamp: n.updated_at || new Date().toISOString(),
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          color: n.severity === "critical" ? "text-destructive" : "text-amber-500",
        });
      });

      // Sort by timestamp
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(results.slice(0, 10));
    };

    loadActivities();
  }, []);

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diff < 1) return "agora";
      if (diff < 60) return `${diff}m`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h`;
      return `${Math.floor(diff / 1440)}d`;
    } catch {
      return "—";
    }
  };

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Live Activity Feed
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-1">
            <AnimatePresence>
              {activities.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group cursor-default"
                >
                  <div className={`mt-0.5 ${item.color}`}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground">{formatTime(item.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Anchor className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
