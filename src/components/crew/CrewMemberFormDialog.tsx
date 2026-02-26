/**
 * CrewMemberFormDialog - Full CRUD Dialog for Crew Members
 * Supports create + edit with STCW certification fields
 * Writes directly to Supabase crew_members table
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Ship, Award, FileText } from 'lucide-react';
import { z } from 'zod/v4';

const crewFormSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  position: z.string().min(1, 'Posição é obrigatória'),
  rank: z.string().optional(),
  nationality: z.string().optional(),
  passport_number: z.string().optional(),
  phone: z.string().optional(),
  email: z.email('Email inválido').optional().or(z.literal('')),
  vessel_id: z.string().optional(),
  contract_start: z.string().optional(),
  contract_end: z.string().optional(),
  experience_years: z.string().optional(),
});

interface CrewMemberFormData {
  full_name: string;
  position: string;
  rank: string;
  nationality: string;
  passport_number: string;
  phone: string;
  email: string;
  vessel_id: string;
  contract_start: string;
  contract_end: string;
  experience_years: string;
  // STCW Fields
  stcw_certificate_number: string;
  stcw_issue_date: string;
  stcw_expiry_date: string;
  medical_certificate_expiry: string;
  sea_service_months: string;
}

const EMPTY_FORM: CrewMemberFormData = {
  full_name: '', position: '', rank: '', nationality: '', passport_number: '',
  phone: '', email: '', vessel_id: '', contract_start: '', contract_end: '',
  experience_years: '', stcw_certificate_number: '', stcw_issue_date: '',
  stcw_expiry_date: '', medical_certificate_expiry: '', sea_service_months: '',
};

const POSITIONS = [
  'Comandante', 'Imediato', 'Chefe de Máquinas', '1º Oficial de Náutica',
  '2º Oficial de Náutica', '1º Oficial de Máquinas', '2º Oficial de Máquinas',
  'Oficial de Convés', 'Engenheiro', 'Eletricista', 'Marinheiro de Convés',
  'Marinheiro de Máquinas', 'Moço de Convés', 'Cozinheiro', 'Taifeiro',
  'Enfermeiro(a) de Bordo', 'Operador de Rádio',
];

const RANKS = ['Capitão', 'Oficial Superior', 'Oficial', 'Suboficial', 'Praça', 'Auxiliar'];

interface CrewMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  vessels: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function CrewMemberFormDialog({ open, onOpenChange, editId, vessels, onSuccess }: CrewMemberFormDialogProps) {
  const [form, setForm] = useState<CrewMemberFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const isEdit = !!editId;

  // Load existing data for edit
  useEffect(() => {
    if (!editId || !open) { setForm(EMPTY_FORM); return; }
    setIsLoadingEdit(true);
    supabase.from('crew_members').select('*').eq('id', editId).single()
      .then(({ data, error }) => {
        if (error || !data) { toast.error('Erro ao carregar tripulante'); setIsLoadingEdit(false); return; }
        setForm({
          full_name: data.full_name || '',
          position: data.position || '',
          rank: data.rank || '',
          nationality: data.nationality || '',
          passport_number: data.passport_number || '',
          phone: data.phone || '',
          email: data.email || '',
          vessel_id: data.vessel_id || '',
          contract_start: data.contract_start || '',
          contract_end: data.contract_end || '',
          experience_years: String(data.experience_years || ''),
          stcw_certificate_number: '',
          stcw_issue_date: '',
          stcw_expiry_date: '',
          medical_certificate_expiry: '',
          sea_service_months: '',
        });
        setIsLoadingEdit(false);
      });
  }, [editId, open]);

  const update = (key: keyof CrewMemberFormData, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.position) {
      toast.error('Nome e posição são obrigatórios');
      return;
    }

    // Zod validation
    const validation = crewFormSchema.safeParse(form);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error('Dados inválidos', { description: firstError.message });
      return;
    }
    setIsSaving(true);
    try {
      const employeeId = `NTL-${Date.now().toString(36).toUpperCase()}`;
      const payload = {
        full_name: form.full_name.trim(),
        position: form.position,
        rank: form.rank || form.position,
        nationality: form.nationality || 'N/A',
        passport_number: form.passport_number || null,
        phone: form.phone || null,
        email: form.email || null,
        vessel_id: form.vessel_id || null,
        contract_start: form.contract_start || null,
        contract_end: form.contract_end || null,
        experience_years: form.experience_years ? parseInt(form.experience_years) : null,
        status: 'active',
        employee_id: employeeId,
      };

      if (isEdit) {
        const { error } = await supabase.from('crew_members').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Tripulante atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('crew_members').insert([payload]);
        if (error) throw error;
        toast.success('Tripulante cadastrado com sucesso!');
      }

      // If STCW cert number provided, also insert certification
      if (form.stcw_certificate_number && !isEdit) {
        // Get the newly created crew member
        const { data: newCrew } = await supabase.from('crew_members')
          .select('id').eq('full_name', form.full_name.trim()).order('created_at', { ascending: false }).limit(1).single();
        
        if (newCrew) {
          await supabase.from('crew_certifications').insert({
            crew_member_id: newCrew.id,
            certification_name: 'STCW Certificate of Competency',
            certification_type: 'STCW',
            certificate_number: form.stcw_certificate_number,
            issue_date: form.stcw_issue_date || new Date().toISOString().slice(0, 10),
            issuing_authority: 'Maritime Authority',
            expiry_date: form.stcw_expiry_date || null,
            status: 'valid',
          });
        }
      }

      onOpenChange(false);
      setForm(EMPTY_FORM);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error('Erro ao salvar', { description: err instanceof Error ? err.message : 'Erro desconhecido' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isEdit ? 'Editar Tripulante' : 'Novo Tripulante'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize os dados do tripulante' : 'Cadastre um novo membro da tripulação com dados STCW'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingEdit ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="text-xs gap-1"><User className="h-3 w-3" />Pessoal</TabsTrigger>
              <TabsTrigger value="contract" className="text-xs gap-1"><FileText className="h-3 w-3" />Contrato</TabsTrigger>
              <TabsTrigger value="stcw" className="text-xs gap-1"><Award className="h-3 w-3" />STCW</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input placeholder="Nome completo" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Posição *</Label>
                  <Select value={form.position} onValueChange={v => update('position', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Patente</Label>
                  <Select value={form.rank} onValueChange={v => update('rank', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Input placeholder="Ex: Brasileiro" value={form.nationality} onChange={e => update('nationality', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Passaporte</Label>
                  <Input placeholder="Nº do passaporte" value={form.passport_number} onChange={e => update('passport_number', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input placeholder="+55 11 99999-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contract" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Embarcação</Label>
                  <Select value={form.vessel_id} onValueChange={v => update('vessel_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não atribuído</SelectItem>
                      {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Anos de Experiência</Label>
                  <Input type="number" placeholder="0" value={form.experience_years} onChange={e => update('experience_years', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Início do Contrato</Label>
                  <Input type="date" value={form.contract_start} onChange={e => update('contract_start', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Fim do Contrato</Label>
                  <Input type="date" value={form.contract_end} onChange={e => update('contract_end', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stcw" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">STCW 2010</Badge>
                <span className="text-xs text-muted-foreground">Standards of Training, Certification and Watchkeeping</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nº Certificado STCW</Label>
                  <Input placeholder="STCW-XXX-XXXX" value={form.stcw_certificate_number} onChange={e => update('stcw_certificate_number', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Mar (meses)</Label>
                  <Input type="number" placeholder="0" value={form.sea_service_months} onChange={e => update('sea_service_months', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Emissão</Label>
                  <Input type="date" value={form.stcw_issue_date} onChange={e => update('stcw_issue_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Validade</Label>
                  <Input type="date" value={form.stcw_expiry_date} onChange={e => update('stcw_expiry_date', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Validade Certificado Médico</Label>
                  <Input type="date" value={form.medical_certificate_expiry} onChange={e => update('medical_certificate_expiry', e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !form.full_name || !form.position}>
            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : isEdit ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}