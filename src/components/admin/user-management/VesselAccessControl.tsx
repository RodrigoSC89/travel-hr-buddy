/**
 * Vessel Access Control - Object-Level Security
 * Restricts user access to specific vessels/fleet groups (Gap: TM Master / Veson IMOS)
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Anchor, Ship, Users, Search, Plus, Trash2, Save, Eye,
  ShieldCheck, Globe, Lock, ChevronRight, Layers, Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";

interface FleetGroup {
  id: string;
  name: string;
  vessels: string[];
  color: string;
}

interface UserVesselAccess {
  userId: string;
  userName: string;
  email: string;
  role: string;
  accessType: "all" | "fleet_group" | "specific";
  fleetGroups: string[];
  specificVessels: string[];
}

const FLEET_GROUPS: FleetGroup[] = [
  { id: "fg1", name: "Frota Sul", vessels: ["MV Santos", "MV Paranaguá", "MV Rio Grande"], color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { id: "fg2", name: "Frota Norte", vessels: ["MV Belém", "MV Manaus", "MV Macapá"], color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { id: "fg3", name: "Frota Offshore", vessels: ["AHTS Petrobras I", "PSV Campos", "PLSV Deep"], color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  { id: "fg4", name: "Frota Internacional", vessels: ["MV Atlantic Star", "MV Pacific Wind"], color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
];

const ALL_VESSELS = FLEET_GROUPS.flatMap(g => g.vessels);

const MOCK_USER_ACCESS: UserVesselAccess[] = [
  { userId: "1", userName: "Rodrigo Silva", email: "rodrigo.silva@mbmaritime.com.br", role: "admin", accessType: "all", fleetGroups: [], specificVessels: [] },
  { userId: "2", userName: "Ana Costa", email: "ana.costa@mbmaritime.com.br", role: "hr_manager", accessType: "fleet_group", fleetGroups: ["fg1", "fg3"], specificVessels: [] },
  { userId: "3", userName: "Carlos Mendes", email: "carlos.mendes@mbmaritime.com.br", role: "supervisor", accessType: "specific", fleetGroups: [], specificVessels: ["MV Santos", "MV Paranaguá"] },
  { userId: "4", userName: "Marina Oliveira", email: "marina.oliveira@mbmaritime.com.br", role: "coordinator", accessType: "fleet_group", fleetGroups: ["fg2"], specificVessels: [] },
];

const ACCESS_TYPE_CONFIG = {
  all: { label: "Acesso Global", icon: Globe, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  fleet_group: { label: "Grupo de Frota", icon: Layers, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  specific: { label: "Embarcações Específicas", icon: Ship, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

export const VesselAccessControl: React.FC = () => {
  const [userAccess, setUserAccess] = useState(MOCK_USER_ACCESS);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserVesselAccess | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editAccessType, setEditAccessType] = useState<"all" | "fleet_group" | "specific">("all");
  const [editFleetGroups, setEditFleetGroups] = useState<string[]>([]);
  const [editVessels, setEditVessels] = useState<string[]>([]);

  const filtered = userAccess.filter(u =>
    u.userName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (user: UserVesselAccess) => {
    setEditUser(user);
    setEditAccessType(user.accessType);
    setEditFleetGroups([...user.fleetGroups]);
    setEditVessels([...user.specificVessels]);
    setShowEditDialog(true);
  };

  const saveEdit = () => {
    if (!editUser) return;
    setUserAccess(prev => prev.map(u =>
      u.userId === editUser.userId
        ? { ...u, accessType: editAccessType, fleetGroups: editFleetGroups, specificVessels: editVessels }
        : u
    ));
    setShowEditDialog(false);
  };

  const getVesselCount = (user: UserVesselAccess) => {
    if (user.accessType === "all") return ALL_VESSELS.length;
    if (user.accessType === "fleet_group") {
      return FLEET_GROUPS.filter(g => user.fleetGroups.includes(g.id)).reduce((sum, g) => sum + g.vessels.length, 0);
    }
    return user.specificVessels.length;
  };

  return (
    <div className="space-y-6">
      {/* Fleet Groups Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {FLEET_GROUPS.map(group => (
          <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowGroupDialog(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Anchor className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.vessels.length} embarcações</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {group.vessels.slice(0, 2).map(v => (
                  <Badge key={v} variant="outline" className="text-[10px]">{v}</Badge>
                ))}
                {group.vessels.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">+{group.vessels.length - 2}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Vessel Access */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Segurança por Objeto (Embarcação)
              </CardTitle>
              <CardDescription>Restrinja a visibilidade de dados por embarcação ou grupo de frota — como Veson IMOS</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((user, idx) => {
                const config = ACCESS_TYPE_CONFIG[user.accessType];
                const AccessIcon = config.icon;
                return (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-all group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {user.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{user.userName}</p>
                        <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      <AccessIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-bold">{getVesselCount(user)}</p>
                      <p className="text-[10px] text-muted-foreground">embarcações</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="h-4 w-4 mr-1" />Editar
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Edit Access Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Configurar Acesso — {editUser?.userName}
            </DialogTitle>
            <DialogDescription>Defina quais embarcações este usuário pode visualizar e gerenciar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Acesso</label>
              <Select value={editAccessType} onValueChange={(v) => setEditAccessType(v as typeof editAccessType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 Acesso Global — Todas as embarcações</SelectItem>
                  <SelectItem value="fleet_group">🚢 Grupo de Frota — Frotas selecionadas</SelectItem>
                  <SelectItem value="specific">📌 Embarcações Específicas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editAccessType === "fleet_group" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupos de Frota</label>
                {FLEET_GROUPS.map(group => (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Anchor className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{group.name}</span>
                      <span className="text-xs text-muted-foreground">({group.vessels.length} navios)</span>
                    </div>
                    <Switch
                      checked={editFleetGroups.includes(group.id)}
                      onCheckedChange={(checked) => {
                        setEditFleetGroups(prev =>
                          checked ? [...prev, group.id] : prev.filter(id => id !== group.id)
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {editAccessType === "specific" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Embarcações</label>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {ALL_VESSELS.map(vessel => (
                    <div key={vessel} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <span className="text-sm">{vessel}</span>
                      <Switch
                        checked={editVessels.includes(vessel)}
                        onCheckedChange={(checked) => {
                          setEditVessels(prev =>
                            checked ? [...prev, vessel] : prev.filter(v => v !== vessel)
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={saveEdit}>
              <Save className="h-4 w-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fleet Group Management Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Grupos de Frota</DialogTitle>
            <DialogDescription>Grupos herdam permissões para todas as embarcações incluídas</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {FLEET_GROUPS.map(group => (
              <div key={group.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{group.name}</span>
                  </div>
                  <Badge variant="outline">{group.vessels.length} embarcações</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.vessels.map(v => (
                    <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>Fechar</Button>
            <Button><Plus className="h-4 w-4 mr-1" />Novo Grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
