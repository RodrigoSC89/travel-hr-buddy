/**
 * Activity Timeline - Log de atividades de usuários
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  UserPlus, Shield, Edit, Trash2, LogIn, LogOut, Key, Lock,
  Search, Download, Clock, Filter, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivityEvent {
  id: string;
  type: "login" | "logout" | "role_change" | "invite" | "delete" | "edit" | "mfa" | "permission" | "suspend";
  actor: string;
  actorAvatar?: string;
  target?: string;
  description: string;
  timestamp: string;
  details?: string;
  severity: "info" | "warning" | "critical";
}

const MOCK_ACTIVITIES: ActivityEvent[] = [
  { id: "1", type: "login", actor: "Rodrigo Silva", description: "Login realizado com sucesso", timestamp: "2026-02-24T10:30:00Z", severity: "info" },
  { id: "2", type: "role_change", actor: "Rodrigo Silva", target: "Ana Costa", description: "Alterou role de 'Colaborador' para 'Gerente de RH'", timestamp: "2026-02-24T09:15:00Z", severity: "warning" },
  { id: "3", type: "invite", actor: "Marcelo Borba", target: "pedro.henrique@mbmaritime.com.br", description: "Convite enviado para novo membro", timestamp: "2026-02-23T16:45:00Z", severity: "info" },
  { id: "4", type: "mfa", actor: "Carlos Mendes", description: "Ativou autenticação de dois fatores", timestamp: "2026-02-23T14:20:00Z", severity: "info" },
  { id: "5", type: "permission", actor: "Rodrigo Silva", target: "Marina Oliveira", description: "Concedeu acesso ao módulo 'Compliance'", timestamp: "2026-02-23T11:30:00Z", severity: "warning" },
  { id: "6", type: "suspend", actor: "Sistema", target: "João Silva", description: "Conta suspensa por inatividade (90 dias)", timestamp: "2026-02-22T08:00:00Z", severity: "critical", details: "Política de segurança automática" },
  { id: "7", type: "delete", actor: "Rodrigo Silva", target: "Conta Teste", description: "Usuário removido permanentemente", timestamp: "2026-02-21T17:00:00Z", severity: "critical" },
  { id: "8", type: "edit", actor: "Ana Costa", target: "Próprio Perfil", description: "Atualizou departamento para 'Operações'", timestamp: "2026-02-21T15:30:00Z", severity: "info" },
  { id: "9", type: "login", actor: "Marcelo Borba", description: "Login com MFA verificado", timestamp: "2026-02-21T09:00:00Z", severity: "info" },
  { id: "10", type: "role_change", actor: "Sistema", target: "3 usuários", description: "Rebaixamento automático por expiração de contrato", timestamp: "2026-02-20T00:00:00Z", severity: "critical", details: "Regra de compliance MLC 2006" },
];

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  login: { icon: LogIn, color: "text-emerald-600 bg-emerald-500/10" },
  logout: { icon: LogOut, color: "text-muted-foreground bg-muted" },
  role_change: { icon: Shield, color: "text-violet-600 bg-violet-500/10" },
  invite: { icon: UserPlus, color: "text-blue-600 bg-blue-500/10" },
  delete: { icon: Trash2, color: "text-red-600 bg-red-500/10" },
  edit: { icon: Edit, color: "text-cyan-600 bg-cyan-500/10" },
  mfa: { icon: Key, color: "text-amber-600 bg-amber-500/10" },
  permission: { icon: Lock, color: "text-orange-600 bg-orange-500/10" },
  suspend: { icon: AlertTriangle, color: "text-red-600 bg-red-500/10" },
};

const SEVERITY_BADGE: Record<string, string> = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

const formatTimeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
};

export const ActivityTimeline: React.FC = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = MOCK_ACTIVITIES.filter(e => {
    const matchSearch = !search ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.target?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchType = typeFilter === "all" || e.type === typeFilter;
    const matchSev = severityFilter === "all" || e.severity === severityFilter;
    return matchSearch && matchType && matchSev;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Eventos Hoje", value: "47", icon: Clock, color: "text-blue-600" },
          { label: "Logins (24h)", value: "23", icon: LogIn, color: "text-emerald-600" },
          { label: "Alterações de Acesso", value: "8", icon: Shield, color: "text-violet-600" },
          { label: "Alertas Críticos", value: "2", icon: AlertTriangle, color: "text-red-600" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Timeline */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline de Atividades
              </CardTitle>
              <CardDescription>Auditoria completa de ações de usuários e sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />Exportar Log
            </Button>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar atividade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="role_change">Role</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
                <SelectItem value="permission">Permissão</SelectItem>
                <SelectItem value="suspend">Suspensão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Alerta</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[21px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-1">
              {filtered.map((event, idx) => {
                const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.edit;
                const EventIcon = config.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="relative pl-12 py-3 group"
                  >
                    {/* Icon Dot */}
                    <div className={`absolute left-2 top-4 p-1.5 rounded-full ${config.color} ring-4 ring-background z-10`}>
                      <EventIcon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{event.actor}</span>
                          {event.target && (
                            <>
                              <span className="text-xs text-muted-foreground">→</span>
                              <span className="text-sm text-muted-foreground">{event.target}</span>
                            </>
                          )}
                          <Badge variant="outline" className={`text-[10px] ${SEVERITY_BADGE[event.severity]}`}>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                        {event.details && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{event.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
