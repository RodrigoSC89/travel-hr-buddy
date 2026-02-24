/**
 * Vessel Access Control - Object-Level Security (Polished UX v2)
 * Restricts user access to specific vessels/fleet groups
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Anchor, Ship, Search, Save, Globe, Layers, Settings2,
  ShieldCheck, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  all: { label: "Acesso Global", icon: Globe, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", tooltip: "Acesso a todas as embarcações da organização" },
  fleet_group: { label: "Grupo de Frota", icon: Layers, color: "bg-blue-500/10 text-blue-600 border-blue-500/20", tooltip: "Acesso restrito a frotas selecionadas" },
  specific: { label: "Específicas", icon: Ship, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", tooltip: "Acesso a embarcações individuais" },
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
    toast.success("Acesso atualizado", { description: `Permissões de ${editUser.userName} salvas com sucesso.` });
  };

  const getVesselCount = (user: UserVesselAccess) => {
    if (user.accessType === "all") return ALL_VESSELS.length;
    if (user.accessType === "fleet_group") {
      return FLEET_GROUPS.filter(g => user.fleetGroups.includes(g.id)).reduce((sum, g) => sum + g.vessels.length, 0);
    }
    return user.specificVessels.length;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Fleet Groups Overview */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {FLEET_GROUPS.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => setShowGroupDialog(true)}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <Anchor className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.vessels.length} embarcações</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.vessels.slice(0, 2).map(v => (
                      <Badge key={v} variant="outline" className="text-[10px]">{v}</Badge>
                    ))}
                    {group.vessels.length > 2 && (
                      <Badge variant="secondary" className="text-[10px]">+{group.vessels.length - 2}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* User Vessel Access */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Segurança por Embarcação
                </CardTitle>
                <CardDescription>Restrinja a visibilidade de dados por embarcação ou grupo de frota</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <Ship className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="font-medium text-sm mb-1">Nenhum usuário encontrado</p>
                <p className="text-xs text-muted-foreground">Ajuste o termo de busca para encontrar usuários.</p>
              </div>
            ) : (
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
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => openEdit(user)}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {user.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{user.userName}</p>
                            <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={`${config.color} hidden sm:flex`}>
                              <AccessIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">{config.tooltip}</p></TooltipContent>
                        </Tooltip>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">{getVesselCount(user)}</p>
                          <p className="text-[10px] text-muted-foreground">navios</p>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                          <Settings2 className="h-4 w-4 mr-1" />Editar
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
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
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                  <label className="text-sm font-medium">Grupos de Frota</label>
                  {FLEET_GROUPS.map(group => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
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
                </motion.div>
              )}

              {editAccessType === "specific" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                  <label className="text-sm font-medium">Embarcações</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {ALL_VESSELS.map(vessel => (
                      <div key={vessel} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
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
                </motion.div>
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
                <div key={group.id} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};