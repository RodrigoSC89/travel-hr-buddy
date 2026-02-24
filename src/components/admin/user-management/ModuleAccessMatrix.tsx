/**
 * Module Access Matrix - Controle visual de acesso por módulo/role
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Shield, Lock, Unlock, Eye, Edit, Trash2, Settings,
  Anchor, Navigation, Wrench, Brain, Radar, Scale, Briefcase,
  Save, RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";

interface ModuleAccessRow {
  module: string;
  hub: string;
  icon: React.ElementType;
  permissions: Record<string, { read: boolean; write: boolean; delete: boolean; manage: boolean }>;
}

const ROLES = ["admin", "hr_manager", "manager", "coordinator", "supervisor", "employee"] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", hr_manager: "RH", manager: "Gerente",
  coordinator: "Coord.", supervisor: "Superv.", employee: "Colab.",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  hr_manager: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  coordinator: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  supervisor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  employee: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const INITIAL_MODULES: ModuleAccessRow[] = [
  {
    module: "Command Center", hub: "Command", icon: Navigation,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: true, delete: false, manage: false },
      manager: { read: true, write: true, delete: false, manage: false },
      coordinator: { read: true, write: false, delete: false, manage: false },
      supervisor: { read: true, write: false, delete: false, manage: false },
      employee: { read: false, write: false, delete: false, manage: false },
    },
  },
  {
    module: "Fleet Management", hub: "Ops", icon: Anchor,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: false, delete: false, manage: false },
      manager: { read: true, write: true, delete: false, manage: false },
      coordinator: { read: true, write: true, delete: false, manage: false },
      supervisor: { read: true, write: false, delete: false, manage: false },
      employee: { read: true, write: false, delete: false, manage: false },
    },
  },
  {
    module: "Maintenance", hub: "Maintenance", icon: Wrench,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: false, write: false, delete: false, manage: false },
      manager: { read: true, write: true, delete: true, manage: false },
      coordinator: { read: true, write: true, delete: false, manage: false },
      supervisor: { read: true, write: true, delete: false, manage: false },
      employee: { read: true, write: false, delete: false, manage: false },
    },
  },
  {
    module: "AI Hub", hub: "AI", icon: Brain,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: true, delete: false, manage: false },
      manager: { read: true, write: false, delete: false, manage: false },
      coordinator: { read: false, write: false, delete: false, manage: false },
      supervisor: { read: false, write: false, delete: false, manage: false },
      employee: { read: false, write: false, delete: false, manage: false },
    },
  },
  {
    module: "Tracking & IoT", hub: "Tracking", icon: Radar,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: false, delete: false, manage: false },
      manager: { read: true, write: true, delete: false, manage: false },
      coordinator: { read: true, write: true, delete: false, manage: false },
      supervisor: { read: true, write: false, delete: false, manage: false },
      employee: { read: false, write: false, delete: false, manage: false },
    },
  },
  {
    module: "Compliance", hub: "Compliance", icon: Scale,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: true, delete: false, manage: false },
      manager: { read: true, write: true, delete: false, manage: false },
      coordinator: { read: true, write: false, delete: false, manage: false },
      supervisor: { read: true, write: false, delete: false, manage: false },
      employee: { read: true, write: false, delete: false, manage: false },
    },
  },
  {
    module: "People & HR", hub: "Workbench", icon: Briefcase,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: true, write: true, delete: true, manage: true },
      manager: { read: true, write: false, delete: false, manage: false },
      coordinator: { read: true, write: false, delete: false, manage: false },
      supervisor: { read: false, write: false, delete: false, manage: false },
      employee: { read: false, write: false, delete: false, manage: false },
    },
  },
  {
    module: "System Settings", hub: "System", icon: Settings,
    permissions: {
      admin: { read: true, write: true, delete: true, manage: true },
      hr_manager: { read: false, write: false, delete: false, manage: false },
      manager: { read: false, write: false, delete: false, manage: false },
      coordinator: { read: false, write: false, delete: false, manage: false },
      supervisor: { read: false, write: false, delete: false, manage: false },
      employee: { read: false, write: false, delete: false, manage: false },
    },
  },
];

const PermIcon: React.FC<{ type: string; active: boolean }> = ({ type, active }) => {
  const icons = { read: Eye, write: Edit, delete: Trash2, manage: Shield };
  const Icon = icons[type as keyof typeof icons] || Eye;
  return (
    <div className={`p-1 rounded ${active ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground/30"}`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
};

export const ModuleAccessMatrix: React.FC = () => {
  const [modules, setModules] = useState(INITIAL_MODULES);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [hasChanges, setHasChanges] = useState(false);

  const togglePermission = (moduleIdx: number, role: string, perm: string) => {
    setModules(prev => {
      const next = [...prev];
      const mod = { ...next[moduleIdx] };
      mod.permissions = { ...mod.permissions };
      mod.permissions[role] = {
        ...mod.permissions[role],
        [perm]: !mod.permissions[role][perm as keyof typeof mod.permissions[typeof role]],
      };
      next[moduleIdx] = mod;
      return next;
    });
    setHasChanges(true);
  };

  const filteredRoles = selectedRole === "all" ? [...ROLES] : [selectedRole];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div {...fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {ROLES.map(role => (
            <Badge key={role} variant="outline" className={`cursor-pointer transition-all ${ROLE_COLORS[role]} ${selectedRole === role ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onClick={() => setSelectedRole(selectedRole === role ? "all" : role)}>
              {ROLE_LABELS[role]}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" size="sm" onClick={() => { setModules(INITIAL_MODULES); setHasChanges(false); }}>
                <RotateCcw className="h-4 w-4 mr-1" />Reverter
              </Button>
              <Button size="sm" onClick={() => setHasChanges(false)}>
                <Save className="h-4 w-4 mr-1" />Salvar Permissões
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Matriz de Acesso por Módulo
          </CardTitle>
          <CardDescription>Configure permissões granulares (Ler, Escrever, Excluir, Gerenciar) por role e módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Módulo</TableHead>
                  {filteredRoles.map(role => (
                    <TableHead key={role} className="text-center min-w-[140px]">
                      <Badge variant="outline" className={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((mod, idx) => {
                  const ModIcon = mod.icon;
                  return (
                    <TableRow key={mod.module}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-primary/5">
                            <ModIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{mod.module}</p>
                            <p className="text-xs text-muted-foreground">{mod.hub}</p>
                          </div>
                        </div>
                      </TableCell>
                      {filteredRoles.map(role => {
                        const perms = mod.permissions[role];
                        return (
                          <TableCell key={role} className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {(["read", "write", "delete", "manage"] as const).map(p => (
                                <button key={p} onClick={() => togglePermission(idx, role, p)}
                                  className="hover:scale-110 transition-transform" title={`${p}: ${perms[p] ? "Ativo" : "Inativo"}`}>
                                  <PermIcon type={p} active={perms[p]} />
                                </button>
                              ))}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Ler</span>
            <span className="flex items-center gap-1"><Edit className="h-3 w-3" />Escrever</span>
            <span className="flex items-center gap-1"><Trash2 className="h-3 w-3" />Excluir</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Gerenciar</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
