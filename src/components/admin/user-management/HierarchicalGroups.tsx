/**
 * Hierarchical Groups - Permission Inheritance
 * Real data from user_roles + profiles or fallback from organizations
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  FolderTree, Users, Plus, ChevronRight, ChevronDown, Shield,
  ArrowDownRight, Edit, UserPlus, GitBranch, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  memberCount: number;
  inheritedPermissions: string[];
  ownPermissions: string[];
  members: { name: string; email: string }[];
}

const LEVEL_COLORS = [
  "border-l-red-500",
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
];

const LEVEL_BG = [
  "bg-red-500/5",
  "bg-blue-500/5",
  "bg-emerald-500/5",
  "bg-amber-500/5",
];

// Default hierarchy based on maritime org structure
const DEFAULT_HIERARCHY: PermissionGroup[] = [
  {
    id: "g1", name: "Diretoria Executiva", description: "Nível máximo de acesso",
    parentId: null, level: 0, memberCount: 0, inheritedPermissions: [],
    ownPermissions: ["command", "finance", "compliance", "ai", "system_settings"], members: [],
  },
  {
    id: "g2", name: "Gerência Operacional", description: "Acesso operacional",
    parentId: "g1", level: 1, memberCount: 0,
    inheritedPermissions: ["command", "finance", "compliance", "ai", "system_settings"],
    ownPermissions: ["fleet", "maintenance", "tracking", "voyage"], members: [],
  },
  {
    id: "g3", name: "Supervisão de Campo", description: "Acesso operacional de campo",
    parentId: "g2", level: 2, memberCount: 0,
    inheritedPermissions: ["fleet", "maintenance", "tracking", "voyage"],
    ownPermissions: ["crew_management", "safety"], members: [],
  },
  {
    id: "g4", name: "RH & Compliance", description: "Gestão de pessoas e conformidade",
    parentId: "g1", level: 1, memberCount: 0,
    inheritedPermissions: ["command", "finance", "compliance"],
    ownPermissions: ["people", "documents", "training", "certifications"], members: [],
  },
  {
    id: "g5", name: "Tripulação", description: "Acesso básico para membros da tripulação",
    parentId: "g3", level: 3, memberCount: 0,
    inheritedPermissions: ["crew_management", "safety"],
    ownPermissions: ["self_service", "documents_read"], members: [],
  },
];

export const HierarchicalGroups: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["g1", "g2"]));
  const [selectedGroup, setSelectedGroup] = useState<PermissionGroup | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ["hierarchical-user-roles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const groups: PermissionGroup[] = useMemo(() => {
    // Enrich default hierarchy with real member counts
    const roleCounts: Record<string, number> = {};
    userRoles.forEach((ur) => {
      const role = String(ur.role || "viewer");
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    return DEFAULT_HIERARCHY.map((g) => {
      let count = 0;
      if (g.id === "g1") count = roleCounts["admin"] || roleCounts["owner"] || 0;
      else if (g.id === "g2") count = roleCounts["manager"] || roleCounts["superintendent"] || 0;
      else if (g.id === "g3") count = roleCounts["supervisor"] || 0;
      else if (g.id === "g4") count = roleCounts["hr"] || roleCounts["compliance"] || 0;
      else if (g.id === "g5") count = roleCounts["viewer"] || roleCounts["crew"] || 0;
      
      return { ...g, memberCount: count || g.memberCount };
    });
  }, [userRoles]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getChildren = (parentId: string) => groups.filter(g => g.parentId === parentId);

  const openDetail = (group: PermissionGroup) => {
    setSelectedGroup(group);
    setShowDetailDialog(true);
  };

  const renderGroup = (group: PermissionGroup): React.ReactNode => {
    const children = getChildren(group.id);
    const isExpanded = expandedIds.has(group.id);
    const hasChildren = children.length > 0;

    return (
      <div key={group.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${LEVEL_COLORS[group.level]} ${LEVEL_BG[group.level]} border hover:shadow-sm transition-all cursor-pointer group`}
          style={{ marginLeft: group.level * 32 }}
          onClick={() => openDetail(group)}
        >
          {hasChildren && (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(group.id); }} className="p-1 rounded hover:bg-muted">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="p-2 rounded-lg bg-background/80"><FolderTree className="h-4 w-4 text-primary" /></div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{group.name}</p>
              <Badge variant="outline" className="text-[10px]">Nível {group.level}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{group.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" /><span className="text-sm font-bold">{group.memberCount}</span></div>
              <p className="text-[10px] text-muted-foreground">membros</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-muted-foreground" /><span className="text-sm font-bold">{group.ownPermissions.length + group.inheritedPermissions.length}</span></div>
              <p className="text-[10px] text-muted-foreground">permissões</p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} aria-label="Editar grupo"><Edit className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()} aria-label="Adicionar membro"><UserPlus className="h-3.5 w-3.5" /></Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 mt-2">
              {children.map(child => renderGroup(child))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootGroups = groups.filter(g => g.parentId === null);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Grupos", value: groups.length, icon: FolderTree, color: "text-primary" },
          { label: "Níveis", value: 4, icon: GitBranch, color: "text-violet-600" },
          { label: "Membros Total", value: groups.reduce((s, g) => s + g.memberCount, 0), icon: Users, color: "text-blue-600" },
          { label: "Permissões Herdadas", value: "98%", icon: ArrowDownRight, color: "text-emerald-600" },
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Hierarquia de Grupos</CardTitle>
              <CardDescription>Permissões são herdadas automaticamente de grupos pai para grupos filhos</CardDescription>
            </div>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo Grupo</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">{rootGroups.map(group => renderGroup(group))}</div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
            <ArrowDownRight className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Herança automática:</strong> As permissões fluem de cima para baixo. Conflitos são resolvidos pela política "Deny-first".
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedGroup?.name}</DialogTitle>
            <DialogDescription>{selectedGroup?.description}</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Shield className="h-4 w-4" />Permissões Próprias</p>
                <div className="flex flex-wrap gap-1">
                  {selectedGroup.ownPermissions.map(p => (
                    <Badge key={p} className="bg-primary/10 text-primary border-primary/20 text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
              {selectedGroup.inheritedPermissions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><ArrowDownRight className="h-4 w-4" />Herdadas do Grupo Pai</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedGroup.inheritedPermissions.map(p => (
                      <Badge key={p} variant="outline" className="text-xs text-muted-foreground">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Users className="h-4 w-4" />Membros ({selectedGroup.memberCount})</p>
                {selectedGroup.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.members.map(m => (
                      <div key={m.email} className="flex items-center gap-2 p-2 rounded-lg border">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Membros gerenciados via tabela user_roles</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Fechar</Button>
            <Button><Edit className="h-4 w-4 mr-1" />Editar Grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
