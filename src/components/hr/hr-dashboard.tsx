import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MetricCard as StatsCard } from "@/components/ui/MetricCard";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificateManager } from "./certificate-manager";
import { CertificateAlerts } from "./certificate-alerts";
import { RotationPlanningDialog } from "@/components/dialogs/RotationPlanningDialog";
import { useToast } from "@/hooks/use-toast";
import { useHRDashboardData, type HREmployee } from "@/hooks/useHRDashboardData";
import { Loader2 } from "lucide-react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Calendar,
  Award,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Star,
  UserMinus,
  Trash2,
  FileText,
  RefreshCw,
  Eye as EyeIcon
} from "lucide-react";

// Map from DB format to component format
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  startDate: string;
  status: "active" | "vacation" | "travel" | "inactive";
  certifications: string[];
  rating: number;
  avatar?: string;
}

function mapHREmployeeToEmployee(hrEmployee: HREmployee): Employee {
  return {
    id: hrEmployee.id,
    name: hrEmployee.name,
    position: hrEmployee.position,
    department: hrEmployee.rank,
    email: hrEmployee.email || '',
    phone: hrEmployee.phone || '',
    location: hrEmployee.nationality || '',
    startDate: hrEmployee.join_date || new Date().toISOString().split('T')[0],
    status: hrEmployee.status === 'on_leave' ? 'vacation' : 
            hrEmployee.status === 'training' ? 'travel' : 
            hrEmployee.status === 'available' ? 'inactive' : 'active',
    certifications: [],
    rating: 4.5,
  };
}

export const HRDashboard = () => {
  const { toast } = useToast();
  const { employees: hrEmployees, stats, isLoading, error, refetch } = useHRDashboardData();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showTable, setShowTable] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [employeeProfileOpen, setEmployeeProfileOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
  const [certificateManagerOpen, setCertificateManagerOpen] = useState(false);
  const [selectedEmployeeForCertificates, setSelectedEmployeeForCertificates] = useState<Employee | null>(null);
  const [rotationDialogOpen, setRotationDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    location: "",
    status: "active",
    certifications: [],
    rating: 0
  });

  // Sync from hook data
  useEffect(() => {
    if (hrEmployees.length > 0) {
      setEmployees(hrEmployees.map(mapHREmployeeToEmployee));
    }
  }, [hrEmployees]);

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleStatusChange = (employeeId: string, newStatus: Employee["status"]) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, status: newStatus } : emp
    ));
  };

  const handleCreateEmployee = () => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.department || !newEmployee.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const id = (employees.length + 1).toString().padStart(3, "0");
    const employee: Employee = {
      id,
      name: newEmployee.name || "",
      position: newEmployee.position || "",
      department: newEmployee.department || "",
      email: newEmployee.email || "",
      phone: newEmployee.phone || "",
      location: newEmployee.location || "",
      startDate: new Date().toISOString().split("T")[0],
      status: newEmployee.status || "active",
      certifications: newEmployee.certifications || [],
      rating: 0
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployeeOpen(false);
    setNewEmployee({
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      location: "",
      status: "active",
      certifications: [],
      rating: 0
    });

    toast({
      title: "Sucesso",
      description: `${employee.name} foi adicionado à equipe`
    });
  };

  const handleRemoveEmployee = () => {
    if (!employeeToRemove) return;
    
    setEmployees(prev => prev.filter(emp => emp.id !== employeeToRemove.id));
    toast({
      title: "Funcionário Removido",
      description: `${employeeToRemove.name} foi removido da equipe`
    });
    setEmployeeToRemove(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(e => e.department))];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
      active: { label: "Ativo", variant: "success" },
      vacation: { label: "Férias", variant: "warning" },
      travel: { label: "Viagem", variant: "default" },
      inactive: { label: "Inativo", variant: "destructive" }
    };
    const { label, variant } = variants[status] || { label: status, variant: "default" as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true
    },
    {
      key: "position",
      header: "Cargo",
      sortable: true
    },
    {
      key: "department",
      header: "Departamento",
      sortable: true
    },
    {
      key: "status",
      header: "Status",
      render: (_value: unknown, row: Employee) => getStatusBadge(row.status)
    },
    {
      key: "id",
      header: "Ações",
      render: (_value: unknown, row: Employee) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmployee(row);
              setEmployeeProfileOpen(true);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmployeeForCertificates(row);
              setCertificateManagerOpen(true);
            }}
          >
            <Award className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEmployeeToRemove(row);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados de RH...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Erro ao carregar dados: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Colaboradores"
          value={stats?.totalCrew || employees.length}
          icon={Users}
          description="Funcionários ativos"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Em Embarque"
          value={stats?.activeOnboard || employees.filter(e => e.status === "active").length}
          icon={Briefcase}
          description="Tripulantes a bordo"
        />
        <StatsCard
          title="De Folga"
          value={stats?.onLeave || employees.filter(e => e.status === "vacation").length}
          icon={Calendar}
          description="Em férias ou licença"
        />
        <StatsCard
          title="Contratos Vencendo"
          value={stats?.contractsEndingSoon || 0}
          icon={FileText}
          description="Próximos 30 dias"
          trend={{ value: stats?.contractsEndingSoon || 0, isPositive: false }}
        />
      </div>

      {/* Certificate Alerts */}
      <CertificateAlerts />

      {/* Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setShowTable(!showTable)}>
              {showTable ? "Cards" : "Tabela"}
            </Button>
            <Button variant="outline" onClick={() => setRotationDialogOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotação
            </Button>
            <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo funcionário
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Departamento *</Label>
                    <Input
                      id="department"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={newEmployee.location}
                      onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewEmployeeOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateEmployee}>Criar Colaborador</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Employee List */}
      {showTable ? (
        <DataTable
          data={filteredEmployees}
          columns={columns}
          searchable
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                {getStatusBadge(employee.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{employee.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(employee.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">
                  {employee.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setEmployeeProfileOpen(true);
                  }}
                >
                  Ver Perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployeeForCertificates(employee);
                    setCertificateManagerOpen(true);
                  }}
                >
                  <Award className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Employee Profile Dialog */}
      <Dialog open={employeeProfileOpen} onOpenChange={setEmployeeProfileOpen}>
        <DialogContent className="max-w-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Perfil do Colaborador</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                    <p className="text-muted-foreground">{selectedEmployee.position}</p>
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Departamento</Label>
                    <p className="font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data de Início</Label>
                    <p className="font-medium">{new Date(selectedEmployee.startDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{selectedEmployee.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Localização</Label>
                    <p className="font-medium">{selectedEmployee.location || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Avaliação</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(selectedEmployee.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1">{selectedEmployee.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Certificações</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployee.certifications.length > 0 ? (
                      selectedEmployee.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Nenhuma certificação registrada</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={selectedEmployee.status}
                    onValueChange={(value) => {
                      handleStatusChange(selectedEmployee.id, value as Employee["status"]);
                      setSelectedEmployee({ ...selectedEmployee, status: value as Employee["status"] });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Alterar Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="vacation">Férias</SelectItem>
                      <SelectItem value="travel">Viagem</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEmployeeForCertificates(selectedEmployee);
                      setCertificateManagerOpen(true);
                      setEmployeeProfileOpen(false);
                    }}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Gerenciar Certificações
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Employee Dialog */}
      <AlertDialog open={!!employeeToRemove} onOpenChange={(open) => !open && setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {employeeToRemove?.name} da equipe?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveEmployee} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Certificate Manager Dialog */}
      <Dialog open={certificateManagerOpen} onOpenChange={setCertificateManagerOpen}>
        <DialogContent className="max-w-4xl">
          {selectedEmployeeForCertificates && (
            <CertificateManager
              employee={{ id: selectedEmployeeForCertificates.id, name: selectedEmployeeForCertificates.name }}
              onClose={() => setCertificateManagerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rotation Planning Dialog */}
      <RotationPlanningDialog
        open={rotationDialogOpen}
        onOpenChange={setRotationDialogOpen}
      />
    </div>
  );
};
