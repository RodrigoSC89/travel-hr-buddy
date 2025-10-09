import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificateManager } from "./certificate-manager";
import { CertificateAlerts } from "./certificate-alerts";
import { useToast } from "@/hooks/use-toast";
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
  FileText
} from "lucide-react";

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

const mockEmployees: Employee[] = [
  {
    id: "001",
    name: "Ana Silva",
    position: "Gerente de Operações",
    department: "Operações",
    email: "ana.silva@nautilus.com",
    phone: "+55 11 99999-9999",
    location: "São Paulo, SP",
    startDate: "2022-03-15",
    status: "active",
    certifications: ["STCW Basic Safety", "DP Certificate", "Leadership"],
    rating: 4.8
  },
  {
    id: "002",
    name: "Carlos Santos",
    position: "Especialista em Viagens",
    department: "Travel Management",
    email: "carlos.santos@nautilus.com",
    phone: "+55 21 88888-8888",
    location: "Rio de Janeiro, RJ",
    startDate: "2021-07-20",
    status: "travel",
    certifications: ["IATA Certified", "Corporate Travel", "GDS Expert"],
    rating: 4.6
  },
  {
    id: "003",
    name: "Marina Costa",
    position: "Analista de RH",
    department: "Recursos Humanos",
    email: "marina.costa@nautilus.com",
    phone: "+55 85 77777-7777",
    location: "Fortaleza, CE",
    startDate: "2023-01-10",
    status: "vacation",
    certifications: ["HR Management", "Recruitment Specialist"],
    rating: 4.9
  },
  {
    id: "004",
    name: "Roberto Lima",
    position: "Coordenador de Hospedagem",
    department: "Accommodation",
    email: "roberto.lima@nautilus.com",
    phone: "+55 71 66666-6666",
    location: "Salvador, BA",
    startDate: "2020-11-05",
    status: "active",
    certifications: ["Hotel Management", "Revenue Management", "Customer Service"],
    rating: 4.7
  }
];

export const HRDashboard = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
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

    const employee: Employee = {
      id: `EMP${(employees.length + 1).toString().padStart(3, "0")}`,
      name: newEmployee.name!,
      position: newEmployee.position!,
      department: newEmployee.department!,
      email: newEmployee.email!,
      phone: newEmployee.phone || "",
      location: newEmployee.location || "",
      startDate: new Date().toISOString().split("T")[0],
      status: newEmployee.status as Employee["status"] || "active",
      certifications: newEmployee.certifications || [],
      rating: newEmployee.rating || 4.0
    };

    setEmployees(prev => [...prev, employee]);
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
    setNewEmployeeOpen(false);
    
    toast({
      title: "Funcionário criado",
      description: `${employee.name} foi adicionado ao sistema`,
    });
  };

  const handleOpenCertificates = (employee: Employee) => {
    setSelectedEmployeeForCertificates(employee);
    setCertificateManagerOpen(true);
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeProfileOpen(true);
  };

  const handleRemoveEmployee = (employee: Employee) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
    setEmployeeToRemove(null);
    toast({
      title: "Funcionário removido",
      description: `${employee.name} foi removido do sistema`,
    });
  };

  // Colunas para a tabela de funcionários
  const employeeColumns: Column[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full gradient-ocean flex items-center justify-center text-azure-50 font-bold text-sm">
            {value.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.position}</div>
          </div>
        </div>
      )
    },
    {
      key: "department",
      header: "Departamento",
      sortable: true
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge 
          className={
            value === "active" ? "bg-success/10 text-success border-success/20" :
              value === "vacation" ? "bg-warning/10 text-warning border-warning/20" :
                value === "travel" ? "bg-info/10 text-info border-info/20" :
                  "bg-muted text-muted-foreground border-muted"
          }
        >
          {value === "active" ? "Ativo" :
            value === "vacation" ? "Férias" :
              value === "travel" ? "Viagem" : "Inativo"}
        </Badge>
      )
    },
    {
      key: "rating",
      header: "Avaliação",
      align: "center" as const,
      render: (value) => (
        <div className="flex items-center justify-center">
          <Star size={16} className="mr-1 text-warning" fill="currentColor" />
          {value}
        </div>
      )
    },
    {
      key: "certifications",
      header: "Certificações",
      align: "center" as const,
      render: (value) => (
        <div className="flex items-center justify-center">
          <Award size={16} className="mr-1 text-primary" />
          {value.length}
        </div>
      )
    },
    {
      key: "location",
      header: "Localização",
      sortable: true
    }
  ];

  const stats = [
    {
      title: "Total de Funcionários",
      value: employees.length.toString(),
      icon: Users,
      change: { value: 5, type: "increase" as const },
      variant: "ocean" as const
    },
    {
      title: "Funcionários Ativos",
      value: employees.filter(e => e.status === "active").length.toString(),
      icon: Briefcase,
      variant: "success" as const
    },
    {
      title: "Em Viagem",
      value: employees.filter(e => e.status === "travel").length.toString(),
      icon: MapPin,
      variant: "warning" as const
    },
    {
      title: "Média de Avaliação",
      value: (employees.reduce((acc, emp) => acc + emp.rating, 0) / employees.length).toFixed(1),
      icon: Star,
      variant: "default" as const
    }
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
    case "active": return "bg-success text-azure-50";
    case "vacation": return "bg-warning text-azure-900";
    case "travel": return "bg-info text-azure-50";
    case "inactive": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Employee["status"]) => {
    switch (status) {
    case "active": return "Ativo";
    case "vacation": return "Férias";
    case "travel": return "Viagem";
    case "inactive": return "Inativo";
    default: return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Recursos Humanos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de funcionários e competências
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setShowTable(!showTable)}
            className={showTable ? "bg-accent" : ""}
          >
            {showTable ? "Ver Cards" : "Ver Tabela"}
          </Button>
          <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-ocean">
                <UserPlus className="mr-2" size={18} />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Novo Funcionário</DialogTitle>
                <DialogDescription>
                  Adicione um novo funcionário ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome *
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name || ""}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Cargo *
                  </Label>
                  <Input
                    id="position"
                    value={newEmployee.position || ""}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Departamento *
                  </Label>
                  <Select value={newEmployee.department || ""} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operações">Operações</SelectItem>
                      <SelectItem value="Travel Management">Travel Management</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email || ""}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone || ""}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Localização
                  </Label>
                  <Input
                    id="location"
                    value={newEmployee.location || ""}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, location: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateEmployee}>
                  Criar Funcionário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Certificate Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CertificateAlerts />
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-muted-foreground" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Employee Content */}
      {showTable ? (
        <DataTable
          data={filteredEmployees}
          columns={employeeColumns}
          title="Lista de Funcionários"
          description="Gestão completa da equipe"
          searchable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
          actions={{
            view: (employee) => handleViewProfile(employee),
            edit: (employee) => handleViewProfile(employee),
            delete: (employee) => setEmployeeToRemove(employee)
          }}
          onRowClick={(employee) => handleViewProfile(employee)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6 hover:shadow-nautical transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full gradient-ocean flex items-center justify-center text-azure-50 font-bold text-lg">
                    {employee.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(employee.status)}>
                  {getStatusLabel(employee.status)}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase size={16} className="mr-2" />
                  {employee.department}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail size={16} className="mr-2" />
                  {employee.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone size={16} className="mr-2" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin size={16} className="mr-2" />
                  {employee.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar size={16} className="mr-2" />
                  Desde {new Date(employee.startDate).toLocaleDateString("pt-BR")}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="text-warning mr-1" size={16} fill="currentColor" />
                  <span className="font-semibold">{employee.rating}</span>
                  <span className="text-muted-foreground text-sm ml-1">/5.0</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Award size={16} className="mr-1" />
                  {employee.certifications.length} certificações
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Certificações:</p>
                <div className="flex flex-wrap gap-1">
                  {employee.certifications.slice(0, 2).map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {employee.certifications.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.certifications.length - 2} mais
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProfile(employee)}
                >
                  Ver Perfil
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => handleOpenCertificates(employee)}
                >
                  <FileText size={16} />
                </Button>
                <Button 
                  size="sm" 
                  className={`flex-1 ${
                    selectedEmployees.includes(employee.id) ? "bg-success hover:bg-success/90" : "gradient-ocean"
                  }`}
                  onClick={() => handleEmployeeSelect(employee.id)}
                >
                  {selectedEmployees.includes(employee.id) ? "Selecionado ✓" : "Selecionar"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserMinus size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{employee.name}</strong> do sistema? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleRemoveEmployee(employee)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No results */}
      {filteredEmployees.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">Nenhum funcionário encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca
          </p>
        </Card>
      )}

      {/* Employee Profile Dialog */}
      <Dialog open={employeeProfileOpen} onOpenChange={setEmployeeProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil do Funcionário</DialogTitle>
            <DialogDescription>
              Informações detalhadas do funcionário
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full gradient-ocean flex items-center justify-center text-azure-50 font-bold text-xl">
                  {selectedEmployee.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <Badge className={getStatusColor(selectedEmployee.status)}>
                    {getStatusLabel(selectedEmployee.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações de Contato</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-muted-foreground" />
                      {selectedEmployee.email}
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-muted-foreground" />
                      {selectedEmployee.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-muted-foreground" />
                      {selectedEmployee.location}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informações Profissionais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Briefcase size={16} className="mr-2 text-muted-foreground" />
                      {selectedEmployee.department}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-muted-foreground" />
                      Desde {new Date(selectedEmployee.startDate).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <Star size={16} className="mr-2 text-warning" fill="currentColor" />
                      {selectedEmployee.rating}/5.0
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Certificações ({selectedEmployee.certifications.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeProfileOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast({
                title: "Edição em desenvolvimento",
                description: "Funcionalidade de edição será implementada em breve",
              });
            }}>
              Editar Funcionário
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Funcionário
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover <strong>{selectedEmployee?.name}</strong> do sistema? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      if (selectedEmployee) {
                        handleRemoveEmployee(selectedEmployee);
                        setEmployeeProfileOpen(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Employee Confirmation Dialog */}
      <AlertDialog open={!!employeeToRemove} onOpenChange={() => setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{employeeToRemove?.name}</strong> do sistema? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => employeeToRemove && handleRemoveEmployee(employeeToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Certificate Manager */}
      {certificateManagerOpen && selectedEmployeeForCertificates && (
        <CertificateManager 
          employee={selectedEmployeeForCertificates} 
          onClose={() => {
            setCertificateManagerOpen(false);
            setSelectedEmployeeForCertificates(null);
          }} 
        />
      )}
    </div>
  );
};