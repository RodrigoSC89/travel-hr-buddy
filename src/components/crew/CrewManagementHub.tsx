/**
 * Crew Management Hub - PATCH 853
 * Full CRUD for crew members with contract and assignment management
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Ship,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vesselId: string;
  vesselName: string;
  nationality: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  contractStart: string;
  contractEnd: string;
  status: "active" | "on_leave" | "off_duty" | "training" | "terminated";
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: {
    passport: string;
    seamanBook: string;
    medicalCert: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_CREW: CrewMember[] = [
  {
    id: "crew-001",
    name: "Carlos Alberto Silva",
    rank: "Captain",
    department: "Deck",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    nationality: "Brazilian",
    dateOfBirth: "1975-03-15",
    email: "carlos.silva@nautione.com",
    phone: "+55 21 99999-1234",
    address: "Rua das Palmeiras, 123 - Rio de Janeiro, RJ",
    contractStart: "2024-01-15",
    contractEnd: "2025-01-14",
    status: "active",
    emergencyContact: {
      name: "Maria Silva",
      relationship: "Spouse",
      phone: "+55 21 98888-5678",
    },
    documents: {
      passport: "BR12345678",
      seamanBook: "SB-2024-001",
      medicalCert: "MED-2024-001",
    },
    notes: "Experienced captain with 20+ years at sea",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "crew-002",
    name: "João Pedro Santos",
    rank: "Chief Officer",
    department: "Deck",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    nationality: "Brazilian",
    dateOfBirth: "1985-07-22",
    email: "joao.santos@nautione.com",
    phone: "+55 21 97777-4321",
    address: "Av. Brasil, 456 - Niterói, RJ",
    contractStart: "2024-02-01",
    contractEnd: "2024-08-01",
    status: "active",
    emergencyContact: {
      name: "Ana Santos",
      relationship: "Mother",
      phone: "+55 21 96666-8765",
    },
    documents: {
      passport: "BR87654321",
      seamanBook: "SB-2024-002",
      medicalCert: "MED-2024-002",
    },
    notes: "Preparing for Master certification",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "crew-003",
    name: "Roberto Ferreira",
    rank: "Chief Engineer",
    department: "Engine",
    vesselId: "v-002",
    vesselName: "MV Pacific Voyager",
    nationality: "Portuguese",
    dateOfBirth: "1978-11-08",
    email: "roberto.ferreira@nautione.com",
    phone: "+351 912 345 678",
    address: "Rua do Porto, 789 - Lisboa, Portugal",
    contractStart: "2024-03-01",
    contractEnd: "2024-09-01",
    status: "on_leave",
    emergencyContact: {
      name: "Teresa Ferreira",
      relationship: "Spouse",
      phone: "+351 913 456 789",
    },
    documents: {
      passport: "PT98765432",
      seamanBook: "SB-PT-2024-001",
      medicalCert: "MED-PT-2024-001",
    },
    notes: "On approved leave until March 15",
    createdAt: "2024-02-15T09:00:00Z",
    updatedAt: "2024-03-01T11:00:00Z",
  },
];

const RANKS = [
  "Captain",
  "Chief Officer",
  "Second Officer",
  "Third Officer",
  "Chief Engineer",
  "Second Engineer",
  "Third Engineer",
  "Bosun",
  "AB Seaman",
  "OS Seaman",
  "Oiler",
  "Wiper",
  "Cook",
  "Steward",
  "Cadet",
];

const DEPARTMENTS = ["Deck", "Engine", "Catering", "Safety", "Administration"];

const VESSELS = [
  { id: "v-001", name: "MV Atlantic Star" },
  { id: "v-002", name: "MV Pacific Voyager" },
  { id: "v-003", name: "MV Indian Explorer" },
];

export function CrewManagementHub() {
  const [crew, setCrew] = useState<CrewMember[]>(INITIAL_CREW);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [activeTab, setActiveTab] = useState("roster");

  const [formData, setFormData] = useState({
    name: "",
    rank: "",
    department: "",
    vesselId: "",
    nationality: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    address: "",
    contractStart: "",
    contractEnd: "",
    status: "active" as CrewMember["status"],
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    passport: "",
    seamanBook: "",
    medicalCert: "",
    notes: "",
  });

  const filteredCrew = useMemo(() => {
    return crew.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "all" || member.department === departmentFilter;
      const matchesVessel =
        vesselFilter === "all" || member.vesselId === vesselFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesVessel;
    });
  }, [crew, searchTerm, statusFilter, departmentFilter, vesselFilter]);

  const stats = useMemo(() => {
    return {
      total: crew.length,
      active: crew.filter((c) => c.status === "active").length,
      onLeave: crew.filter((c) => c.status === "on_leave").length,
      offDuty: crew.filter((c) => c.status === "off_duty").length,
      training: crew.filter((c) => c.status === "training").length,
    };
  }, [crew]);

  const resetForm = () => {
    setFormData({
      name: "",
      rank: "",
      department: "",
      vesselId: "",
      nationality: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      address: "",
      contractStart: "",
      contractEnd: "",
      status: "active",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      passport: "",
      seamanBook: "",
      medicalCert: "",
      notes: "",
    });
    setEditingMember(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (member: CrewMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      rank: member.rank,
      department: member.department,
      vesselId: member.vesselId,
      nationality: member.nationality,
      dateOfBirth: member.dateOfBirth,
      email: member.email,
      phone: member.phone,
      address: member.address,
      contractStart: member.contractStart,
      contractEnd: member.contractEnd,
      status: member.status,
      emergencyContactName: member.emergencyContact.name,
      emergencyContactRelationship: member.emergencyContact.relationship,
      emergencyContactPhone: member.emergencyContact.phone,
      passport: member.documents.passport,
      seamanBook: member.documents.seamanBook,
      medicalCert: member.documents.medicalCert,
      notes: member.notes,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.rank || !formData.vesselId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const vessel = VESSELS.find((v) => v.id === formData.vesselId);
    const now = new Date().toISOString();

    if (editingMember) {
      setCrew((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                name: formData.name,
                rank: formData.rank,
                department: formData.department,
                vesselId: formData.vesselId,
                vesselName: vessel?.name || "",
                nationality: formData.nationality,
                dateOfBirth: formData.dateOfBirth,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                contractStart: formData.contractStart,
                contractEnd: formData.contractEnd,
                status: formData.status,
                emergencyContact: {
                  name: formData.emergencyContactName,
                  relationship: formData.emergencyContactRelationship,
                  phone: formData.emergencyContactPhone,
                },
                documents: {
                  passport: formData.passport,
                  seamanBook: formData.seamanBook,
                  medicalCert: formData.medicalCert,
                },
                notes: formData.notes,
                updatedAt: now,
              }
            : m
        )
      );
      toast.success("Tripulante atualizado com sucesso");
    } else {
      const newMember: CrewMember = {
        id: `crew-${Date.now()}`,
        name: formData.name,
        rank: formData.rank,
        department: formData.department,
        vesselId: formData.vesselId,
        vesselName: vessel?.name || "",
        nationality: formData.nationality,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        contractStart: formData.contractStart,
        contractEnd: formData.contractEnd,
        status: formData.status,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        },
        documents: {
          passport: formData.passport,
          seamanBook: formData.seamanBook,
          medicalCert: formData.medicalCert,
        },
        notes: formData.notes,
        createdAt: now,
        updatedAt: now,
      };
      setCrew((prev) => [...prev, newMember]);
      toast.success("Tripulante cadastrado com sucesso");
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este tripulante?")) {
      setCrew((prev) => prev.filter((m) => m.id !== id));
      toast.success("Tripulante removido");
    }
  };

  const handleStatusChange = (id: string, newStatus: CrewMember["status"]) => {
    setCrew((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: newStatus, updatedAt: new Date().toISOString() }
          : m
      )
    );
    toast.success(`Status atualizado para ${newStatus}`);
  };

  const getStatusBadge = (status: CrewMember["status"]) => {
    const config = {
      active: { label: "Ativo", variant: "default" as const, icon: UserCheck },
      on_leave: { label: "Licença", variant: "secondary" as const, icon: Clock },
      off_duty: { label: "Folga", variant: "outline" as const, icon: UserX },
      training: { label: "Treinamento", variant: "secondary" as const, icon: Award },
      terminated: { label: "Desligado", variant: "destructive" as const, icon: UserX },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Posto", "Departamento", "Embarcação", "Status", "Email", "Telefone"];
    const rows = filteredCrew.map((m) => [
      m.name,
      m.rank,
      m.department,
      m.vesselName,
      m.status,
      m.email,
      m.phone,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripulacao_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exportação concluída");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestão de Tripulação
          </h2>
          <p className="text-muted-foreground">
            Cadastro completo e gerenciamento de tripulantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tripulante
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-info">{stats.onLeave}</div>
            <p className="text-sm text-muted-foreground">Licença</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-warning">{stats.offDuty}</div>
            <p className="text-sm text-muted-foreground">Folga</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-accent-foreground">{stats.training}</div>
            <p className="text-sm text-muted-foreground">Treinamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, posto ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="on_leave">Licença</SelectItem>
                <SelectItem value="off_duty">Folga</SelectItem>
                <SelectItem value="training">Treinamento</SelectItem>
                <SelectItem value="terminated">Desligado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Dept.</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Embarcações</SelectItem>
                {VESSELS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDepartmentFilter("all");
                setVesselFilter("all");
              }}
              aria-label="Limpar filtros"
              title="Limpar filtros"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crew List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tripulantes ({filteredCrew.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredCrew.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.rank} • {member.department}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ship className="h-3 w-3" />
                        {member.vesselName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(member.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Mais opções" title="Mais opções">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDetailOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditForm(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              member.id,
                              member.status === "active" ? "on_leave" : "active"
                            )
                          }
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Alterar Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {filteredCrew.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum tripulante encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Tripulante" : "Novo Tripulante"}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="personal" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              <TabsTrigger value="contract">Contrato</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="emergency">Emergência</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nome completo do tripulante"
                  />
                </div>
                <div>
                  <Label>Posto/Função *</Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, rank: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {RANKS.map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, department: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nacionalidade</Label>
                  <Input
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nationality: e.target.value,
                      }))
                    }
                    placeholder="Nacionalidade"
                  />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+55 21 99999-9999"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Embarcação *</Label>
                  <Select
                    value={formData.vesselId}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, vesselId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {VESSELS.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: v as CrewMember["status"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="on_leave">Licença</SelectItem>
                      <SelectItem value="off_duty">Folga</SelectItem>
                      <SelectItem value="training">Treinamento</SelectItem>
                      <SelectItem value="terminated">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Início do Contrato</Label>
                  <Input
                    type="date"
                    value={formData.contractStart}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contractStart: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Fim do Contrato</Label>
                  <Input
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contractEnd: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Observações sobre o tripulante..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Passaporte</Label>
                  <Input
                    value={formData.passport}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passport: e.target.value,
                      }))
                    }
                    placeholder="Número do passaporte"
                  />
                </div>
                <div>
                  <Label>Caderneta de Marítimo</Label>
                  <Input
                    value={formData.seamanBook}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seamanBook: e.target.value,
                      }))
                    }
                    placeholder="Número da caderneta"
                  />
                </div>
                <div>
                  <Label>Certificado Médico</Label>
                  <Input
                    value={formData.medicalCert}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        medicalCert: e.target.value,
                      }))
                    }
                    placeholder="Número do certificado médico"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Nome do Contato de Emergência</Label>
                  <Input
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContactName: e.target.value,
                      }))
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label>Parentesco/Relação</Label>
                  <Input
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContactRelationship: e.target.value,
                      }))
                    }
                    placeholder="Ex: Cônjuge, Mãe, Pai"
                  />
                </div>
                <div>
                  <Label>Telefone de Emergência</Label>
                  <Input
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContactPhone: e.target.value,
                      }))
                    }
                    placeholder="+55 21 99999-9999"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMember ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Tripulante</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {selectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedMember.rank} • {selectedMember.department}
                  </p>
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.vesselName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.nationality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Contrato: {selectedMember.contractStart} a{" "}
                    {selectedMember.contractEnd}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contato de Emergência</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.emergencyContact.name} (
                  {selectedMember.emergencyContact.relationship})
                  <br />
                  {selectedMember.emergencyContact.phone}
                </p>
              </div>

              {selectedMember.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Observações</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CrewManagementHub;
