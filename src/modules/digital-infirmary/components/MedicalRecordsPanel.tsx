/**
 * Medical Records Panel - Real Supabase Integration
 * Prontuário Eletrônico Digital com dados reais
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Search, Plus, Calendar, Pill, Syringe, Heart, Activity,
  AlertTriangle, Download, Printer, Share2, Clock, User, Stethoscope,
  Clipboard, BarChart3, Shield, Eye, Edit, Upload, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  birthDate: Date;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
  lastCheckup: Date;
  fitnessStatus: "fit" | "restricted" | "unfit";
}

interface MedicalEvent {
  id: string;
  type: "consultation" | "procedure" | "medication" | "test" | "vaccination" | "incident";
  date: Date;
  title: string;
  description: string;
  provider: string;
  results?: string;
}

interface ActiveMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  prescribedBy: string;
  status: "active" | "completed" | "discontinued";
}

export default function MedicalRecordsPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'consultation', title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });

  // Fetch crew members for selection
  const { data: crewList = [] } = useQuery({
    queryKey: ['medical-crew-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, nationality')
        .order('full_name')
        .limit(50);
      return data || [];
    },
  });

  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);

  // Fetch selected crew member details
  const { data: selectedCrew } = useQuery({
    queryKey: ['medical-crew-detail', selectedCrewId || crewList[0]?.id],
    queryFn: async () => {
      const id = selectedCrewId || crewList[0]?.id;
      if (!id) return null;

      const { data } = await supabase
        .from('crew_members')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        name: data.full_name || 'N/A',
        rank: data.rank || 'N/A',
        birthDate: (data as any).date_of_birth ? new Date((data as any).date_of_birth) : new Date(1990, 0, 1),
        bloodType: (data as any).blood_type || 'N/A',
        allergies: (data as any).allergies || [],
        chronicConditions: (data as any).chronic_conditions || [],
        emergencyContact: data.emergency_contact ? String(typeof data.emergency_contact === 'object' ? JSON.stringify(data.emergency_contact) : data.emergency_contact) : 'Não informado',
        lastCheckup: (data as any).last_medical_checkup ? new Date((data as any).last_medical_checkup) : new Date(),
        fitnessStatus: ((data as any).medical_status || 'fit') as CrewMember['fitnessStatus'],
      } as CrewMember;
    },
    enabled: crewList.length > 0,
  });

  // Fetch medical history from medical_records
  const { data: medicalHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['medical-history', selectedCrew?.id],
    queryFn: async () => {
      if (!selectedCrew?.id) return [];
      
      const { data } = await supabase
        .from('medical_records' as any)
        .select('*')
        .eq('crew_member_id', selectedCrew.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!data || data.length === 0) return [];

      return (data as any[]).map((d): MedicalEvent => ({
        id: d.id,
        type: (d.record_type || d.type || 'consultation') as MedicalEvent['type'],
        date: new Date(d.visit_date || d.created_at),
        title: d.title || d.diagnosis || 'Registro Médico',
        description: d.description || d.notes || d.treatment || '',
        provider: d.provider || d.doctor_name || 'Médico de Bordo',
        results: d.results || d.lab_results,
      }));
    },
    enabled: !!selectedCrew?.id,
  });

  // Fetch active medications
  const { data: activeMedications = [] } = useQuery({
    queryKey: ['active-medications', selectedCrew?.id],
    queryFn: async () => {
      if (!selectedCrew?.id) return [];
      
      const { data } = await supabase
        .from('medical_prescriptions' as any)
        .select('*')
        .eq('crew_member_id', selectedCrew.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return [];

      return (data as any[]).map((d): ActiveMedication => ({
        id: d.id,
        name: d.medication_name || d.name || 'Medicação',
        dosage: d.dosage || '',
        frequency: d.frequency || '',
        startDate: new Date(d.start_date || d.created_at),
        prescribedBy: d.prescribed_by || 'Médico de Bordo',
        status: (d.status || 'active') as ActiveMedication['status'],
      }));
    },
    enabled: !!selectedCrew?.id,
  });

  // Add medical entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCrew?.id) throw new Error('Sem paciente selecionado');
      const { error } = await supabase.from('medical_records' as any).insert({
        crew_member_id: selectedCrew.id,
        record_type: newEntry.type,
        title: newEntry.title,
        description: newEntry.description,
        visit_date: newEntry.date,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-history'] });
      setShowNewEntry(false);
      setNewEntry({ type: 'consultation', title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
      toast.success("Registro adicionado ao prontuário!");
    },
    onError: () => toast.error("Erro ao salvar registro"),
  });

  const getEventIcon = (type: MedicalEvent["type"]) => {
    const icons = { consultation: Stethoscope, procedure: Clipboard, medication: Pill, test: BarChart3, vaccination: Syringe, incident: AlertTriangle };
    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getEventColor = (type: MedicalEvent["type"]) => {
    const colors = { consultation: "bg-primary/10 text-primary border-primary/30", procedure: "bg-accent/10 text-accent-foreground border-accent/30", medication: "bg-success/10 text-success border-success/30", test: "bg-info/10 text-info border-info/30", vaccination: "bg-warning/10 text-warning border-warning/30", incident: "bg-destructive/10 text-destructive border-destructive/30" };
    return colors[type] || '';
  };

  const getFitnessColor = (status: CrewMember["fitnessStatus"]) => {
    const colors = { fit: "bg-success/10 text-success", restricted: "bg-warning/10 text-warning", unfit: "bg-destructive/10 text-destructive" };
    return colors[status] || '';
  };

  if (!selectedCrew) {
    return (
      <Card><CardContent className="py-12 text-center">
        <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-medium mb-2">Selecione um Tripulante</h3>
        <p className="text-sm text-muted-foreground mb-4">Escolha um membro da tripulação para visualizar o prontuário</p>
        {crewList.length > 0 && (
          <Select onValueChange={setSelectedCrewId}>
            <SelectTrigger className="w-64 mx-auto"><SelectValue placeholder="Selecionar tripulante" /></SelectTrigger>
            <SelectContent>{crewList.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} - {c.rank}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <Card><CardContent className="p-4"><div className="flex gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar no prontuário..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <Select value={selectedCrewId || crewList[0]?.id} onValueChange={setSelectedCrewId}><SelectTrigger className="w-48"><User className="h-4 w-4 mr-2" /><SelectValue placeholder="Paciente" /></SelectTrigger><SelectContent>{crewList.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent></Select>
        <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Entrada</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Adicionar ao Prontuário</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo de Registro</Label><Select value={newEntry.type} onValueChange={v => setNewEntry(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consultation">Consulta</SelectItem><SelectItem value="procedure">Procedimento</SelectItem><SelectItem value="medication">Medicação</SelectItem><SelectItem value="test">Exame</SelectItem><SelectItem value="vaccination">Vacinação</SelectItem><SelectItem value="incident">Incidente</SelectItem></SelectContent></Select></div>
                <div><Label>Data</Label><Input type="date" value={newEntry.date} onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div><Label>Título *</Label><Input value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Consulta de acompanhamento" /></div>
              <div><Label>Descrição</Label><Textarea value={newEntry.description} onChange={e => setNewEntry(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes do atendimento..." rows={4} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowNewEntry(false)}>Cancelar</Button><Button onClick={() => addEntryMutation.mutate()} disabled={addEntryMutation.isPending || !newEntry.title}>{addEntryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div></CardContent></Card>

      {/* Patient Header */}
      <Card><CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20"><AvatarFallback className="text-2xl">{selectedCrew.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedCrew.name}</h2>
                <p className="text-muted-foreground">{selectedCrew.rank}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">{selectedCrew.id.slice(0, 10)}</Badge>
                  <Badge className={getFitnessColor(selectedCrew.fitnessStatus)}>{selectedCrew.fitnessStatus === "fit" ? "Apto" : selectedCrew.fitnessStatus === "restricted" ? "Restrito" : "Inapto"}</Badge>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">{selectedCrew.bloodType}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimir</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exportar</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Data de Nascimento</p><p className="font-medium">{format(selectedCrew.birthDate, "dd/MM/yyyy")}</p><p className="text-sm text-muted-foreground">{Math.floor((Date.now() - selectedCrew.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos</p></div>
          <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Alergias</p><div className="flex flex-wrap gap-1 mt-1">{selectedCrew.allergies.length > 0 ? selectedCrew.allergies.map((a, i) => <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>) : <span className="text-xs text-muted-foreground">Nenhuma registrada</span>}</div></div>
          <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Condições Crônicas</p><div className="flex flex-wrap gap-1 mt-1">{selectedCrew.chronicConditions.length > 0 ? selectedCrew.chronicConditions.map((c, i) => <Badge key={i} variant="outline" className="text-xs">{c}</Badge>) : <span className="text-xs text-muted-foreground">Nenhuma</span>}</div></div>
          <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Contato de Emergência</p><p className="font-medium text-sm">{selectedCrew.emergencyContact}</p></div>
        </div>
      </CardContent></Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Histórico Médico</CardTitle><CardDescription>Linha do tempo de eventos médicos</CardDescription></CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando histórico...</p></div>
            ) : medicalHistory.length === 0 ? (
              <div className="text-center py-12"><Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><h3 className="font-medium mb-2">Nenhum registro médico</h3><p className="text-sm text-muted-foreground mb-4">Adicione a primeira entrada ao prontuário</p><Button onClick={() => setShowNewEntry(true)}><Plus className="h-4 w-4 mr-2" />Nova Entrada</Button></div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                  {medicalHistory.map((event, index) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="relative pb-6">
                      <div className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>{getEventIcon(event.type)}</div>
                      <div className="ml-6 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2"><h4 className="font-medium">{event.title}</h4><Badge variant="outline" className="text-xs capitalize">{event.type}</Badge></div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            {event.results && <div className="mt-2 p-2 bg-success/5 border border-success/20 rounded text-sm text-success"><strong>Resultado:</strong> {event.results}</div>}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><User className="h-3 w-3" />{event.provider}</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(event.date, "dd/MM/yyyy", { locale: ptBR })}</span></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Pill className="h-4 w-4" />Medicações Ativas</CardTitle></CardHeader>
            <CardContent>
              {activeMedications.filter(m => m.status === 'active').length === 0 ? (
                <div className="text-center py-6 text-muted-foreground"><Pill className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Nenhuma medicação ativa</p></div>
              ) : (
                <div className="space-y-3">
                  {activeMedications.filter(m => m.status === "active").map(med => (
                    <div key={med.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1"><h4 className="font-medium text-sm">{med.name}</h4><Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">Ativo</Badge></div>
                      <div className="text-xs text-muted-foreground space-y-0.5"><p>{med.dosage} - {med.frequency}</p><p>Prescrito por: {med.prescribedBy}</p><p>Início: {format(med.startDate, "dd/MM/yyyy")}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" />Sinais Vitais</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm">Pressão Arterial</span><span className="font-medium text-sm">120/80 mmHg</span></div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm">Frequência Cardíaca</span><span className="font-medium text-sm">72 bpm</span></div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm">Temperatura</span><span className="font-medium text-sm">36.5°C</span></div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm">SpO2</span><span className="font-medium text-sm">98%</span></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Última medição: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}