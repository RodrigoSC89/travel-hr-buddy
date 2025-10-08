import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  User,
  Mail,
  Phone,
  Building,
  TestTube,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

interface UsersProfilesTabProps {
  testMode: boolean;
}

export const UsersProfilesTab: React.FC<UsersProfilesTabProps> = ({ testMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock user data
  const users = [
    {
      id: '1',
      name: 'Carlos Silva',
      email: 'carlos.silva@nautilus.com',
      role: 'admin',
      status: 'active',
      department: 'TI',
      lastLogin: '2024-09-29T10:30:00Z',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@nautilus.com',
      role: 'hr_manager',
      status: 'active',
      department: 'Recursos Humanos',
      lastLogin: '2024-09-29T09:15:00Z',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      name: 'João Oliveira',
      email: 'joao.oliveira@nautilus.com',
      role: 'employee',
      status: 'active',
      department: 'Operações',
      lastLogin: '2024-09-28T16:45:00Z',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@nautilus.com',
      role: 'employee',
      status: 'inactive',
      department: 'Navegação',
      lastLogin: '2024-09-20T14:20:00Z',
      avatar: '/api/placeholder/32/32'
    }
  ];

  const roles = [
    { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-800' },
    { value: 'hr_manager', label: 'Gerente RH', color: 'bg-blue-100 text-blue-800' },
    { value: 'employee', label: 'Funcionário', color: 'bg-green-100 text-green-800' }
  ];

  const modulePermissions = [
    { id: 'communication', name: 'Comunicação', description: 'Acesso ao módulo de comunicação' },
    { id: 'crew', name: 'Tripulação', description: 'Gestão de tripulação e equipagem' },
    { id: 'vessels', name: 'Embarcações', description: 'Gestão de embarcações e frotas' },
    { id: 'certificates', name: 'Certificações', description: 'Gestão de certificados e documentos' },
    { id: 'reports', name: 'Relatórios', description: 'Acesso aos relatórios do sistema' },
    { id: 'settings', name: 'Configurações', description: 'Acesso às configurações do sistema' }
  ];

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[2];
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge variant="outline" className="text-gray-600">Inativo</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gerenciamento de Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Cargos e Permissões
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Atribuição de Módulos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          {/* User Management Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Gerenciamento de Usuários
                    {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Gerencie usuários, cargos e permissões do sistema
                  </CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cargos</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{user.name}</h4>
                            {getStatusBadge(user.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {user.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Configuração de Cargos
              </CardTitle>
              <CardDescription>
                Configure permissões e responsabilidades por cargo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roles.map((role) => (
                <div key={role.value} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={role.color}>{role.label}</Badge>
                      <h4 className="font-medium">{role.label}</h4>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {role.value === 'admin' && (
                      <>
                        <span className="text-green-600">✓ Todos os módulos</span>
                        <span className="text-green-600">✓ Gerenciar usuários</span>
                        <span className="text-green-600">✓ Configurações</span>
                        <span className="text-green-600">✓ Relatórios</span>
                      </>
                    )}
                    {role.value === 'hr_manager' && (
                      <>
                        <span className="text-green-600">✓ Gestão de pessoal</span>
                        <span className="text-green-600">✓ Certificações</span>
                        <span className="text-green-600">✓ Relatórios RH</span>
                        <span className="text-muted-foreground">✗ Configurações</span>
                      </>
                    )}
                    {role.value === 'employee' && (
                      <>
                        <span className="text-green-600">✓ Dados pessoais</span>
                        <span className="text-green-600">✓ Comunicação</span>
                        <span className="text-muted-foreground">✗ Gestão</span>
                        <span className="text-muted-foreground">✗ Configurações</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* Module Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Atribuição de Módulos por Escopo
              </CardTitle>
              <CardDescription>
                Configure quais módulos cada cargo pode acessar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Módulo</th>
                      <th className="text-center p-2">Administrador</th>
                      <th className="text-center p-2">Gerente RH</th>
                      <th className="text-center p-2">Funcionário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modulePermissions.map((module) => (
                      <tr key={module.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-muted-foreground">{module.description}</div>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-green-600 text-lg">✓</span>
                        </td>
                        <td className="text-center p-3">
                          {['crew', 'certificates', 'reports'].includes(module.id) ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-muted-foreground text-lg">✗</span>
                          )}
                        </td>
                        <td className="text-center p-3">
                          {['communication'].includes(module.id) ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-muted-foreground text-lg">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};