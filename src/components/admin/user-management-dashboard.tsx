import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Mail, 
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';

const UserManagementDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const users = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@nautilus.com',
      role: 'Admin',
      status: 'Ativo',
      lastLogin: '2024-01-15 14:30',
      department: 'TI',
      phone: '+55 11 99999-9999'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@nautilus.com',
      role: 'HR Manager',
      status: 'Ativo',
      lastLogin: '2024-01-15 13:45',
      department: 'Recursos Humanos',
      phone: '+55 11 88888-8888'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro.costa@nautilus.com',
      role: 'Employee',
      status: 'Inativo',
      lastLogin: '2024-01-10 09:15',
      department: 'Operações',
      phone: '+55 11 77777-7777'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      email: 'ana.oliveira@nautilus.com',
      role: 'Manager',
      status: 'Ativo',
      lastLogin: '2024-01-15 12:20',
      department: 'Logística',
      phone: '+55 11 66666-6666'
    }
  ];

  const userStats = {
    total: 247,
    active: 198,
    inactive: 49,
    newThisMonth: 12
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'Admin': 'bg-red-100 text-red-800',
      'HR Manager': 'bg-blue-100 text-blue-800',
      'Manager': 'bg-green-100 text-green-800',
      'Employee': 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'Ativo' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserX className="w-3 h-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: "Ação Executada",
      description: `${action} aplicada ao usuário ID: ${userId}`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Administre usuários, permissões e acessos do sistema
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Digite o nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@nautilus.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" placeholder="Ex: Recursos Humanos" />
              </div>
              <Button className="w-full">Criar Usuário</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.active}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserX className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.inactive}</p>
                <p className="text-sm text-muted-foreground">Usuários Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.newThisMonth}</p>
                <p className="text-sm text-muted-foreground">Novos este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Funções</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar Usuários</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role-filter">Função</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Funções</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="HR Manager">HR Manager</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{user.lastLogin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction('Editar', user.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction('Configurar', user.id)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction('Desativar', user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gestão de Funções
              </CardTitle>
              <CardDescription>
                Configure funções e suas permissões no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Admin</h3>
                        <Badge className="bg-red-100 text-red-800">Máximo</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso total ao sistema
                      </p>
                      <p className="text-xs text-muted-foreground">
                        3 usuários
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">HR Manager</h3>
                        <Badge className="bg-blue-100 text-blue-800">Alto</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gestão de recursos humanos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        8 usuários
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Manager</h3>
                        <Badge className="bg-green-100 text-green-800">Médio</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Supervisão de equipes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        25 usuários
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Employee</h3>
                        <Badge className="bg-gray-100 text-gray-800">Básico</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso limitado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        211 usuários
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões</CardTitle>
              <CardDescription>
                Visualize e configure permissões por função
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Módulo</th>
                      <th className="text-center p-2">Admin</th>
                      <th className="text-center p-2">HR Manager</th>
                      <th className="text-center p-2">Manager</th>
                      <th className="text-center p-2">Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Dashboard</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Recursos Humanos</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">📖</td>
                      <td className="text-center p-2">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Administração</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">❌</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Relatórios</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">✅</td>
                      <td className="text-center p-2">📖</td>
                      <td className="text-center p-2">📖</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>✅ = Acesso Total | 📖 = Somente Leitura | ❌ = Sem Acesso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementDashboard;