import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Ship, Building, User, Calendar, Target, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NonConformity {
  id: string;
  element_number: string;
  element_name: string;
  non_conformity_type: 'major' | 'minor' | 'observation';
  description: string;
  corrective_action?: string;
  responsible_person?: string;
  target_date?: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
  severity_score: number;
  peotram_audits?: {
    audit_period: string;
    vessel_name?: string;
    shore_location?: string;
  };
}

interface NonConformitiesProps {
  nonConformities: NonConformity[];
  onUpdate: () => void;
}

export const PeotramNonConformities: React.FC<NonConformitiesProps> = ({ 
  nonConformities, 
  onUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const updateNonConformity = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('peotram_non_conformities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      onUpdate();
      
      toast({
        title: "Sucesso",
        description: "Não conformidade atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating non-conformity:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a não conformidade.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'destructive';
      case 'minor':
        return 'secondary';
      case 'observation':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'closed':
        return 'default';
      case 'verified':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'closed':
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredNCs = nonConformities.filter(nc => {
    const matchesSearch = nc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.element_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.peotram_audits?.audit_period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || nc.non_conformity_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || nc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: nonConformities.length,
    open: nonConformities.filter(nc => nc.status === 'open').length,
    major: nonConformities.filter(nc => nc.non_conformity_type === 'major').length,
    overdue: nonConformities.filter(nc => 
      nc.target_date && new Date(nc.target_date) < new Date() && nc.status !== 'closed' && nc.status !== 'verified'
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.major}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
              </div>
              <Clock className="h-8 w-8 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar não conformidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="major">Crítica</SelectItem>
                <SelectItem value="minor">Menor</SelectItem>
                <SelectItem value="observation">Observação</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="closed">Fechada</SelectItem>
                <SelectItem value="verified">Verificada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Non-Conformities List */}
      <div className="grid gap-4">
        {filteredNCs.map((nc) => (
          <Card key={nc.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeColor(nc.non_conformity_type)}>
                          {nc.non_conformity_type === 'major' ? 'Crítica' : 
                           nc.non_conformity_type === 'minor' ? 'Menor' : 'Observação'}
                        </Badge>
                        <Badge variant={getStatusColor(nc.status)} className="flex items-center gap-1">
                          {getStatusIcon(nc.status)}
                          {nc.status === 'open' ? 'Aberta' :
                           nc.status === 'in_progress' ? 'Em Andamento' :
                           nc.status === 'closed' ? 'Fechada' : 'Verificada'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">
                        Elemento {nc.element_number}: {nc.element_name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nc.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {nc.peotram_audits?.vessel_name ? (
                        <>
                          <Ship className="h-3 w-3" />
                          {nc.peotram_audits.vessel_name}
                        </>
                      ) : (
                        <>
                          <Building className="h-3 w-3" />
                          {nc.peotram_audits?.shore_location || 'Base Terrestre'}
                        </>
                      )}
                    </div>
                    
                    {nc.responsible_person && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {nc.responsible_person}
                      </div>
                    )}
                    
                    {nc.target_date && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {new Date(nc.target_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-end gap-2">
                  <Badge variant="outline" className="text-xs">
                    Auditoria: {nc.peotram_audits?.audit_period}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedNC(nc);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Não Conformidade - Elemento {selectedNC?.element_number}
            </DialogTitle>
            <DialogDescription>
              {selectedNC?.element_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Badge variant={getTypeColor(selectedNC.non_conformity_type)} className="mt-1">
                    {selectedNC.non_conformity_type === 'major' ? 'Crítica' : 
                     selectedNC.non_conformity_type === 'minor' ? 'Menor' : 'Observação'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select 
                    value={selectedNC.status} 
                    onValueChange={(value) => updateNonConformity(selectedNC.id, { status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                      <SelectItem value="verified">Verificada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedNC.description}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Ação Corretiva</Label>
                <Textarea
                  value={selectedNC.corrective_action || ''}
                  onChange={(e) => {
                    setSelectedNC({ ...selectedNC, corrective_action: e.target.value });
                  }}
                  placeholder="Descreva a ação corretiva..."
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <Input
                    value={selectedNC.responsible_person || ''}
                    onChange={(e) => {
                      setSelectedNC({ ...selectedNC, responsible_person: e.target.value });
                    }}
                    placeholder="Nome do responsável"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Data Alvo</Label>
                  <Input
                    type="date"
                    value={selectedNC.target_date || ''}
                    onChange={(e) => {
                      setSelectedNC({ ...selectedNC, target_date: e.target.value });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    updateNonConformity(selectedNC.id, {
                      corrective_action: selectedNC.corrective_action,
                      responsible_person: selectedNC.responsible_person,
                      target_date: selectedNC.target_date
                    });
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};