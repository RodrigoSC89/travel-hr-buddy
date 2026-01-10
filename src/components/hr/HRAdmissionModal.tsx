/**
 * HR Admission Modal - Create New Admission
 * Modal para criar nova admissão
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X, UserPlus } from 'lucide-react';
import { useCreateHRAdmission, type CreateAdmissionInput } from '@/hooks/useHRAdmissions';

interface HRAdmissionModalProps {
  open: boolean;
  onClose: () => void;
}

const DEPARTMENTS = ['Tecnologia', 'Operações', 'Financeiro', 'RH', 'Comercial', 'Marketing', 'Jurídico'];

export function HRAdmissionModal({ open, onClose }: HRAdmissionModalProps) {
  const createAdmission = useCreateHRAdmission();
  
  const [formData, setFormData] = useState<CreateAdmissionInput>({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    position: '',
    department: '',
    proposed_salary: undefined,
    proposed_start_date: '',
  });

  const isLoading = createAdmission.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAdmission.mutateAsync(formData);
      setFormData({
        candidate_name: '',
        candidate_email: '',
        candidate_phone: '',
        position: '',
        department: '',
        proposed_salary: undefined,
        proposed_start_date: '',
      });
      onClose();
    } catch (error) {
      console.error('Error creating admission:', error);
    }
  };

  const handleChange = (field: keyof CreateAdmissionInput, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nova Admissão
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Candidato */}
          <div>
            <Label htmlFor="candidate_name">Nome do Candidato *</Label>
            <Input
              id="candidate_name"
              value={formData.candidate_name}
              onChange={(e) => handleChange('candidate_name', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="candidate_email">Email *</Label>
            <Input
              id="candidate_email"
              type="email"
              value={formData.candidate_email}
              onChange={(e) => handleChange('candidate_email', e.target.value)}
              placeholder="email@candidato.com"
              required
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="candidate_phone">Telefone</Label>
            <Input
              id="candidate_phone"
              value={formData.candidate_phone}
              onChange={(e) => handleChange('candidate_phone', e.target.value)}
              placeholder="(11) 99999-0000"
            />
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="position">Cargo Proposto *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              placeholder="Ex: Desenvolvedor Jr"
              required
            />
          </div>

          {/* Departamento */}
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salário Proposto */}
          <div>
            <Label htmlFor="proposed_salary">Salário Proposto (R$)</Label>
            <Input
              id="proposed_salary"
              type="number"
              min="0"
              step="0.01"
              value={formData.proposed_salary || ''}
              onChange={(e) => handleChange('proposed_salary', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0,00"
            />
          </div>

          {/* Data de Início */}
          <div>
            <Label htmlFor="proposed_start_date">Data de Início Prevista</Label>
            <Input
              id="proposed_start_date"
              type="date"
              value={formData.proposed_start_date}
              onChange={(e) => handleChange('proposed_start_date', e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.candidate_name || !formData.candidate_email || !formData.position}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Iniciar Admissão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
