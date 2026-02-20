/**
 * Class Survey Tracker - World-Class (vs DNV ShipManager)
 * Full CRUD with Supabase, export, real data
 */
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Calendar,
  FileText, Download, Plus, Search, Activity, RefreshCw, Trash2, Edit
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

const SURVEY_TYPES = [
  'Annual Survey', 'Intermediate Survey', 'Special Survey (5yr)',
  'Bottom Survey', 'Tailshaft Survey', 'Boiler Survey',
  'IOPP Survey', 'IAPP Survey', 'ISM Audit', 'ISPS Audit',
  'MLC Inspection', 'Load Line Survey', 'Safety Equipment Survey',
  'Safety Radio Survey', 'Safety Construction Survey',
];
const CLASS_SOCIETIES = ['DNV', "Lloyd's Register", 'Bureau Veritas', 'ClassNK', 'ABS', 'RINA', 'CCS', 'KR', 'IRS'];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  overdue: { label: 'Overdue', variant: 'destructive' },
  due_soon: { label: 'Due Soon', variant: 'destructive' },
  planned: { label: 'Planned', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'outline' },
};

const emptyForm = {
  vessel_id: '', survey_type: 'Annual Survey', class_society: 'DNV',
  due_date: '', last_completed: '', surveyor: '', findings: 0,
  open_conditions: 0, cost: 0, notes: '', status: 'planned',
};

export default function ClassSurveyTracker() {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: vessels = [] } = useQuery({
    queryKey: ['class-survey-vessels'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: surveys = [], isLoading, refetch } = useQuery({
    queryKey: ['class-surveys'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('class_surveys')
        .select('*, vessels:vessel_id(name)')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []).map((s: any) => {
        const daysUntil = s.due_date ? differenceInDays(new Date(s.due_date), new Date()) : 999;
        const computedStatus = s.status === 'completed' ? 'completed' :
          daysUntil < 0 ? 'overdue' : daysUntil < 30 ? 'due_soon' : 'planned';
        return { ...s, computed_status: computedStatus, days_until: daysUntil };
      });
    },
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['class-conditions'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('class_conditions')
        .select('*, vessels:vessel_id(name)')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: certs = [] } = useQuery({
    queryKey: ['statutory-certificates'],
    queryFn: async () => {
      const { data } = await supabase.from('maritime_certificates')
        .select('*, vessels:vessel_id(name)')
        .order('expiry_date', { ascending: true });
      return (data || []).map((c: any) => {
        const daysUntil = c.expiry_date ? differenceInDays(new Date(c.expiry_date), new Date()) : 999;
        return { ...c, computed_status: daysUntil < 0 ? 'expired' : daysUntil < 60 ? 'expiring' : 'valid', days_until: daysUntil };
      });
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (f: typeof emptyForm) => {
      const { error } = await fromUntyped('class_surveys').insert({
        vessel_id: f.vessel_id || null, survey_type: f.survey_type,
        class_society: f.class_society, due_date: f.due_date || null,
        last_completed: f.last_completed || null, surveyor: f.surveyor || null,
        findings: f.findings, open_conditions: f.open_conditions,
        cost: f.cost || null, notes: f.notes || null, status: f.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-surveys'] });
      setShowCreate(false);
      setForm(emptyForm);
      toast.success('Survey added');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await fromUntyped('class_surveys').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-surveys'] });
      setShowEdit(null);
      toast.success('Survey updated');
    },
  });

  const deleteSurvey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromUntyped('class_surveys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-surveys'] });
      toast.success('Survey deleted');
    },
  });

  const stats = useMemo(() => ({
    overdue: surveys.filter((s: any) => s.computed_status === 'overdue').length,
    dueSoon: surveys.filter((s: any) => s.computed_status === 'due_soon').length,
    planned: surveys.filter((s: any) => s.computed_status === 'planned').length,
    completed: surveys.filter((s: any) => s.computed_status === 'completed').length,
    openConditions: conditions.filter((c: any) => c.status !== 'closed').length,
    expiredCerts: certs.filter((c: any) => c.computed_status === 'expired').length,
  }), [surveys, conditions, certs]);

  const filtered = useMemo(() => surveys.filter((s: any) =>
    !searchTerm ||
    (s.vessels as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.survey_type?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [surveys, searchTerm]);

  const handleExport = () => {
    const csv = [
      ["Vessel", "Survey Type", "Class", "Due Date", "Status", "Findings", "Cost"].join(","),
      ...surveys.map((s: any) => [
        `"${(s.vessels as any)?.name || ""}"`, s.survey_type, s.class_society,
        s.due_date || "", s.computed_status, s.findings, s.cost || 0
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `class-surveys-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported");
  };

  const SurveyForm = ({ initial, onSubmit, isPending, isEdit }: {
    initial: typeof emptyForm; onSubmit: (f: typeof emptyForm) => void; isPending: boolean; isEdit: boolean;
  }) => {
    const [f, setF] = useState(initial);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Vessel</Label>
            <Select value={f.vessel_id} onValueChange={v => setF(p => ({ ...p, vessel_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
              <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Survey Type</Label>
            <Select value={f.survey_type} onValueChange={v => setF(p => ({ ...p, survey_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SURVEY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Class Society</Label>
            <Select value={f.class_society} onValueChange={v => setF(p => ({ ...p, class_society: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CLASS_SOCIETIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Due Date</Label><Input type="date" value={f.due_date} onChange={e => setF(p => ({ ...p, due_date: e.target.value }))} /></div>
          <div><Label>Last Completed</Label><Input type="date" value={f.last_completed} onChange={e => setF(p => ({ ...p, last_completed: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Status</Label>
            <Select value={f.status} onValueChange={v => setF(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Findings</Label><Input type="number" value={f.findings} onChange={e => setF(p => ({ ...p, findings: Number(e.target.value) }))} /></div>
          <div><Label>Cost (USD)</Label><Input type="number" value={f.cost || ""} onChange={e => setF(p => ({ ...p, cost: Number(e.target.value) }))} /></div>
        </div>
        <div><Label>Surveyor</Label><Input value={f.surveyor} onChange={e => setF(p => ({ ...p, surveyor: e.target.value }))} placeholder="Surveyor name" /></div>
        <div><Label>Notes</Label><Textarea value={f.notes} onChange={e => setF(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
        <Button className="w-full" onClick={() => onSubmit(f)} disabled={isPending || !f.survey_type}>
          {isPending ? "Saving..." : isEdit ? "Update Survey" : "Create Survey"}
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-6 gap-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Class Survey Tracker</h2>
          <p className="text-muted-foreground">{surveys.length} surveys • {certs.length} certificates • {conditions.length} conditions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><Plus className="h-4 w-4 mr-1" />Add Survey</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className={stats.overdue > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="pt-3 pb-2 text-center">
            <AlertTriangle className="h-4 w-4 mx-auto text-destructive" />
            <div className="text-xl font-bold text-destructive">{stats.overdue}</div>
            <div className="text-[10px] text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card className={stats.dueSoon > 0 ? 'border-warning/50' : ''}>
          <CardContent className="pt-3 pb-2 text-center">
            <Clock className="h-4 w-4 mx-auto text-warning" />
            <div className="text-xl font-bold text-warning">{stats.dueSoon}</div>
            <div className="text-[10px] text-muted-foreground">Due &lt;30d</div>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-3 pb-2 text-center">
          <Calendar className="h-4 w-4 mx-auto text-primary" />
          <div className="text-xl font-bold">{stats.planned}</div>
          <div className="text-[10px] text-muted-foreground">Planned</div>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center">
          <CheckCircle className="h-4 w-4 mx-auto text-success" />
          <div className="text-xl font-bold text-success">{stats.completed}</div>
          <div className="text-[10px] text-muted-foreground">Completed</div>
        </CardContent></Card>
        <Card className={stats.openConditions > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-3 pb-2 text-center">
            <Activity className="h-4 w-4 mx-auto text-destructive" />
            <div className="text-xl font-bold">{stats.openConditions}</div>
            <div className="text-[10px] text-muted-foreground">Open CoC</div>
          </CardContent>
        </Card>
        <Card className={stats.expiredCerts > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-3 pb-2 text-center">
            <FileText className="h-4 w-4 mx-auto text-destructive" />
            <div className="text-xl font-bold">{stats.expiredCerts}</div>
            <div className="text-[10px] text-muted-foreground">Expired Certs</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vessel or survey type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
      </div>

      <Tabs defaultValue="surveys">
        <TabsList>
          <TabsTrigger value="surveys">Surveys ({surveys.length})</TabsTrigger>
          <TabsTrigger value="certificates">Certificates ({certs.length})</TabsTrigger>
          <TabsTrigger value="conditions">Conditions ({conditions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No surveys found. Add your first class survey.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-2">Vessel</th>
                      <th className="text-left py-2 px-2">Survey Type</th>
                      <th className="text-left py-2 px-2">Class</th>
                      <th className="text-center py-2 px-2">Due Date</th>
                      <th className="text-center py-2 px-2">Status</th>
                      <th className="text-center py-2 px-2">Findings</th>
                      <th className="text-center py-2 px-2">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((s: any) => (
                        <tr key={s.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-2 font-medium text-xs">{(s.vessels as any)?.name || "—"}</td>
                          <td className="py-2 px-2 text-xs">{s.survey_type}</td>
                          <td className="py-2 px-2"><Badge variant="outline" className="text-xs">{s.class_society}</Badge></td>
                          <td className="py-2 px-2 text-center font-mono text-xs">{s.due_date ? format(new Date(s.due_date), 'dd MMM yyyy') : "—"}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge variant={STATUS_CONFIG[s.computed_status]?.variant || 'outline'} className="text-xs">
                              {STATUS_CONFIG[s.computed_status]?.label || s.computed_status}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {s.findings > 0 ? <Badge variant="destructive" className="text-xs">{s.findings}</Badge> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                setForm({
                                  vessel_id: s.vessel_id || '', survey_type: s.survey_type || '',
                                  class_society: s.class_society || 'DNV', due_date: s.due_date?.split('T')[0] || '',
                                  last_completed: s.last_completed?.split('T')[0] || '', surveyor: s.surveyor || '',
                                  findings: s.findings || 0, open_conditions: s.open_conditions || 0,
                                  cost: s.cost || 0, notes: s.notes || '', status: s.status || 'planned',
                                });
                                setShowEdit(s.id);
                              }} aria-label="Edit survey"><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                                if (confirm("Delete this survey?")) deleteSurvey.mutate(s.id);
                              }} aria-label="Delete survey"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card><CardContent className="pt-4">
            {certs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No statutory certificates found. Add certificates via the Crew Document Vault.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2">Certificate</th>
                    <th className="text-left py-2 px-2">Vessel</th>
                    <th className="text-left py-2 px-2">Issued By</th>
                    <th className="text-center py-2 px-2">Expiry</th>
                    <th className="text-center py-2 px-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {certs.slice(0, 30).map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium text-xs">{c.certificate_name || c.certificate_type}</td>
                        <td className="py-2 px-2 text-xs">{(c.vessels as any)?.name || "—"}</td>
                        <td className="py-2 px-2 text-xs">{c.issuing_authority || "—"}</td>
                        <td className="py-2 px-2 text-center font-mono text-xs">{c.expiry_date ? format(new Date(c.expiry_date), 'dd MMM yyyy') : "—"}</td>
                        <td className="py-2 px-2 text-center">
                          <Badge variant={c.computed_status === 'expired' ? 'destructive' : c.computed_status === 'expiring' ? 'secondary' : 'default'} className="text-xs">
                            {c.computed_status === 'expired' ? 'Expired' : c.computed_status === 'expiring' ? 'Expiring' : 'Valid'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="conditions" className="mt-4">
          <Card><CardContent className="pt-4">
            {conditions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No conditions of class recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2">Condition No.</th>
                    <th className="text-left py-2 px-2">Vessel</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-center py-2 px-2">Due</th>
                    <th className="text-center py-2 px-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {conditions.map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-2 font-mono font-medium text-xs">{c.condition_number || "—"}</td>
                        <td className="py-2 px-2 text-xs">{(c.vessels as any)?.name || "—"}</td>
                        <td className="py-2 px-2 text-xs max-w-[300px] truncate">{c.description}</td>
                        <td className="py-2 px-2 text-center font-mono text-xs">{c.due_date ? format(new Date(c.due_date), 'dd MMM yyyy') : "—"}</td>
                        <td className="py-2 px-2 text-center">
                          <Badge variant={c.status === 'overdue' ? 'destructive' : c.status === 'closed' ? 'default' : 'secondary'} className="text-xs">
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Class Survey</DialogTitle></DialogHeader>
          <SurveyForm initial={emptyForm} onSubmit={f => createSurvey.mutate(f)} isPending={createSurvey.isPending} isEdit={false} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Class Survey</DialogTitle></DialogHeader>
          <SurveyForm initial={form} onSubmit={f => updateSurvey.mutate({
            id: showEdit!, updates: {
              vessel_id: f.vessel_id || null, survey_type: f.survey_type,
              class_society: f.class_society, due_date: f.due_date || null,
              last_completed: f.last_completed || null, surveyor: f.surveyor || null,
              findings: f.findings, open_conditions: f.open_conditions,
              cost: f.cost || null, notes: f.notes || null, status: f.status,
            }
          })} isPending={updateSurvey.isPending} isEdit />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
