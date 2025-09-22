import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
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
  Star
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  startDate: string;
  status: 'active' | 'vacation' | 'travel' | 'inactive';
  certifications: string[];
  rating: number;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  {
    id: '001',
    name: 'Ana Silva',
    position: 'Gerente de Operações',
    department: 'Operações',
    email: 'ana.silva@nautilus.com',
    phone: '+55 11 99999-9999',
    location: 'São Paulo, SP',
    startDate: '2022-03-15',
    status: 'active',
    certifications: ['STCW Basic Safety', 'DP Certificate', 'Leadership'],
    rating: 4.8
  },
  {
    id: '002',
    name: 'Carlos Santos',
    position: 'Especialista em Viagens',
    department: 'Travel Management',
    email: 'carlos.santos@nautilus.com',
    phone: '+55 21 88888-8888',
    location: 'Rio de Janeiro, RJ',
    startDate: '2021-07-20',
    status: 'travel',
    certifications: ['IATA Certified', 'Corporate Travel', 'GDS Expert'],
    rating: 4.6
  },
  {
    id: '003',
    name: 'Marina Costa',
    position: 'Analista de RH',
    department: 'Recursos Humanos',
    email: 'marina.costa@nautilus.com',
    phone: '+55 85 77777-7777',
    location: 'Fortaleza, CE',
    startDate: '2023-01-10',
    status: 'vacation',
    certifications: ['HR Management', 'Recruitment Specialist'],
    rating: 4.9
  },
  {
    id: '004',
    name: 'Roberto Lima',
    position: 'Coordenador de Hospedagem',
    department: 'Accommodation',
    email: 'roberto.lima@nautilus.com',
    phone: '+55 71 66666-6666',
    location: 'Salvador, BA',
    startDate: '2020-11-05',
    status: 'active',
    certifications: ['Hotel Management', 'Revenue Management', 'Customer Service'],
    rating: 4.7
  }
];

export const HRDashboard = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const stats = [
    {
      title: "Total de Funcionários",
      value: employees.length.toString(),
      icon: Users,
      change: { value: 5, type: 'increase' as const },
      variant: 'ocean' as const
    },
    {
      title: "Funcionários Ativos",
      value: employees.filter(e => e.status === 'active').length.toString(),
      icon: Briefcase,
      variant: 'success' as const
    },
    {
      title: "Em Viagem",
      value: employees.filter(e => e.status === 'travel').length.toString(),
      icon: MapPin,
      variant: 'warning' as const
    },
    {
      title: "Média de Avaliação",
      value: (employees.reduce((acc, emp) => acc + emp.rating, 0) / employees.length).toFixed(1),
      icon: Star,
      variant: 'default' as const
    }
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'bg-success text-white';
      case 'vacation': return 'bg-warning text-white';
      case 'travel': return 'bg-info text-white';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'vacation': return 'Férias';
      case 'travel': return 'Viagem';
      case 'inactive': return 'Inativo';
      default: return 'N/A';
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
        <Button className="mt-4 md:mt-0 gradient-ocean">
          <UserPlus className="mr-2" size={18} />
          Novo Funcionário
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
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

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="p-6 hover:shadow-nautical transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full gradient-ocean flex items-center justify-center text-white font-bold text-lg">
                  {employee.name.split(' ').map(n => n[0]).join('')}
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
                Desde {new Date(employee.startDate).toLocaleDateString('pt-BR')}
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
              <Button variant="outline" size="sm" className="flex-1">
                Ver Perfil
              </Button>
              <Button size="sm" className="flex-1 gradient-ocean">
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
    </div>
  );
};