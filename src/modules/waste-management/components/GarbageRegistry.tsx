/**
 * Controle de Resíduos Sólidos - Garbage Record Book
 * Integrado com tabela waste_records do Supabase
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Trash2, Plus, Download, Search, Package,
  Recycle, AlertTriangle, CheckCircle, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const wasteCategories: Record<string, { label: string; subcategories: string[] }> = {
  A: { label: "Plásticos", subcategories: ["Embalagens", "Cabos", "Redes de pesca", "Outros"] },
  B: { label: "Resíduos alimentares", subcategories: ["Cozinha", "Refeitório", "Provisões estragadas"] },
  C: { label: "Resíduos domésticos", subcategories: ["Papel", "Papelão", "Vidro", "Metal", "Têxteis"] },
  D: { label: "Óleo de cozinha", subcategories: ["Óleo usado", "Gorduras"] },
  E: { label: "Cinzas de incinerador", subcategories: ["Cinzas", "Escórias"] },
  F: { label: "Resíduos operacionais", subcategories: ["Carga", "Manutenção", "Equipamentos"] },
  G: { label: "Carcaça de animais", subcategories: ["Animais mortos a bordo"] },
  H: { label: "Material de pesca", subcategories: ["Redes", "Linhas", "Armadilhas"] },
  I: { label: "E-waste", subcategories: ["Eletrônicos", "Baterias", "Lâmpadas"] },
};

export function GarbageRegistry() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    subcategory: "",
    quantity: 0,
    unit: "kg",
    source: "",
    destination: "",
    method: "",
    vessel_id: "",
    notes: "",
  });

  // Fetch waste records from Supabase
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["waste-records-garbage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_records")
        .select("*, vessels(name)")
        .order("disposal_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Fetch vessels
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-list-short"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").limit(50);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Add record mutation
  const addRecordMutation = useMutation({
    mutationFn: async (rec: typeof newRecord) => {
      const { data, error } = await supabase.from("waste_records").insert({
        waste_type: `Cat.${rec.category} - ${wasteCategories[rec.category]?.label || rec.category}`,
        quantity: rec.quantity,
        unit: rec.unit,
        disposal_method: rec.method || rec.destination,
        disposal_date: rec.date,
        port_code: rec.source,
        vessel_id: rec.vessel_id || null,
        notes: `${rec.subcategory}${rec.notes ? ` | ${rec.notes}` : ""}`,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-records-garbage"] });
      queryClient.invalidateQueries({ queryKey: ["waste-intelligence"] });
      setIsAddDialogOpen(false);
      setNewRecord({ date: new Date().toISOString().split("T")[0], category: "", subcategory: "", quantity: 0, unit: "kg", source: "", destination: "", method: "", vessel_id: "", notes: "" });
      toast.success("Registro de resíduo adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar registro"),
  });

  // Verify record mutation
  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waste_records")
        .update({ certificate_number: `CERT-${new Date().getFullYear()}-${id.slice(0, 6).toUpperCase()}` })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-records-garbage"] });
      toast.success("Registro verificado!");
    },
    onError: () => toast.error("Erro ao verificar registro"),
  });

  const handleAddRecord = () => {
    if (!newRecord.category || newRecord.quantity <= 0) {
      toast.error("Preencha categoria e quantidade");
      return;
    }
    addRecordMutation.mutate(newRecord);
  };

  // Filter records
  const filteredRecords = records.filter((record: any) => {
    const wasteType = record.waste_type || "";
    const vesselName = record.vessels?.name || "";
    if (filterCategory !== "all" && !wasteType.includes(`Cat.${filterCategory}`)) return false;
    if (filterStatus !== "all") {
      const isVerified = !!record.certificate_number;
      if (filterStatus === "verified" && !isVerified) return false;
      if (filterStatus === "pending" && isVerified) return false;
    }
    if (searchTerm && !wasteType.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vesselName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Stats
  const totalWaste = records.reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
  const recycledRecords = records.filter((r: any) => (r.disposal_method || "").toLowerCase().includes("recicl"));
  const totalRecycled = recycledRecords.reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
  const pendingCount = records.filter((r: any) => !r.certificate_number).length;

  // Category totals
  const totalByCategory = Object.keys(wasteCategories).reduce((acc, cat) => {
    acc[cat] = records.filter((r: any) => (r.waste_type || "").includes(`Cat.${cat}`)).reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrado</p>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-green-600">Registros</p>
              </div>
              <FileText className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">{totalWaste.toLocaleString()}</p>
                <p className="text-xs text-primary">Todas categorias</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Reciclagem</p>
                <p className="text-2xl font-bold">{totalWaste > 0 ? Math.round((totalRecycled / totalWaste) * 100) : 0}%</p>
                <p className="text-xs text-cyan-600">{totalRecycled.toLocaleString()} reciclados</p>
              </div>
              <Recycle className="h-8 w-8 text-cyan-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-warning">Aguardando verificação</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumo por Categoria MARPOL Anexo V
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {Object.entries(wasteCategories).map(([key, val]) => (
              <div key={key} className="text-center p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Cat. {key}</div>
                <div className="font-bold text-lg">{totalByCategory[key] || 0}</div>
                <div className="text-xs text-muted-foreground truncate" title={val.label}>{val.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {Object.entries(wasteCategories).map(([key, val]) => (
                <SelectItem key={key} value={key}>{key} - {val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="verified">Verificado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            const rows = ["Data;Tipo;Método;Quantidade;Embarcação;Lote", ...(filteredRecords || []).map((r: any) => `${r.disposal_date?.split("T")[0] || ""};${r.waste_type || ""};${r.disposal_method || ""};${r.quantity || ""};${r.vessels?.name || ""};${r.certificate_number || ""}`)];
            const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `grb-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
            toast.success("Garbage Record Book exportado!");
          }}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Registro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Resíduo</DialogTitle>
                <DialogDescription>Adicione um novo registro de resíduo sólido (MARPOL Anexo V).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Embarcação</Label>
                    <Select value={newRecord.vessel_id} onValueChange={(v) => setNewRecord({ ...newRecord, vessel_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {vessels.map((v: any) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select value={newRecord.category} onValueChange={(v) => setNewRecord({ ...newRecord, category: v, subcategory: "" })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(wasteCategories).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{key} - {val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Subcategoria</Label>
                    <Select value={newRecord.subcategory} onValueChange={(v) => setNewRecord({ ...newRecord, subcategory: v })} disabled={!newRecord.category}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {newRecord.category && wasteCategories[newRecord.category]?.subcategories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantidade</Label>
                    <Input type="number" value={newRecord.quantity} onChange={(e) => setNewRecord({ ...newRecord, quantity: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Unidade</Label>
                    <Select value={newRecord.unit} onValueChange={(v) => setNewRecord({ ...newRecord, unit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="un">unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Origem</Label>
                    <Input value={newRecord.source} onChange={(e) => setNewRecord({ ...newRecord, source: e.target.value })} placeholder="Ex: Cozinha" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Destino</Label>
                    <Select value={newRecord.destination} onValueChange={(v) => setNewRecord({ ...newRecord, destination: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reciclagem">Reciclagem</SelectItem>
                        <SelectItem value="Compostagem">Compostagem</SelectItem>
                        <SelectItem value="Incineração">Incineração</SelectItem>
                        <SelectItem value="Aterro sanitário">Aterro Sanitário</SelectItem>
                        <SelectItem value="Logística reversa">Logística Reversa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Método</Label>
                    <Input value={newRecord.method} onChange={(e) => setNewRecord({ ...newRecord, method: e.target.value })} placeholder="Ex: Empresa credenciada" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Textarea value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} placeholder="Informações adicionais..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddRecord} disabled={addRecordMutation.isPending}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? filteredRecords.slice(0, 50).map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">{record.disposal_date?.split("T")[0] || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{record.waste_type || "General"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{record.vessels?.name || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{record.quantity} {record.unit}</TableCell>
                  <TableCell className="text-xs">{record.disposal_method || "—"}</TableCell>
                  <TableCell>
                    {record.certificate_number ? (
                      <Badge className="bg-green-600 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Verificado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!record.certificate_number && (
                      <Button variant="ghost" size="sm" onClick={() => verifyMutation.mutate(record.id)}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado. Use "Novo Registro" para adicionar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
