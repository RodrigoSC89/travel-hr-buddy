/**
 * HR Employee List Component
 * Lista de colaboradores com filtros e ações
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MoreHorizontal, Mail, Phone, Building2, Calendar,
  UserPlus, Download, Filter, Eye, Edit, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface HREmployeeListProps {
  searchQuery?: string;
}

export function HREmployeeList({ searchQuery = '' }: HREmployeeListProps) {
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');

  // Mock data
  const employees = [
    { 
      id: '1', name: 'Maria Silva', email: 'maria@empresa.com', phone: '(11) 99999-0001',
      position: 'Desenvolvedora Full-Stack', department: 'Tecnologia', hireDate: '2022-03-15',
      status: 'active', salary: 12000, turnoverRisk: 15, avatar: ''
    },
    { 
      id: '2', name: 'João Santos', email: 'joao@empresa.com', phone: '(11) 99999-0002',
      position: 'Gerente de Projetos', department: 'Operações', hireDate: '2020-06-01',
      status: 'active', salary: 15000, turnoverRisk: 87, avatar: ''
    },
    { 
      id: '3', name: 'Ana Costa', email: 'ana@empresa.com', phone: '(11) 99999-0003',
      position: 'Designer UI/UX', department: 'Tecnologia', hireDate: '2023-01-10',
      status: 'on_leave', salary: 8500, turnoverRisk: 32, avatar: ''
    },
    { 
      id: '4', name: 'Carlos Oliveira', email: 'carlos@empresa.com', phone: '(11) 99999-0004',
      position: 'Analista Financeiro', department: 'Financeiro', hireDate: '2021-09-20',
      status: 'active', salary: 7000, turnoverRisk: 45, avatar: ''
    },
    { 
      id: '5', name: 'Paula Mendes', email: 'paula@empresa.com', phone: '(11) 99999-0005',
      position: 'Coordenadora de RH', department: 'RH', hireDate: '2019-04-15',
      status: 'active', salary: 9500, turnoverRisk: 22, avatar: ''
    },
  ];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = department === 'all' || emp.department === department;
    const matchesStatus = status === 'all' || emp.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Ativo</Badge>;
      case 'on_leave': return <Badge variant="secondary">Afastado</Badge>;
      case 'terminated': return <Badge variant="destructive">Desligado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: number) => {
    if (risk >= 70) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{risk}%</Badge>;
    if (risk >= 40) return <Badge variant="secondary" className="bg-amber-500/20 text-amber-500">{risk}%</Badge>;
    return <Badge variant="outline" className="text-green-500">{risk}%</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle>Colaboradores ({filteredEmployees.length})</CardTitle>
          <div className="flex gap-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-40">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Operações">Operações</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="RH">RH</SelectItem>
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
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{employee.department}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(employee.hireDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getRiskBadge(employee.turnoverRisk)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" /> Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" /> Enviar Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
