/**
import { useState, useCallback } from "react";;
 * DDS Panel - Diálogo Diário de Segurança
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Users, Clock, FileText, CheckCircle, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { DDSRecord } from "../types";

interface DDSPanelProps {
  records: DDSRecord[];
  onCreateDDS: (record: Partial<DDSRecord>) => Promise<void>;
  loading?: boolean;
}

export const DDSPanel: React.FC<DDSPanelProps> = ({ records, onCreateDDS, loading }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    vessel_name: "",
    conductor: "",
    participants_count: 0,
    duration_minutes: 15,
    notes: ""
});

  const handleSubmit = async () => {
    if (!formData.topic || !formData.vessel_name || !formData.conductor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    await onCreateDDS({
      ...formData,
      date: new Date().toISOString(),
      participants: []
    };

    setFormData({
      topic: "",
      vessel_name: "",
      conductor: "",
      participants_count: 0,
      duration_minutes: 15,
      notes: ""
    };
    setDialogOpen(false);
    toast.success("DDS registrado com sucesso!");
  };

  const filteredRecords = records.filter(r =>
    r.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vessel_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayRecords = records.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.date).toDateString() === today;
  };

  const weekRecords = records.filter(r => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(r.date) >= weekAgo;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DDS Hoje</p>
                <p className="text-2xl font-bold">{todayRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{weekRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">
                  {records.reduce((acc, r) => acc + r.participants_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {records.length > 0
                    ? Math.round(records.reduce((acc, r) => acc + r.duration_minutes, 0) / records.length)
                    : 0}min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar DDS..."
            value={searchTerm}
            onChange={handleChange}
            className="pl-10"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Registrar DDS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Diálogo Diário de Segurança</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tema do DDS *</Label>
                <Input
                  placeholder="Ex: Uso correto de EPIs"
                  value={formData.topic}
                  onChange={handleChange})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Embarcação *</Label>
                  <Select
                    value={formData.vessel_name}
                    onValueChange={(v) => setFormData({ ...formData, vessel_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OSV Atlantic I">OSV Atlantic I</SelectItem>
                      <SelectItem value="OSV Atlantic II">OSV Atlantic II</SelectItem>
                      <SelectItem value="PSV Oceanic">PSV Oceanic</SelectItem>
                      <SelectItem value="AHTS Navigator">AHTS Navigator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condutor *</Label>
                  <Input
                    placeholder="Nome do condutor"
                    value={formData.conductor}
                    onChange={handleChange})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nº Participantes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.participants_count}
                    onChange={handleChange})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duração (min)</Label>
                  <Input
                    type="number"
                    min={5}
                    value={formData.duration_minutes}
                    onChange={handleChange})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Anotações adicionais..."
                  value={formData.notes}
                  onChange={handleChange})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleSetDialogOpen}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* DDS List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros de DDS</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum DDS registrado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{record.topic}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{record.vessel_name}</span>
                        <span>•</span>
                        <span>Condutor: {record.conductor}</span>
                        <span>•</span>
                        <span>{record.participants_count} participantes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {record.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
