import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock, Eye, Edit, Calendar, MapPin, Ship, Building, TrendingUp, Filter, Search } from "lucide-react";

interface NonConformity {
  id: string;
  audit_id: string;
  element_number: string;
  element_name: string;
  non_conformity_type: "critical" | "grave" | "moderate" | "light";
  description: string;
  corrective_action: string;
  responsible_person: string;
  target_date: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  severity_score: number;
  audit_date: string;
  vessel_name?: string;
  shore_location?: string;
}

interface NonConformitiesProps {
  nonConformities: NonConformity[];
  onUpdate: (id: string, updates: Partial<NonConformity>) => void;
}

// Updated to match the PEOTRAM classification system
const TYPE_COLORS = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  grave: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  moderate: "bg-warning/20 text-warning border-warning/30",
  light: "bg-info/20 text-info border-info/30"
};

const STATUS_COLORS = {
  open: "bg-destructive/20 text-destructive border-destructive/30",
  in_progress: "bg-warning/20 text-warning border-warning/30",
  resolved: "bg-info/20 text-info border-info/30",
  closed: "bg-success/20 text-success border-success/30"
};

const STATUS_ICONS = {
  open: AlertTriangle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle
};

export const PeotramNonConformities: React.FC<NonConformitiesProps> = ({ 
  nonConformities, 
  onUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredNCs = nonConformities.filter(nc => {
    const matchesSearch = nc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.element_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || nc.non_conformity_type === selectedType;
    const matchesStatus = selectedStatus === "all" || nc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
    case "critical": return "Crítica";
    case "grave": return "Grave";
    case "moderate": return "Moderada";
    case "light": return "Leve";
    default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "open": return "Aberta";
    case "in_progress": return "Em Andamento";
    case "resolved": return "Resolvida";
    case "closed": return "Fechada";
    default: return status;
    }
  };

  const updateNC = async (id: string, updates: Partial<NonConformity>) => {
    try {
      await onUpdate(id, updates);
      setIsEditDialogOpen(false);
      setSelectedNC(null);
    } catch (error) {
      console.error("Erro ao atualizar não conformidade:", error);
    }
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  const getDaysUntilDue = (targetDate: string) => {
    const today = new Date();
    const due = new Date(targetDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Statistics
  const stats = {
    total: nonConformities.length,
    open: nonConformities.filter(nc => nc.status === "open").length,
    critical: nonConformities.filter(nc => nc.non_conformity_type === "critical").length,
    overdue: nonConformities.filter(nc => isOverdue(nc.target_date) && nc.status !== "closed").length
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Não Conformidades PEOTRAM</h2>
          <p className="text-muted-foreground">
            Gestão e acompanhamento de não conformidades
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.open}</div>
            <p className="text-sm text-muted-foreground">Abertas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
            <p className="text-sm text-muted-foreground">Críticas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground">Em Atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar não conformidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="grave">Grave</SelectItem>
                <SelectItem value="moderate">Moderada</SelectItem>
                <SelectItem value="light">Leve</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvida</SelectItem>
                <SelectItem value="closed">Fechada</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Non-Conformities List */}
      <div className="space-y-4">
        {filteredNCs.map((nc) => {
          const StatusIcon = STATUS_ICONS[nc.status];
          const daysUntilDue = getDaysUntilDue(nc.target_date);
          const overdue = isOverdue(nc.target_date);
          
          return (
            <Card key={nc.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusIcon className={`w-5 h-5 ${
                        nc.status === "open" ? "text-destructive" :
                          nc.status === "in_progress" ? "text-warning" :
                            "text-success"
                      }`} />
                      
                      <Badge variant="outline" className={TYPE_COLORS[nc.non_conformity_type]}>
                        {getTypeLabel(nc.non_conformity_type)}
                      </Badge>
                      
                      <Badge variant="outline" className={STATUS_COLORS[nc.status]}>
                        {getStatusLabel(nc.status)}
                      </Badge>
                      
                      {overdue && nc.status !== "closed" && (
                        <Badge variant="destructive">
                          Em Atraso
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{nc.element_name}</h3>
                    <p className="text-muted-foreground mb-4">{nc.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">Prazo: </span>
                          <span className={overdue ? "text-destructive font-medium" : ""}>
                            {new Date(nc.target_date).toLocaleDateString("pt-BR")}
                          </span>
                          {!overdue && nc.status !== "closed" && (
                            <span className="text-muted-foreground">
                              {daysUntilDue > 0 ? ` (${daysUntilDue} dias)` : " (hoje)"}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {nc.vessel_name ? (
                          <>
                            <Ship className="w-4 h-4 text-muted-foreground" />
                            <span>{nc.vessel_name}</span>
                          </>
                        ) : (
                          <>
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span>{nc.shore_location}</span>
                          </>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Responsável: </span>
                        <span className="font-medium">{nc.responsible_person}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Dialog open={isEditDialogOpen && selectedNC?.id === nc.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedNC(nc)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Não Conformidade</DialogTitle>
                          <DialogDescription>
                            {nc.element_number} - {nc.element_name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedNC && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="description">Descrição</Label>
                              <Textarea
                                id="description"
                                value={selectedNC.description}
                                onChange={(e) => setSelectedNC({ ...selectedNC, description: e.target.value })}
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="corrective_action">Ação Corretiva</Label>
                              <Textarea
                                id="corrective_action"
                                value={selectedNC.corrective_action}
                                onChange={(e) => setSelectedNC({ ...selectedNC, corrective_action: e.target.value })}
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                  value={selectedNC.status} 
                                  onValueChange={(value: any) => setSelectedNC({ ...selectedNC, status: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberta</SelectItem>
                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                    <SelectItem value="resolved">Resolvida</SelectItem>
                                    <SelectItem value="closed">Fechada</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="responsible_person">Responsável</Label>
                                <Input
                                  id="responsible_person"
                                  value={selectedNC.responsible_person}
                                  onChange={(e) => setSelectedNC({ ...selectedNC, responsible_person: e.target.value })}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="target_date">Data Limite</Label>
                              <Input
                                id="target_date"
                                type="date"
                                value={selectedNC.target_date}
                                onChange={(e) => setSelectedNC({ ...selectedNC, target_date: e.target.value })}
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={() => updateNC(selectedNC.id, selectedNC)}>
                                Salvar Alterações
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredNCs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma não conformidade encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                  ? "Tente ajustar os filtros de busca."
                  : "Não há não conformidades registradas."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};