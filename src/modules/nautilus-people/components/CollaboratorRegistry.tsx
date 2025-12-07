/**
 * Collaborator Registry - Cadastro Completo de Colaboradores
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  Upload,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  Building2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  unidade: string;
  dataAdmissao: string;
  status: 'ativo' | 'ferias' | 'licenca' | 'afastado';
  avatar?: string;
  salario: number;
  gestorDireto: string;
  tipoContrato: string;
}

const CollaboratorRegistry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('todos');
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data
  const colaboradores: Colaborador[] = [
    {
      id: '1',
      nome: 'Carlos Eduardo Silva',
      email: 'carlos.silva@empresa.com',
      telefone: '+55 11 99999-0001',
      cargo: 'Engenheiro de Produção',
      departamento: 'Operações',
      unidade: 'Plataforma Nautilus-A',
      dataAdmissao: '2021-03-15',
      status: 'ativo',
      salario: 12500,
      gestorDireto: 'Roberto Mendes',
      tipoContrato: 'CLT'
    },
    {
      id: '2',
      nome: 'Ana Paula Martins',
      email: 'ana.martins@empresa.com',
      telefone: '+55 11 99999-0002',
      cargo: 'Analista de RH Sênior',
      departamento: 'Recursos Humanos',
      unidade: 'Escritório Central',
      dataAdmissao: '2020-08-01',
      status: 'ativo',
      salario: 9800,
      gestorDireto: 'Fernanda Costa',
      tipoContrato: 'CLT'
    },
    {
      id: '3',
      nome: 'Roberto Santos Filho',
      email: 'roberto.santos@empresa.com',
      telefone: '+55 11 99999-0003',
      cargo: 'Técnico de Segurança',
      departamento: 'QSMS',
      unidade: 'Plataforma Nautilus-B',
      dataAdmissao: '2019-11-10',
      status: 'ferias',
      salario: 7500,
      gestorDireto: 'Marcos Oliveira',
      tipoContrato: 'CLT'
    },
    {
      id: '4',
      nome: 'Maria Fernanda Lima',
      email: 'maria.lima@empresa.com',
      telefone: '+55 11 99999-0004',
      cargo: 'Coordenadora Financeira',
      departamento: 'Financeiro',
      unidade: 'Escritório Central',
      dataAdmissao: '2018-05-20',
      status: 'ativo',
      salario: 15000,
      gestorDireto: 'Paulo Henrique',
      tipoContrato: 'CLT'
    },
    {
      id: '5',
      nome: 'João Pedro Almeida',
      email: 'joao.almeida@empresa.com',
      telefone: '+55 11 99999-0005',
      cargo: 'Operador de Plataforma',
      departamento: 'Operações',
      unidade: 'Plataforma Nautilus-C',
      dataAdmissao: '2022-01-10',
      status: 'ativo',
      salario: 6800,
      gestorDireto: 'Carlos Silva',
      tipoContrato: 'CLT'
    }
  ];

  const departamentos = ['todos', 'Operações', 'Recursos Humanos', 'QSMS', 'Financeiro', 'TI', 'Jurídico'];

  const filteredColaboradores = colaboradores.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'todos' || c.departamento === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'ferias': return 'bg-blue-500';
      case 'licenca': return 'bg-yellow-500';
      case 'afastado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'ferias': return 'Férias';
      case 'licenca': return 'Licença';
      case 'afastado': return 'Afastado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map(dep => (
                <SelectItem key={dep} value={dep}>
                  {dep === 'todos' ? 'Todos Departamentos' : dep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Colaborador</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo colaborador
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input placeholder="Nome do colaborador" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail Corporativo</Label>
                  <Input type="email" placeholder="email@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="+55 11 99999-0000" />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input placeholder="Cargo do colaborador" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.filter(d => d !== 'todos').map(dep => (
                        <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Admissão</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                      <SelectItem value="estagio">Estágio</SelectItem>
                      <SelectItem value="temporario">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button>Salvar Colaborador</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{colaboradores.filter(c => c.status === 'ativo').length}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{colaboradores.filter(c => c.status === 'ferias').length}</p>
              <p className="text-sm text-muted-foreground">Em Férias</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{colaboradores.filter(c => c.status === 'licenca').length}</p>
              <p className="text-sm text-muted-foreground">Em Licença</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{colaboradores.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <Building2 className="w-5 h-5 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Colaboradores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lista de Colaboradores</CardTitle>
            <CardDescription>{filteredColaboradores.length} colaboradores encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredColaboradores.map((colaborador, index) => (
                    <motion.div
                      key={colaborador.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 ${
                        selectedColaborador?.id === colaborador.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedColaborador(colaborador)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={colaborador.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {colaborador.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{colaborador.nome}</p>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(colaborador.status)}`} />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{colaborador.cargo}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {colaborador.departamento}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {colaborador.unidade}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{getStatusLabel(colaborador.status)}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes do Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedColaborador ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={selectedColaborador.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedColaborador.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 font-semibold">{selectedColaborador.nome}</h3>
                  <p className="text-sm text-muted-foreground">{selectedColaborador.cargo}</p>
                  <Badge className={`mt-2 ${getStatusColor(selectedColaborador.status)} text-white`}>
                    {getStatusLabel(selectedColaborador.status)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{selectedColaborador.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedColaborador.telefone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedColaborador.departamento}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedColaborador.unidade}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Admissão: {new Date(selectedColaborador.dataAdmissao).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>Gestor: {selectedColaborador.gestorDireto}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Contrato: {selectedColaborador.tipoContrato}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Documentos
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    Formação
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um colaborador para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollaboratorRegistry;
