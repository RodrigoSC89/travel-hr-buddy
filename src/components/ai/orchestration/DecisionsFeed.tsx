import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Brain, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { agents, recentDecisions } from "./orchestration-data";

export const DecisionsFeed: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Decisões Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            <AnimatePresence>
              {recentDecisions.map(decision => (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{decision.type}</Badge>
                    <Badge
                      variant={decision.status === "executed" ? "default" : "secondary"}
                      className={
                        decision.status === "pending" ? "bg-warning" :
                        decision.status === "executed" ? "bg-success" : ""
                      }
                    >
                      {decision.status === "pending" ? "Aguardando" :
                       decision.status === "executed" ? "Executado" :
                       decision.status === "approved" ? "Aprovado" : "Rejeitado"}
                    </Badge>
                  </div>
                  <p className="text-sm">{decision.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Brain className="h-3 w-3" />{decision.agents.length} agentes</div>
                    <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{decision.consensus}% consenso</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {decision.agents.map(agentId => {
                      const agent = agents.find(a => a.id === agentId);
                      if (!agent) return null;
                      const Icon = agent.icon;
                      return <div key={agentId} className="p-1 rounded bg-muted" title={agent.name}><Icon className="h-3 w-3" /></div>;
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
