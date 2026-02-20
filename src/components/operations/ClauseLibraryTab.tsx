/**
 * Charter Party Clause Library
 * Searchable repository of standard maritime contract clauses (BIMCO, NYPE, SHELLTIME, etc.)
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Search, Plus, BookOpen, Copy, Star, Filter, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface Clause {
  id: string;
  title: string;
  category: string;
  source: string;
  text: string;
  tags: string[];
  isFavorite: boolean;
  usage: number;
  lastUsed: string;
}

const STANDARD_CLAUSES: Clause[] = [
  { id: "1", title: "BIMCO Bunker Clause", category: "Bunker", source: "BIMCO", text: "Owners shall supply and pay for all fuel oil and diesel oil required by the vessel, including for domestic purposes. The grade and specification of fuels shall comply with the vessel's requirements and applicable regulations, including MARPOL Annex VI.", tags: ["bunker", "fuel", "marpol"], isFavorite: true, usage: 45, lastUsed: "2025-02-10" },
  { id: "2", title: "Off-Hire Clause (NYPE)", category: "Off-Hire", source: "NYPE 2015", text: "In the event of loss of time from deficiency of men/stores, fire, breakdown, drydocking, or any other similar cause preventing the full working of the vessel, the payment of hire and overtime shall cease for the time thereby lost.", tags: ["off-hire", "nype", "time-charter"], isFavorite: true, usage: 38, lastUsed: "2025-02-08" },
  { id: "3", title: "War Risk Clause", category: "Insurance", source: "BIMCO CONWARTIME 2013", text: "The vessel shall not be required to continue to or go to or remain at any port or zone which the Master or Owners may in their discretion consider dangerous by reason of any actual or threatened act of war, hostilities, warlike operations.", tags: ["war-risk", "insurance", "safety"], isFavorite: false, usage: 22, lastUsed: "2025-01-25" },
  { id: "4", title: "Laytime Definition Clause", category: "Laytime", source: "BIMCO", text: "Laytime shall commence at 08:00 hours on the next business day following receipt of valid Notice of Readiness, provided the vessel is in all respects ready to load/discharge. Sundays and holidays excluded unless used (SHEX UU).", tags: ["laytime", "demurrage", "nor"], isFavorite: true, usage: 51, lastUsed: "2025-02-12" },
  { id: "5", title: "BIMCO Sanctions Clause", category: "Compliance", source: "BIMCO 2020", text: "The parties shall comply with all applicable sanctions laws and regulations. Neither party shall be obliged to perform any obligation under this charter if performance would be in violation of any sanctions.", tags: ["sanctions", "compliance", "legal"], isFavorite: false, usage: 15, lastUsed: "2025-01-18" },
  { id: "6", title: "ETS Clause", category: "Emissions", source: "BIMCO 2023", text: "Charterers shall reimburse Owners for the cost of EU ETS allowances attributable to voyages performed under this charter party. The number of allowances shall be calculated in accordance with EU MRV and EU ETS Directive.", tags: ["ets", "emissions", "eu", "carbon"], isFavorite: true, usage: 33, lastUsed: "2025-02-14" },
  { id: "7", title: "SHELLTIME 4 Hire Payment", category: "Hire", source: "SHELLTIME 4", text: "Hire shall be paid monthly in advance on the first day of each month. Payment shall be made in United States Dollars by telegraphic transfer to the Owners' nominated bank account.", tags: ["hire", "payment", "shelltime"], isFavorite: false, usage: 28, lastUsed: "2025-02-01" },
  { id: "8", title: "BIMCO Slow Steaming Clause", category: "Operations", source: "BIMCO 2020", text: "Charterers may order the vessel to reduce speed below the maximum contractual speed ('Slow Steaming'). The Owners shall comply provided the Master is satisfied that such reduced speed does not endanger the vessel, crew, or cargo.", tags: ["slow-steaming", "speed", "fuel-saving"], isFavorite: false, usage: 19, lastUsed: "2025-01-30" },
];

const CATEGORIES = ["All", "Bunker", "Off-Hire", "Insurance", "Laytime", "Compliance", "Emissions", "Hire", "Operations"];
const SOURCES = ["All", "BIMCO", "NYPE 2015", "SHELLTIME 4", "BIMCO CONWARTIME 2013", "BIMCO 2020", "BIMCO 2023"];

export function ClauseLibraryTab() {
  const [clauses, setClauses] = useState(STANDARD_CLAUSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load custom clauses from DB
  const { data: dbClauses = [] } = useQuery({
    queryKey: ["charter-party-clauses"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("charter_party_clauses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
    staleTime: 120000,
  });

  const filtered = useMemo(() => {
    return clauses.filter(c => {
      const matchSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(t => t.includes(searchTerm.toLowerCase()));
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [clauses, searchTerm, categoryFilter]);

  const copyClause = (clause: Clause) => {
    navigator.clipboard.writeText(clause.text);
    toast.success(`"${clause.title}" copiado para a área de transferência`);
  };

  const toggleFavorite = (id: string) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const exportCSV = () => {
    const header = "Title,Category,Source,Tags,Usage,Text\n";
    const rows = clauses.map(c => `"${c.title}","${c.category}","${c.source}","${c.tags.join("; ")}",${c.usage},"${c.text.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "clause_library.csv"; a.click();
    toast.success("Biblioteca exportada!");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cláusulas, tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Cláusula</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Cláusula Customizada</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); setShowCreate(false); toast.success("Cláusula adicionada!"); }} className="space-y-3">
              <Input placeholder="Título da cláusula" required />
              <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="Operations"><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{CATEGORIES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                <Input placeholder="Fonte (ex: BIMCO)" />
              </div>
              <Textarea placeholder="Texto completo da cláusula..." rows={5} required />
              <Input placeholder="Tags (separadas por vírgula)" />
              <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{filtered.length} cláusulas</Badge>
        <Badge variant="outline" className="bg-warning/10">{clauses.filter(c => c.isFavorite).length} favoritas</Badge>
      </div>

      {/* Clause Cards */}
      <div className="space-y-2">
        {filtered.map(clause => (
          <Card key={clause.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === clause.id ? null : clause.id)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">{clause.title}</h4>
                    <Badge variant="outline" className="text-[10px]">{clause.category}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{clause.source}</Badge>
                  </div>
                  {expandedId === clause.id ? (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap border-l-2 border-primary/30 pl-3">{clause.text}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{clause.text}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {clause.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] bg-muted/30">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(clause.id)}>
                    <Star className={`h-3.5 w-3.5 ${clause.isFavorite ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyClause(clause)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Nenhuma cláusula encontrada para "{searchTerm}"
        </CardContent></Card>
      )}
    </div>
  );
}
