import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Ship, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar,
  Users,
  Anchor,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nullToUndefined } from "@/lib/type-helpers";

interface Vessel {
  id: string;
  name: string;
  vessel_type: string;
  imo_number?: string;
  flag_state: string;
  gross_tonnage?: number;
  built_year?: number;
  classification_society?: string;
  status: string;
  current_location?: string;
  crew_capacity?: number;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

interface VesselFormData {
  name: string;
  vessel_type: string;
  imo_number: string;
  flag_state: string;
  gross_tonnage: number;
  built_year: number;
  classification_society: string;
  status: string;
  current_location: string;
  crew_capacity: number;
}

const initialFormData: VesselFormData = {
  name: "",
  vessel_type: "",
  imo_number: "",
  flag_state: "",
  gross_tonnage: 0,
  built_year: new Date().getFullYear(),
  classification_society: "",
  status: "active",
  current_location: "",
  crew_capacity: 0
};

export function VesselManagement() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mappedVessels: Vessel[] = (data || []).map(v => ({
        id: v.id,
        name: v.name,
        vessel_type: v.vessel_type,
        imo_number: nullToUndefined(v.imo_number),
        flag_state: v.flag_state,
        gross_tonnage: nullToUndefined(v.gross_tonnage),
        status: v.status || "active",
        current_location: nullToUndefined(v.current_location),
        organization_id: nullToUndefined(v.organization_id),
        created_at: v.created_at || new Date().toISOString(),
        updated_at: v.updated_at || new Date().toISOString()
      }));
      setVessels(mappedVessels);
    } catch (error) {
      toast.error("Erro ao carregar navios");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVessel = async () => {
    try {
      const vesselData = {
        ...formData,
        gross_tonnage: formData.gross_tonnage || null,
        built_year: formData.built_year || null,
        crew_capacity: formData.crew_capacity || null
      };

      if (editingVessel) {
        const { error } = await supabase
          .from("vessels")
          .update(vesselData)
          .eq("id", editingVessel.id);

        if (error) throw error;
        toast.success("Navio atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from("vessels")
          .insert([vesselData]);

        if (error) throw error;
        toast.success("Navio cadastrado com sucesso");
      }

      setDialogOpen(false);
      setEditingVessel(null);
      setFormData(initialFormData);
      fetchVessels();
    } catch (error) {
      toast.error("Erro ao salvar navio");
    }
  };

  const handleDeleteVessel = async (vesselId: string) => {
    if (!confirm("Tem certeza que deseja excluir este navio?")) return;

    try {
      const { error } = await supabase
        .from("vessels")
        .delete()
        .eq("id", vesselId);

      if (error) throw error;
      toast.success("Navio excluído com sucesso");
      fetchVessels();
    } catch (error) {
      toast.error("Erro ao excluir navio");
    }
  };

  const handleEditVessel = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      vessel_type: vessel.vessel_type,
      imo_number: vessel.imo_number || "",
      flag_state: vessel.flag_state,
      gross_tonnage: vessel.gross_tonnage || 0,
      built_year: vessel.built_year || new Date().getFullYear(),
      classification_society: vessel.classification_society || "",
      status: vessel.status,
      current_location: vessel.current_location || "",
      crew_capacity: vessel.crew_capacity || 0
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "maintenance": return "bg-yellow-100 text-yellow-800";
    case "inactive": return "bg-secondary text-secondary-foreground";
    case "dry_dock": return "bg-blue-100 text-blue-800";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active": return <CheckCircle className="w-4 h-4" />;
    case "maintenance": return <AlertTriangle className="w-4 h-4" />;
    case "inactive": return <Clock className="w-4 h-4" />;
    default: return <Ship className="w-4 h-4" />;
    }
  };

  const filteredVessels = vessels.filter(vessel =>
    vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.vessel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vessel.flag_state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Navios</h2>
          <p className="text-muted-foreground">
            Gerencie a frota de embarcações
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingVessel(null); setFormData(initialFormData); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Navio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVessel ? "Editar Navio" : "Novo Navio"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do navio
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Navio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: MV Atlantic Explorer"
                />
              </div>
              <div>
                <Label htmlFor="vessel_type">Tipo</Label>
                <Select value={formData.vessel_type} onValueChange={(value) => setFormData({ ...formData, vessel_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cargo">Cargueiro</SelectItem>
                    <SelectItem value="tanker">Petroleiro</SelectItem>
                    <SelectItem value="container">Porta-contêiner</SelectItem>
                    <SelectItem value="bulk_carrier">Graneleiro</SelectItem>
                    <SelectItem value="passenger">Passageiros</SelectItem>
                    <SelectItem value="offshore">Offshore</SelectItem>
                    <SelectItem value="fishing">Pesqueiro</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="imo_number">Número IMO</Label>
                <Input
                  id="imo_number"
                  value={formData.imo_number}
                  onChange={(e) => setFormData({ ...formData, imo_number: e.target.value })}
                  placeholder="Ex: 1234567"
                />
              </div>
              <div>
                <Label htmlFor="flag_state">Bandeira</Label>
                <Input
                  id="flag_state"
                  value={formData.flag_state}
                  onChange={(e) => setFormData({ ...formData, flag_state: e.target.value })}
                  placeholder="Ex: Brasil"
                />
              </div>
              <div>
                <Label htmlFor="gross_tonnage">Tonelagem Bruta</Label>
                <Input
                  id="gross_tonnage"
                  type="number"
                  value={formData.gross_tonnage}
                  onChange={(e) => setFormData({ ...formData, gross_tonnage: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <Label htmlFor="built_year">Ano de Construção</Label>
                <Input
                  id="built_year"
                  type="number"
                  value={formData.built_year}
                  onChange={(e) => setFormData({ ...formData, built_year: parseInt(e.target.value) || new Date().getFullYear() })}
                  placeholder="Ex: 2020"
                />
              </div>
              <div>
                <Label htmlFor="classification_society">Sociedade Classificadora</Label>
                <Input
                  id="classification_society"
                  value={formData.classification_society}
                  onChange={(e) => setFormData({ ...formData, classification_society: e.target.value })}
                  placeholder="Ex: DNV GL"
                />
              </div>
              <div>
                <Label htmlFor="crew_capacity">Capacidade da Tripulação</Label>
                <Input
                  id="crew_capacity"
                  type="number"
                  value={formData.crew_capacity}
                  onChange={(e) => setFormData({ ...formData, crew_capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 25"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="dry_dock">Dique Seco</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="current_location">Localização Atual</Label>
                <Input
                  id="current_location"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  placeholder="Ex: Porto de Santos"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveVessel}>
                {editingVessel ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar navios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Vessels Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Ship className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground mt-2">Carregando navios...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVessels.map((vessel) => (
            <Card key={vessel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Ship className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{vessel.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditVessel(vessel)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteVessel(vessel.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(vessel.status)}>
                      {getStatusIcon(vessel.status)}
                      <span className="ml-1">
                        {vessel.status === "active" && "Ativo"}
                        {vessel.status === "maintenance" && "Manutenção"}
                        {vessel.status === "inactive" && "Inativo"}
                        {vessel.status === "dry_dock" && "Dique Seco"}
                      </span>
                    </Badge>
                    <Badge variant="outline">{vessel.vessel_type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Anchor className="w-3 h-3 mr-1" />
                      {vessel.flag_state}
                    </div>
                    {vessel.imo_number && (
                      <div className="flex items-center text-muted-foreground">
                        <span className="font-mono">IMO: {vessel.imo_number}</span>
                      </div>
                    )}
                    {vessel.gross_tonnage && (
                      <div className="flex items-center text-muted-foreground">
                        <span>{vessel.gross_tonnage.toLocaleString()} GT</span>
                      </div>
                    )}
                    {vessel.built_year && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {vessel.built_year}
                      </div>
                    )}
                    {vessel.crew_capacity && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {vessel.crew_capacity}
                      </div>
                    )}
                    {vessel.current_location && (
                      <div className="flex items-center text-muted-foreground col-span-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vessel.current_location}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredVessels.length === 0 && !loading && (
        <div className="text-center py-12">
          <Ship className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum navio encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum navio corresponde à sua busca." : "Comece cadastrando o primeiro navio."}
          </p>
        </div>
      )}
    </div>
  );
}