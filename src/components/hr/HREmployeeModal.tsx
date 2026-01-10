/**
 * HR Employee Modal - Create/Edit Employee
 * Modal para criar ou editar colaboradores
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { useCreateHREmployee, useUpdateHREmployee, type HREmployee, type CreateEmployeeInput } from '@/hooks/useHREmployees';

interface HREmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: HREmployee | null;
}

const DEPARTMENTS = ['Tecnologia', 'Operações', 'Financeiro', 'RH', 'Comercial', 'Marketing', 'Jurídico'];
const CONTRACT_TYPES = ['CLT', 'PJ', 'Estágio', 'Temporário', 'Trainee'];

export function HREmployeeModal({ open, onClose, employee }: HREmployeeModalProps) {
  const createEmployee = useCreateHREmployee();
  const updateEmployee = useUpdateHREmployee();
  
  const [formData, setFormData] = useState<CreateEmployeeInput>({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    contract_type: 'CLT',
    base_salary: undefined,
    status: 'active',
  });

  const isEditing = !!employee;
  const isLoading = createEmployee.isPending || updateEmployee.isPending;

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        cpf: employee.cpf || '',
        position: employee.position || '',
        department: employee.department || '',
        hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
        contract_type: employee.contract_type || 'CLT',
        base_salary: employee.base_salary || undefined,
        status: employee.status || 'active',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        cpf: '',
        position: '',
        department: '',
        hire_date: new Date().toISOString().split('T')[0],
        contract_type: 'CLT',
        base_salary: undefined,
        status: 'active',
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && employee) {
        await updateEmployee.mutateAsync({ id: employee.id, ...formData });
      } else {
        await createEmployee.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleChange = (field: keyof CreateEmployeeInput, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="md:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@empresa.com"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            {/* Cargo */}
            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Ex: Desenvolvedor Full-Stack"
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

            {/* Tipo de Contrato */}
            <div>
              <Label htmlFor="contract_type">Tipo de Contrato</Label>
              <Select value={formData.contract_type} onValueChange={(v) => handleChange('contract_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Admissão */}
            <div>
              <Label htmlFor="hire_date">Data de Admissão</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleChange('hire_date', e.target.value)}
              />
            </div>

            {/* Salário Base */}
            <div>
              <Label htmlFor="base_salary">Salário Base (R$)</Label>
              <Input
                id="base_salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_salary || ''}
                onChange={(e) => handleChange('base_salary', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0,00"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="on_leave">Afastado</SelectItem>
                  <SelectItem value="terminated">Desligado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.full_name || !formData.email}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
