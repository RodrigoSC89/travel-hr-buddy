import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Search,
  Filter,
  Users,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Star,
  Award,
  Calendar,
  Edit,
  Trash2,
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
  salary?: number;
  manager?: string;
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
    rating: 4.8,
    salary: 12000,
    manager: "Carlos Santos",
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
    rating: 4.6,
    salary: 8500,
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
    rating: 4.9,
    salary: 7000,
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
    rating: 4.7,
    salary: 9000,
  },
];

export const EmployeeManagement = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewingEmployee, setIsViewingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    location: "",
    status: "active",
    certifications: [],
    rating: 4.0,
    salary: 0,
  });

  const handleCreateEmployee = () => {
    if (
      !newEmployee.name ||
      !newEmployee.position ||
      !newEmployee.department ||
      !newEmployee.email
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
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
      status: (newEmployee.status as Employee["status"]) || "active",
      certifications: newEmployee.certifications || [],
      rating: newEmployee.rating || 4.0,
      salary: newEmployee.salary || 0,
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
      rating: 4.0,
      salary: 0,
    });
    setIsCreatingEmployee(false);

    toast({
      title: "Funcionário criado",
      description: `${employee.name} foi adicionado ao sistema`,
    });
  };

  const handleRemoveEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast({
      title: "Funcionário removido",
      description: `${employee?.name} foi removido do sistema`,
    });
  };

  const handleStatusChange = (employeeId: string, newStatus: Employee["status"]) => {
    setEmployees(prev =>
      prev.map(emp => (emp.id === employeeId ? { ...emp, status: newStatus } : emp))
    );
    toast({
      title: "Status atualizado",
      description: "Status do funcionário foi alterado com sucesso",
    });
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "vacation":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "travel":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "inactive":
      return "bg-secondary text-secondary-foreground border-border";
    default:
      return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getStatusLabel = (status: Employee["status"]) => {
    switch (status) {
    case "active":
      return "Ativo";
    case "vacation":
      return "Férias";
    case "travel":
      return "Viagem";
    case "inactive":
      return "Inativo";
    default:
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Funcionários</h2>
          <p className="text-muted-foreground">
            Administre informações e performance dos colaboradores
          </p>
        </div>
        <Dialog open={isCreatingEmployee} onOpenChange={setIsCreatingEmployee}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 w-4 h-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome *
                </Label>
                <Input
                  id="name"
                  value={newEmployee.name || ""}
                  onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={e => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Departamento *
                </Label>
                <Select
                  value={newEmployee.department || ""}
                  onValueChange={value => setNewEmployee(prev => ({ ...prev, department: value }))}
                >
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
                  onChange={e => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
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
                  onChange={e => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
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
                  onChange={e => setNewEmployee(prev => ({ ...prev, location: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary" className="text-right">
                  Salário (R$)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={newEmployee.salary || ""}
                  onChange={e =>
                    setNewEmployee(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingEmployee(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEmployee}>Criar Funcionário</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-muted-foreground" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="travel">Viagem</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Employees Grid */}
      <div className="grid gap-4">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-azure-50 font-bold text-lg">
                      {employee.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{employee.name}</h3>
                      <p className="text-muted-foreground">{employee.position}</p>
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {employee.department}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {employee.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {employee.phone || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {employee.location}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Desde {new Date(employee.startDate).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{employee.rating}</span>
                        <Award className="w-4 h-4 text-blue-500 ml-2" />
                        <span className="text-muted-foreground">
                          {employee.certifications.length} cert.
                        </span>
                      </div>
                    </div>
                  </div>

                  {employee.salary && (
                    <div className="mt-3">
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        R$ {employee.salary.toLocaleString()}/mês
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4 md:mt-0">
                  <Select
                    value={employee.status}
                    onValueChange={value =>
                      handleStatusChange(employee.id, value as Employee["status"])
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="vacation">Férias</SelectItem>
                      <SelectItem value="travel">Viagem</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsViewingEmployee(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveEmployee(employee.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Details Dialog */}
      <Dialog open={isViewingEmployee} onOpenChange={setIsViewingEmployee}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Funcionário</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-azure-50 font-bold text-xl">
                  {selectedEmployee.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
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
                  <Label className="text-sm font-medium">Departamento</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Localização</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Admissão</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEmployee.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Avaliação</Label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{selectedEmployee.rating}</span>
                  </div>
                </div>
              </div>

              {selectedEmployee.certifications.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Certificações</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEmployee.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployee.salary && (
                <div>
                  <Label className="text-sm font-medium">Salário</Label>
                  <p className="text-lg font-semibold text-green-600">
                    R$ {selectedEmployee.salary.toLocaleString()}/mês
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
