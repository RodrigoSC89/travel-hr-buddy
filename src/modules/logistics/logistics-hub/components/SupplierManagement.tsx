import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Building2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  supplier_type: string;
  rating?: number;
  is_active: boolean;
}

export const SupplierManagement: React.FC = () => {
  const { toast } = useToast();
  const [suppliers] = useState<Supplier[]>([
    { id: "1", name: "Maritime Supplies Co.", contact_name: "John Smith", email: "john@maritimesupplies.com", phone: "+1-555-0123", country: "USA", supplier_type: "equipment", rating: 4.5, is_active: true },
    { id: "2", name: "Ocean Parts Ltd", contact_name: "Maria Garcia", email: "maria@oceanparts.com", phone: "+44-20-1234-5678", country: "UK", supplier_type: "parts", rating: 4.8, is_active: true },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || s.supplier_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6" />Gestão de Fornecedores</h2>
          <p className="text-muted-foreground mt-1">Gerenciar fornecedores e parceiros</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Adicionar Fornecedor</Button>
      </div>
      <Card><CardContent className="pt-6"><div className="flex gap-4"><div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar fornecedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div><Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem><SelectItem value="parts">Peças</SelectItem><SelectItem value="equipment">Equipamentos</SelectItem></SelectContent></Select></div></CardContent></Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredSuppliers.map(s => (<Card key={s.id}><CardHeader><CardTitle className="text-lg">{s.name}</CardTitle><CardDescription>{s.contact_name}</CardDescription></CardHeader><CardContent><div className="space-y-2"><Badge variant="secondary">{s.supplier_type}</Badge><p className="text-sm">📧 {s.email}</p><p className="text-sm">📱 {s.phone}</p></div></CardContent></Card>))}</div>
    </div>
  );
};
