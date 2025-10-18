import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SGSOIncident } from "@/types/incident";
import { FileDown, Filter, X, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { saveAs } from "file-saver";
import { SGSOIncidentForm } from "./SGSOIncidentForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SEVERITY_COLORS: Record<string, string> = {
  "Crítica": "bg-red-600 text-white",
  "Alta": "bg-orange-600 text-white",
  "Média": "bg-yellow-600 text-white",
  "Baixa": "bg-green-600 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  "open": "Aberto",
  "investigating": "Em Investigação",
  "resolved": "Resolvido",
  "closed": "Fechado",
};

export function SGSOIncidentList() {
  const [incidents, setIncidents] = useState<SGSOIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<SGSOIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<SGSOIncident | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sgso/incidents");
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      } else {
        toast.error("Erro ao carregar incidentes");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Get unique types from incidents
  const types = Array.from(new Set(incidents.map(inc => inc.type).filter(Boolean))).sort();

  // Apply filters
  useEffect(() => {
    let filtered = incidents;

    if (typeFilter !== "all") {
      filtered = filtered.filter(inc => inc.type === typeFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(inc => inc.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(inc => inc.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  }, [typeFilter, severityFilter, statusFilter, incidents]);

  const clearFilters = () => {
    setTypeFilter("all");
    setSeverityFilter("all");
    setStatusFilter("all");
  };

  const activeFilterCount = [typeFilter, severityFilter, statusFilter].filter(f => f !== "all").length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Tipo",
      "Descrição",
      "Severidade",
      "Status",
      "Data do Incidente",
      "Ação Corretiva"
    ];

    const rows = filteredIncidents.map(inc => [
      inc.id,
      inc.type || "",
      inc.description || "",
      inc.severity || "",
      STATUS_LABELS[inc.status] || inc.status || "",
      new Date(inc.reported_at).toLocaleString('pt-BR'),
      inc.corrective_action || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `incidentes-sgso-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleEdit = (incident: SGSOIncident) => {
    setEditingIncident(incident);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!incidentToDelete) return;

    try {
      const response = await fetch(`/api/sgso/incidents/${incidentToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Incidente excluído com sucesso!");
        fetchIncidents();
      } else {
        toast.error("Erro ao excluir incidente");
      }
    } catch (error) {
      console.error("Error deleting incident:", error);
      toast.error("Erro ao excluir incidente");
    } finally {
      setDeleteDialogOpen(false);
      setIncidentToDelete(null);
    }
  };

  const confirmDelete = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingIncident(null);
  };

  const handleFormSave = () => {
    fetchIncidents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando incidentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Incidentes SGSO</h2>
          <p className="text-muted-foreground mt-1">
            {filteredIncidents.length} de {incidents.length} incidentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Incidente
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} ativo(s)</Badge>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Incidente</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as severidades</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {incidents.length === 0 
                  ? "Nenhum incidente registrado. Clique em 'Novo Incidente' para começar."
                  : "Nenhum incidente encontrado com os filtros selecionados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="border-l-4 border-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{incident.type}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(incident.reported_at).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge className={SEVERITY_COLORS[incident.severity] || 'bg-gray-600'}>
                    {incident.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">{incident.description}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">
                    Status: {STATUS_LABELS[incident.status] || incident.status}
                  </Badge>
                </div>

                {incident.corrective_action && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">Ação Corretiva:</p>
                    <p className="text-xs text-gray-600 mt-1">{incident.corrective_action}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(incident)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(incident.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      <SGSOIncidentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        incident={editingIncident}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este incidente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
