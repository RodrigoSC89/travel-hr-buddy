/**
 * HR Employee List Component
 * Lista de colaboradores com dados reais do Supabase
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, Mail, Phone, Building2, Calendar,
  UserPlus, Download, Eye, Edit, AlertTriangle, RefreshCw, Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useHREmployees, useHRDepartments, useTerminateHREmployee, type HREmployee } from '@/hooks/useHREmployees';
import { HREmployeeModal } from './HREmployeeModal';
import { useQueryClient } from '@tanstack/react-query';

interface HREmployeeListProps {
  searchQuery?: string;
}

export function HREmployeeList({ searchQuery = '' }: HREmployeeListProps) {
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HREmployee | null>(null);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [employeeToTerminate, setEmployeeToTerminate] = useState<HREmployee | null>(null);

  const queryClient = useQueryClient();
  
  // Real data from Supabase
  const { data: employees = [], isLoading, error, refetch } = useHREmployees({
    department: department !== 'all' ? department : undefined,
    status: status !== 'all' ? status : undefined,
    search: searchQuery || undefined,
  });
  
  const { data: departments = [] } = useHRDepartments();
  const terminateEmployee = useTerminateHREmployee();

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
  };

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: HREmployee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleTerminate = (employee: HREmployee) => {
    setEmployeeToTerminate(employee);
    setTerminateDialogOpen(true);
  };

  const confirmTerminate = async () => {
    if (employeeToTerminate) {
      await terminateEmployee.mutateAsync({ id: employeeToTerminate.id });
      setTerminateDialogOpen(false);
      setEmployeeToTerminate(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active': return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case 'on_leave': return <Badge variant="secondary">Afastado</Badge>;
      case 'terminated': return <Badge variant="destructive">Desligado</Badge>;
      default: return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const getRiskBadge = (risk: number | null) => {
    if (!risk) return <Badge variant="outline" className="text-muted-foreground">--</Badge>;
    if (risk >= 70) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{risk}%</Badge>;
    if (risk >= 40) return <Badge variant="secondary" className="bg-warning/20 text-warning">{risk}%</Badge>;
    return <Badge variant="outline" className="text-success">{risk}%</Badge>;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`emp-skeleton-${i}`} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive mb-4">Erro ao carregar colaboradores</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>Colaboradores ({employees.length})</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Atualizar lista" title="Atualizar">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-40">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="on_leave">Afastados</SelectItem>
                  <SelectItem value="terminated">Desligados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" aria-label="Exportar funcionários" title="Exportar">
                <Download className="h-4 w-4" />
              </Button>
              <Button className="gap-2" onClick={handleAddNew}>
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground mb-4">Nenhum colaborador encontrado</p>
              <Button onClick={handleAddNew}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar primeiro colaborador
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="hidden md:table-cell">Departamento</TableHead>
                    <TableHead className="hidden lg:table-cell">Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Risco Turnover</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.profile_photo_url || ''} />
                            <AvatarFallback>
                              {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.full_name}</p>
                            <p className="text-sm text-muted-foreground">{employee.position || 'Sem cargo definido'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{employee.department || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('pt-BR') : '--'}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getRiskBadge(employee.turnover_risk_score)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Mais opções do funcionário" title="Mais opções">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" /> Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleEdit(employee)}>
                              <Edit className="h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="h-4 w-4" /> Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {employee.status !== 'terminated' && (
                              <DropdownMenuItem 
                                className="gap-2 text-destructive" 
                                onClick={() => handleTerminate(employee)}
                              >
                                <Trash2 className="h-4 w-4" /> Desligar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <HREmployeeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />

      {/* Terminate Confirmation Dialog */}
      <AlertDialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desligar Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desligar <strong>{employeeToTerminate?.full_name}</strong>? 
              Esta ação irá marcar o colaborador como desligado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTerminate} className="bg-destructive text-destructive-foreground">
              Confirmar Desligamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
