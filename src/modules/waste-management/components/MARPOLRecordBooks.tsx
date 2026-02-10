/**
 * MARPOL Record Books - Digital ORB & GRB
 * Oil Record Book & Garbage Record Book with digital signatures
 */
 
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Droplets,
  Trash2,
  Plus,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Signature,
  Calendar,
  Ship,
  MapPin,
  Clock,
  Edit,
  Eye,
  Lock,
  Unlock,
  Filter,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ORBEntry {
  id: string;
  entry_number: string;
  date: string;
  time: string;
  operation_code: string;
  operation_type: string;
  quantity_m3: number;
  tank_id: string;
  tank_name: string;
  remarks: string;
  signed_by: string;
  signature_date?: string;
  status: "draft" | "pending" | "signed" | "verified";
}

interface GRBEntry {
  id: string;
  entry_number: string;
  date: string;
  time: string;
  garbage_category: string;
  estimated_amount_m3: number;
  discharge_location: string;
  discharge_method: string;
  remarks: string;
  signed_by: string;
  signature_date?: string;
  status: "draft" | "pending" | "signed" | "verified";
}

const OPERATION_CODES = [
  { code: "A", description: "Ballasting or cleaning of oil fuel tanks" },
  { code: "B", description: "Discharge of dirty ballast or cleaning water" },
  { code: "C", description: "Collection and disposal of oil residues" },
  { code: "D", description: "Non-automatic discharge overboard" },
  { code: "E", description: "Automatic discharge overboard" },
  { code: "I", description: "Accidental or other exceptional discharge" },
];

const GARBAGE_CATEGORIES = [
  { code: "A", name: "Plastics", color: "bg-red-500" },
  { code: "B", name: "Food wastes", color: "bg-green-500" },
  { code: "C", name: "Domestic wastes", color: "bg-blue-500" },
  { code: "D", name: "Cooking oil", color: "bg-amber-500" },
  { code: "E", name: "Incinerator ashes", color: "bg-gray-500" },
  { code: "F", name: "Operational wastes", color: "bg-purple-500" },
  { code: "G", name: "Animal carcasses", color: "bg-pink-500" },
  { code: "H", name: "Fishing gear", color: "bg-cyan-500" },
  { code: "I", name: "E-waste", color: "bg-orange-500" },
  { code: "J", name: "Cargo residues (HME)", color: "bg-rose-500" },
  { code: "K", name: "Cargo residues (non-HME)", color: "bg-teal-500" },
];

const defaultORBEntries: ORBEntry[] = [
  { id: "1", entry_number: "ORB-2024-001", date: "2024-01-15", time: "08:30", operation_code: "C", operation_type: "Collection and disposal of oil residues", quantity_m3: 2.5, tank_id: "T1", tank_name: "Slop Tank P", remarks: "Transferred to shore reception", signed_by: "Capt. João Silva", signature_date: "2024-01-15", status: "signed" },
  { id: "2", entry_number: "ORB-2024-002", date: "2024-01-14", time: "14:00", operation_code: "B", operation_type: "Discharge of dirty ballast", quantity_m3: 45.0, tank_id: "T2", tank_name: "Bilge Tank", remarks: "Via OWS to sea", signed_by: "Capt. João Silva", signature_date: "2024-01-14", status: "signed" },
  { id: "3", entry_number: "ORB-2024-003", date: "2024-01-16", time: "10:00", operation_code: "A", operation_type: "Cleaning of oil fuel tanks", quantity_m3: 0, tank_id: "T3", tank_name: "Fuel Tank 2", remarks: "Cleaning in progress", signed_by: "", status: "draft" },
];

const defaultGRBEntries: GRBEntry[] = [
  { id: "1", entry_number: "GRB-2024-001", date: "2024-01-15", time: "09:00", garbage_category: "B - Food wastes", estimated_amount_m3: 0.5, discharge_location: "Porto de Macaé", discharge_method: "Shore reception", remarks: "Regular disposal", signed_by: "Capt. João Silva", signature_date: "2024-01-15", status: "signed" },
  { id: "2", entry_number: "GRB-2024-002", date: "2024-01-14", time: "16:30", garbage_category: "C - Domestic wastes", estimated_amount_m3: 0.3, discharge_location: "Porto de Macaé", discharge_method: "Shore reception", remarks: "Paper and cardboard", signed_by: "Capt. João Silva", signature_date: "2024-01-14", status: "signed" },
  { id: "3", entry_number: "GRB-2024-003", date: "2024-01-16", time: "11:00", garbage_category: "A - Plastics", estimated_amount_m3: 0.1, discharge_location: "", discharge_method: "", remarks: "Pending shore disposal", signed_by: "", status: "pending" },
];

export default function MARPOLRecordBooks() {
  const [orbEntries, setOrbEntries] = useState<ORBEntry[]>([]);
  const [grbEntries, setGrbEntries] = useState<GRBEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddORB, setShowAddORB] = useState(false);
  const [showAddGRB, setShowAddGRB] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ORBEntry | GRBEntry | null>(null);

  useEffect(() => {
    async function loadRecords() {
      const { data: wasteRecords } = await supabase
        .from("waste_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (wasteRecords && wasteRecords.length > 0) {
        const orb: ORBEntry[] = wasteRecords
          .filter((r: any) => r.waste_type === "oil" || r.category?.includes("oil"))
          .map((r: any, i: number) => ({
            id: r.id,
            entry_number: `ORB-${new Date(r.created_at).getFullYear()}-${String(i + 1).padStart(3, "0")}`,
            date: r.created_at?.slice(0, 10) || "",
            time: r.created_at?.slice(11, 16) || "00:00",
            operation_code: "C",
            operation_type: r.description || "Oil waste operation",
            quantity_m3: r.quantity || 0,
            tank_id: `T${i + 1}`,
            tank_name: r.storage_location || "Tank",
            remarks: r.notes || "",
            signed_by: r.responsible_officer || "",
            signature_date: r.created_at?.slice(0, 10),
            status: r.status === "completed" ? "signed" as const : "draft" as const,
          }));
        const grb: GRBEntry[] = wasteRecords
          .filter((r: any) => r.waste_type !== "oil" && !r.category?.includes("oil"))
          .map((r: any, i: number) => ({
            id: r.id,
            entry_number: `GRB-${new Date(r.created_at).getFullYear()}-${String(i + 1).padStart(3, "0")}`,
            date: r.created_at?.slice(0, 10) || "",
            time: r.created_at?.slice(11, 16) || "00:00",
            garbage_category: r.category || "B - Food wastes",
            estimated_amount_m3: r.quantity || 0,
            discharge_location: r.discharge_port || "",
            discharge_method: r.disposal_method || "",
            remarks: r.notes || "",
            signed_by: r.responsible_officer || "",
            signature_date: r.created_at?.slice(0, 10),
            status: r.status === "completed" ? "signed" as const : "draft" as const,
          }));
        if (orb.length > 0) setOrbEntries(orb);
        else setOrbEntries(defaultORBEntries);
        if (grb.length > 0) setGrbEntries(grb);
        else setGrbEntries(defaultGRBEntries);
      } else {
        setOrbEntries(defaultORBEntries);
        setGrbEntries(defaultGRBEntries);
      }
    }
    loadRecords();
  }, []);

  const handleSign = (entry: ORBEntry | GRBEntry, type: "orb" | "grb") => {
    setSelectedEntry(entry);
    setShowSignature(true);
  };

  const confirmSignature = () => {
    if (!selectedEntry) return;
    
    const now = format(new Date(), "yyyy-MM-dd");
    
    // Update the entry
    if ("operation_code" in selectedEntry) {
      setOrbEntries(prev => prev.map(e => 
        e.id === selectedEntry.id 
          ? { ...e, status: "signed", signed_by: "Capt. João Silva", signature_date: now }
          : e
      ));
    } else {
      setGrbEntries(prev => prev.map(e => 
        e.id === selectedEntry.id 
          ? { ...e, status: "signed", signed_by: "Capt. João Silva", signature_date: now }
          : e
      ));
    }
    
    toast.success("Registro assinado digitalmente");
    setShowSignature(false);
    setSelectedEntry(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-success/20 text-success"><Lock className="h-3 w-3 mr-1" /> Assinado</Badge>;
      case "verified":
        return <Badge className="bg-blue-500/20 text-blue-500"><FileCheck className="h-3 w-3 mr-1" /> Verificado</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-500"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      default:
        return <Badge className="bg-muted"><Edit className="h-3 w-3 mr-1" /> Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Registros ORB</p>
                <p className="text-2xl font-bold">{orbEntries.length}</p>
              </div>
              <Droplets className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Registros GRB</p>
                <p className="text-2xl font-bold">{grbEntries.length}</p>
              </div>
              <Trash2 className="h-8 w-8 text-emerald-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Assinados</p>
                <p className="text-2xl font-bold text-success">
                  {orbEntries.filter(e => e.status === "signed").length + 
                   grbEntries.filter(e => e.status === "signed").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">
                  {orbEntries.filter(e => e.status === "draft" || e.status === "pending").length +
                   grbEntries.filter(e => e.status === "draft" || e.status === "pending").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Record Books Tabs */}
      <Tabs defaultValue="orb" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="orb" className="gap-2">
              <Droplets className="h-4 w-4" />
              Oil Record Book (ORB)
            </TabsTrigger>
            <TabsTrigger value="grb" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Garbage Record Book (GRB)
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar registro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value="orb">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Oil Record Book - Parte I
                  </CardTitle>
                  <CardDescription>Operações em espaços de máquinas - MARPOL Anexo I</CardDescription>
                </div>
                <Button onClick={() => setShowAddORB(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {orbEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        entry.status === "signed" ? "bg-success/5 border-success/20" :
                        entry.status === "pending" ? "bg-amber-500/5 border-amber-500/20" :
                        ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {entry.operation_code}
                          </div>
                          <div>
                            <p className="font-medium">{entry.entry_number}</p>
                            <p className="text-sm text-muted-foreground">{entry.operation_type}</p>
                          </div>
                        </div>
                        {getStatusBadge(entry.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Data/Hora</p>
                          <p className="font-medium">{format(new Date(entry.date), "dd/MM/yyyy")} {entry.time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Tanque</p>
                          <p className="font-medium">{entry.tank_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Quantidade</p>
                          <p className="font-medium">{entry.quantity_m3} m³</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Responsável</p>
                          <p className="font-medium">{entry.signed_by || "—"}</p>
                        </div>
                      </div>

                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground mb-3">{entry.remarks}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        {entry.status !== "signed" && (
                          <Button size="sm" onClick={() => handleSign(entry, "orb")}>
                            <Signature className="h-3 w-3 mr-1" />
                            Assinar
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grb">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Garbage Record Book
                  </CardTitle>
                  <CardDescription>Registro de descargas de lixo - MARPOL Anexo V</CardDescription>
                </div>
                <Button onClick={() => setShowAddGRB(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {grbEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        entry.status === "signed" ? "bg-success/5 border-success/20" :
                        entry.status === "pending" ? "bg-amber-500/5 border-amber-500/20" :
                        ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white ${
                            GARBAGE_CATEGORIES.find(c => entry.garbage_category.startsWith(c.code))?.color || "bg-gray-500"
                          }`}>
                            {entry.garbage_category.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{entry.entry_number}</p>
                            <p className="text-sm text-muted-foreground">{entry.garbage_category}</p>
                          </div>
                        </div>
                        {getStatusBadge(entry.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Data/Hora</p>
                          <p className="font-medium">{format(new Date(entry.date), "dd/MM/yyyy")} {entry.time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Quantidade</p>
                          <p className="font-medium">{entry.estimated_amount_m3} m³</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Local</p>
                          <p className="font-medium">{entry.discharge_location || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Método</p>
                          <p className="font-medium">{entry.discharge_method || "—"}</p>
                        </div>
                      </div>

                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground mb-3">{entry.remarks}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        {entry.status !== "signed" && (
                          <Button size="sm" onClick={() => handleSign(entry, "grb")}>
                            <Signature className="h-3 w-3 mr-1" />
                            Assinar
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Garbage Categories Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Categorias de Lixo - MARPOL Anexo V
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {GARBAGE_CATEGORIES.map((cat) => (
              <div key={cat.code} className="flex items-center gap-2 p-2 border rounded-lg">
                <div className={`h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold ${cat.color}`}>
                  {cat.code}
                </div>
                <span className="text-xs">{cat.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature Dialog */}
      <Dialog open={showSignature} onOpenChange={setShowSignature}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Signature className="h-5 w-5 text-primary" />
              Assinatura Digital do Comandante
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Registro a ser assinado:</p>
              <p className="text-lg font-bold">
                {"operation_code" in (selectedEntry || {}) 
                  ? (selectedEntry as ORBEntry)?.entry_number 
                  : (selectedEntry as GRBEntry)?.entry_number}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Ao assinar, você confirma que as informações registradas são precisas e completas,
                conforme exigido pela regulamentação MARPOL.
              </p>
              <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                <p className="text-muted-foreground text-sm">Área de assinatura digital</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comandante</Label>
              <Input value="Capt. João Silva" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input value={format(new Date(), "dd/MM/yyyy HH:mm")} readOnly />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignature(false)}>Cancelar</Button>
            <Button onClick={confirmSignature} className="gap-2">
              <Lock className="h-4 w-4" />
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add ORB Dialog */}
      <Dialog open={showAddORB} onOpenChange={setShowAddORB}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Registro ORB</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código da Operação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o código" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATION_CODES.map((op) => (
                    <SelectItem key={op.code} value={op.code}>
                      {op.code} - {op.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanque</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">Slop Tank P</SelectItem>
                    <SelectItem value="T2">Bilge Tank</SelectItem>
                    <SelectItem value="T3">Fuel Tank 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade (m³)</Label>
                <Input type="number" step="0.1" placeholder="0.0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Detalhes da operação..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddORB(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ type: "ORB", created_at: new Date().toISOString() }),
                  interaction_type: "marpol_orb_record",
                  module_name: "waste-management"
                });
                if (error) throw error;
                toast.success("Registro ORB criado e salvo");
                setShowAddORB(false);
              } catch {
                toast.error("Erro ao salvar registro ORB");
              }
            }}>
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add GRB Dialog */}
      <Dialog open={showAddGRB} onOpenChange={setShowAddGRB}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Registro GRB</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoria de Lixo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {GARBAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.code} - {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantidade Estimada (m³)</Label>
              <Input type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Local de Descarga</Label>
              <Input placeholder="Ex: Porto de Macaé" />
            </div>
            <div className="space-y-2">
              <Label>Método de Descarga</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shore">Shore reception facility</SelectItem>
                  <SelectItem value="sea">Discharge to sea</SelectItem>
                  <SelectItem value="incineration">Incineration</SelectItem>
                  <SelectItem value="compactor">Compactor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Detalhes da descarga..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGRB(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ type: "GRB", created_at: new Date().toISOString() }),
                  interaction_type: "marpol_grb_record",
                  module_name: "waste-management"
                });
                if (error) throw error;
                toast.success("Registro GRB criado e salvo");
                setShowAddGRB(false);
              } catch {
                toast.error("Erro ao salvar registro GRB");
              }
            }}>
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
