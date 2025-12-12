import { memo, memo, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Download, UserPlus, Eye, Edit, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string | null;
  employee_id: string;
  nationality: string;
  email?: string | null;
  phone?: string | null;
  join_date?: string | null;
  years_experience?: number;
}

interface CrewListProps {
  crewMembers: CrewMember[];
  onViewMember: (member: CrewMember) => void;
  onAddMember: () => void;
  onExport: () => void;
}

const positionLabels: Record<string, { label: string; badge: string }> = {
  captain: { label: "Comandante", badge: "Capitão" },
  chief_officer: { label: "Imediato", badge: "Oficial" },
  second_officer: { label: "Segundo Oficial", badge: "Oficial" },
  third_officer: { label: "Terceiro Oficial", badge: "Oficial" },
  chief_engineer: { label: "Chefe de Máquinas", badge: "Oficial" },
  second_engineer: { label: "Segundo Engenheiro", badge: "Oficial" },
  deckhand: { label: "Marinheiro", badge: "" },
  cook: { label: "Cozinheiro", badge: "" },
  steward: { label: "Comissário", badge: "" },
  dpo: { label: "Oficial DPO", badge: "Oficial" },
  deck_officer: { label: "Oficial de Convés", badge: "Oficial" },
};

const nationalityLabels: Record<string, string> = {
  BR: "Brasileiro",
  US: "Americano",
  PT: "Português",
  ES: "Espanhol",
};

const statusStyles: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  on_leave: { label: "Licença Terra", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  embarked: { label: "Embarcado", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

export const CrewList = memo(function({ crewMembers, onViewMember, onAddMember, onExport }: CrewListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");

  const filteredCrew = crewMembers.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesPosition = positionFilter === "all" || member.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getPositionInfo = (position: string) => {
    return positionLabels[position] || { label: position, badge: "" };
  };

  const getStatusInfo = (status: string | null) => {
    return statusStyles[status || "inactive"] || statusStyles.inactive;
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Tripulação</CardTitle>
            <CardDescription>Gerencie informações da tripulação e certificações</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={onAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Tripulante
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, posição ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="on_leave">Em Licença</SelectItem>
              <SelectItem value="embarked">Embarcados</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="captain">Comandante</SelectItem>
              <SelectItem value="chief_engineer">Chefe de Máquinas</SelectItem>
              <SelectItem value="chief_officer">Imediato</SelectItem>
              <SelectItem value="second_officer">Segundo Oficial</SelectItem>
              <SelectItem value="deckhand">Marinheiro</SelectItem>
              <SelectItem value="dpo">Oficial DPO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Crew List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredCrew.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <p>Nenhum tripulante encontrado</p>
              </motion.div>
            ) : (
              filteredCrew.map((member, index) => {
                const positionInfo = getPositionInfo(member.position);
                const statusInfo = getStatusInfo(member.status);
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        member.status === "active" ? "bg-emerald-500" :
                          member.status === "on_leave" ? "bg-amber-500" :
                            member.status === "embarked" ? "bg-blue-500" :
                              "bg-muted-foreground"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.full_name}</span>
                          {positionInfo.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {positionInfo.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {positionInfo.label} • ID: {member.employee_id} • {nationalityLabels[member.nationality] || member.nationality}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                      {member.years_experience && (
                        <span className="text-sm text-muted-foreground hidden md:block">
                          {member.years_experience} anos exp.
                        </span>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onViewMember(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewMember(member)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
