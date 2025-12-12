/**
import { useState } from "react";;
 * Medical Records Tab
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Plus, Stethoscope, AlertTriangle, CheckCircle2, Clock, Filter, Brain, User, Calendar, Activity } from "lucide-react";
import { mockRecords, mockCrewMembers } from "../data/mockData";
import { MedicalRecord } from "../types";
import { toast } from "sonner";
import { useMedicalAI } from "../hooks/useMedicalAI";

export default function RecordsTab() {
  const { generateTreatmentSuggestion, isLoading } = useMedicalAI();
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({ crewMemberId: "", chiefComplaint: "", symptoms: "", type: "consultation" as const });

  const filteredRecords = records.filter(r => 
    r.crewMemberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "resolved": return <Badge className="bg-green-500/20 text-green-500">Resolvido</Badge>;
    case "monitoring": return <Badge className="bg-amber-500/20 text-amber-500">Monitorando</Badge>;
    case "referred": return <Badge className="bg-blue-500/20 text-blue-500">Encaminhado</Badge>;
    case "pending": return <Badge className="bg-gray-500/20 text-gray-500">Pendente</Badge>;
    default: return null;
    }
  };

  const handleCreateRecord = async () => {
    const crew = mockCrewMembers.find(c => c.id === newRecord.crewMemberId);
    if (!crew) { toast.error("Selecione um tripulante"); return; }

    const suggestion = await generateTreatmentSuggestion(
      newRecord.symptoms.split(",").map(s => s.trim()),
      newRecord.chiefComplaint,
      crew
    );

    const record: MedicalRecord = {
      id: Date.now().toString(),
      crewMemberId: crew.id,
      crewMemberName: crew.name,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: newRecord.type,
      chiefComplaint: newRecord.chiefComplaint,
      symptoms: newRecord.symptoms.split(",").map(s => s.trim()),
      diagnosis: "",
      treatment: suggestion?.treatment || "",
      medications: suggestion?.medications || [],
      vitalSigns: {},
      notes: "",
      status: "pending",
      aiSuggestions: suggestion ? ["Sugestão de tratamento gerada pela IA"] : []
    };

    setRecords(prev => [record, ...prev]);
    setShowNewRecord(false);
    setNewRecord({ crewMemberId: "", chiefComplaint: "", symptoms: "", type: "consultation" });
    toast.success("Atendimento criado");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar prontuário..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={showNewRecord} onOpenChange={setShowNewRecord}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Atendimento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Atendimento</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tripulante</Label>
                <Select value={newRecord.crewMemberId} onValueChange={(v) => setNewRecord(prev => ({ ...prev, crewMemberId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mockCrewMembers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newRecord.type} onValueChange={(v: any) => setNewRecord(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consulta</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="routine">Rotina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Queixa Principal</Label>
                <Input value={newRecord.chiefComplaint} onChange={(e) => setNewRecord(prev => ({ ...prev, chiefComplaint: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sintomas (separados por vírgula)</Label>
                <Textarea value={newRecord.symptoms} onChange={(e) => setNewRecord(prev => ({ ...prev, symptoms: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRecord(false)}>Cancelar</Button>
              <Button onClick={handleCreateRecord} disabled={isLoading}>
                {isLoading ? "Analisando..." : "Criar com IA"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Prontuários</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${record.type === "emergency" ? "bg-red-500/10" : "bg-blue-500/10"}`}>
                        {record.type === "emergency" ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Stethoscope className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{record.crewMemberName}</p>
                        <p className="text-sm text-muted-foreground">{record.date} {record.time}</p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-sm mb-2"><strong>Queixa:</strong> {record.chiefComplaint}</p>
                  {record.diagnosis && <p className="text-sm mb-2"><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
                  {record.treatment && <p className="text-sm"><strong>Tratamento:</strong> {record.treatment}</p>}
                  {record.aiSuggestions && record.aiSuggestions.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/20 text-xs flex items-center gap-2">
                      <Brain className="h-3 w-3 text-primary" />
                      IA: {record.aiSuggestions[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
