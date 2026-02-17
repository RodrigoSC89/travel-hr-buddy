/**
 * 🤖 AIAgentDirectory - Directory of all 10 maritime AI specialist agents
 * Grid of agent cards linking to individual chat interfaces.
 */
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllAgents, type AgentContext } from "@/lib/ai/agentContexts";
import {
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Users, Radio, Bot, MessageSquare, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Ship, Wrench, Shield, Heart, DollarSign, Navigation,
  Leaf, Package, Users, Radio,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string; glow: string }> = {
  blue:    { bg: "bg-info/10",        text: "text-info",        border: "border-info/20",        badge: "bg-info/15 text-info",        glow: "hover:shadow-info/10" },
  orange:  { bg: "bg-warning/10",     text: "text-warning",     border: "border-warning/20",     badge: "bg-warning/15 text-warning",     glow: "hover:shadow-warning/10" },
  red:     { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", badge: "bg-destructive/15 text-destructive", glow: "hover:shadow-destructive/10" },
  pink:    { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", badge: "bg-destructive/15 text-destructive", glow: "hover:shadow-destructive/10" },
  green:   { bg: "bg-success/10",     text: "text-success",     border: "border-success/20",     badge: "bg-success/15 text-success",     glow: "hover:shadow-success/10" },
  cyan:    { bg: "bg-info/10",        text: "text-info",        border: "border-info/20",        badge: "bg-info/15 text-info",        glow: "hover:shadow-info/10" },
  emerald: { bg: "bg-success/10",     text: "text-success",     border: "border-success/20",     badge: "bg-success/15 text-success",     glow: "hover:shadow-success/10" },
  purple:  { bg: "bg-primary/10",     text: "text-primary",     border: "border-primary/20",     badge: "bg-primary/15 text-primary",     glow: "hover:shadow-primary/10" },
  indigo:  { bg: "bg-primary/10",     text: "text-primary",     border: "border-primary/20",     badge: "bg-primary/15 text-primary",     glow: "hover:shadow-primary/10" },
  teal:    { bg: "bg-info/10",        text: "text-info",        border: "border-info/20",        badge: "bg-info/15 text-info",        glow: "hover:shadow-info/10" },
};

function AgentCard({ agent }: { agent: AgentContext }) {
  const colors = COLOR_MAP[agent.color] || COLOR_MAP.blue;
  const IconComponent = ICON_MAP[agent.icon] || Bot;

  return (
    <Link to={`/ai/agents/${agent.id}`} className="block group">
      <Card className={cn(
        "h-full transition-all duration-200 border",
        colors.border,
        colors.glow,
        "hover:shadow-lg hover:-translate-y-0.5"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={cn("p-2.5 rounded-lg", colors.bg)}>
              <IconComponent className={cn("h-6 w-6", colors.text)} />
            </div>
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
              Online
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{agent.name}</CardTitle>
          <CardDescription className="text-xs line-clamp-1">{agent.role}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-1">
            {agent.expertise.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className={cn("text-[10px] px-1.5 py-0", colors.badge)}>
                {skill.length > 25 ? skill.substring(0, 22) + "..." : skill}
              </Badge>
            ))}
            {agent.expertise.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{agent.expertise.length - 3}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full justify-between text-xs group-hover:bg-primary/5", colors.text)}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Iniciar Conversa
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AIAgentDirectory() {
  const agents = getAllAgents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Agentes Especialistas</h2>
            <p className="text-sm text-muted-foreground">
              {agents.length} agentes marítimos especializados com IA — clique para conversar
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          {agents.length} Online
        </Badge>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
