import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2
} from "lucide-react";
import { useCrewRealData } from "@/hooks/useCrewRealData";
import { supabase } from "@/integrations/supabase/client";

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

export const EmployeeManagement = () => {
  const { toast } = useToast();
  const { data, isLoading } = useCrewRealData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewingEmployee, setIsViewingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "", position: "", department: "", email: "", phone: "", location: "",
    status: "active", certifications: [], rating: 4.0, salary: 0
  });

  // Map real crew data to Employee format
  const employees = useMemo<Employee[]>(() => {
    if (!data?.crew) return [];
    return data.crew.map(c => ({
      id: c.id,
      name: c.name,
      position: c.rank,
      department: c.department,
      email: "",
      phone: "",
      location: c.vessel !== "—" ? c.vessel : c.nationality,
      startDate: c.embarkedDate || "",
      status: c.status === "onboard" ? "active" as const
        : c.status === "on-leave" ? "vacation" as const
        : c.status === "traveling" ? "travel" as const
        : "inactive" as const,
      certifications: Array.from({ length: c.certCount }, (_, i) => `Cert ${i + 1}`),
      rating: 4.0 + ((c.certCount || 0) % 9) * 0.1,
    }));
  }, [data?.crew]);

  const handleCreateEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.department) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("crew_members").insert({
        full_name: newEmployee.name,
        position: newEmployee.position,
        nationality: newEmployee.location || "BR",
        employee_id: `EMP-${Date.now().toString(36).toUpperCase()}`,
        status: "active",
        email: newEmployee.email || null,
        phone: newEmployee.phone || null,
      });
      if (error) throw error;
      toast({ title: "Funcionário criado", description: `${newEmployee.name} foi adicionado ao sistema` });
      setIsCreatingEmployee(false);
      setNewEmployee({ name: "", position: "", department: "", email: "", phone: "", location: "", status: "active", certifications: [], rating: 4.0, salary: 0 });
    } catch {
      toast({ title: "Erro", description: "Falha ao criar funcionário", variant: "destructive" });
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    const employee = employees.find(e => e.id === id);
    try {
      const { error } = await supabase.from("crew_members").update({ status: "inactive" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Funcionário removido", description: `${employee?.name} foi desativado do sistema` });
    } catch {
      toast({ title: "Erro", description: "Falha ao remover funcionário", variant: "destructive" });
    }
  };

  const handleStatusChange = async (employeeId: string, newStatus: Employee["status"]) => {
    const statusMap: Record<string, string> = { active: "active", vacation: "on_leave", travel: "traveling", inactive: "inactive" };
    try {
      const { error } = await supabase.from("crew_members").update({ status: statusMap[newStatus] || newStatus }).eq("id", employeeId);
      if (error) throw error;
      toast({ title: "Status atualizado", description: "Status do funcionário foi alterado com sucesso" });
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar status", variant: "destructive" });
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
    case "active": return "bg-green-100 text-green-800 border-green-200";
    case "vacation": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "travel": return "bg-blue-100 text-blue-800 border-blue-200";
    case "inactive": return "bg-secondary text-secondary-foreground border-border";
    default: return "bg-secondary text-secondary-foreground border-border";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando funcionários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Funcionários</h2>
          <p className="text-muted-foreground">
            {employees.length} colaboradores registrados
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
                <Label htmlFor="name" className="text-right">Nome *</Label>
                <Input id="name" value={newEmployee.name || ""} onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">Cargo *</Label>
                <Input id="position" value={newEmployee.position || ""} onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Departamento *</Label>
                <Select value={newEmployee.department || ""} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deck">Deck</SelectItem>
                    <SelectItem value="Engine">Engine</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={newEmployee.email || ""} onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))} className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingEmployee(false)}>Cancelar</Button>
              <Button onClick={handleCreateEmployee}>Criar Funcionário</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Buscar funcionários..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {employee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {employee.location}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {employee.startDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Desde {new Date(employee.startDate).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span className="text-muted-foreground">{employee.certifications.length} cert.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 md:mt-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => { setSelectedEmployee(employee); setIsViewingEmployee(true); }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {selectedEmployee.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
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
                  <Label className="text-sm font-medium">Localização</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.location}</p>
                </div>
                {selectedEmployee.startDate && (
                  <div>
                    <Label className="text-sm font-medium">Data de Admissão</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEmployee.startDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Certificações</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.certifications.length} certificado(s)</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagement;
