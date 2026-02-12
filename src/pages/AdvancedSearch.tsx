/**
 * Advanced Search - Busca Avançada
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, FileText, Ship, Users, Calendar } from "lucide-react";

const searchResults = [
  { id: 1, type: "document", title: "Contrato de Afretamento", context: "...contrato de afretamento da embarcação...", date: "01/02/2026" },
  { id: 2, type: "vessel", title: "MV Atlantic Star", context: "...embarcação tipo graneleiro...", date: "31/01/2026" },
  { id: 3, type: "crew", title: "João Silva", context: "...tripulante certificado STCW...", date: "30/01/2026" },
  { id: 4, type: "document", title: "Manual de Operações", context: "...procedimentos operacionais...", date: "29/01/2026" },
];

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-5 w-5 text-info" />;
      case "vessel": return <Ship className="h-5 w-5 text-success" />;
      case "crew": return <Users className="h-5 w-5 text-accent-foreground" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Busca Avançada</h2>
          <p className="text-muted-foreground">Encontre qualquer informação no sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Digite sua busca..." 
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="documents">Documentos</SelectItem>
                <SelectItem value="vessels">Embarcações</SelectItem>
                <SelectItem value="crew">Tripulação</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>{searchResults.length} resultados encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-start gap-4 border-b pb-4 last:border-0 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                {getIcon(result.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{result.title}</p>
                    <Badge variant="outline">{result.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.context}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    <span>{result.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
