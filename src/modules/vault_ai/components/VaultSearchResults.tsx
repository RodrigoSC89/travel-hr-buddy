import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Star } from "lucide-react";

export const VaultSearchResults: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results] = useState([
    { id: "1", title: "Safety Manual 2024", type: "manual", similarity: 0.95, excerpt: "Complete safety procedures..." },
    { id: "2", title: "Engine Maintenance Guide", type: "technical", similarity: 0.88, excerpt: "Comprehensive engine maintenance..." },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar documentos..." className="flex-1" /><Button><Search className="h-4 w-4" /></Button></div>
      <div className="space-y-2">{results.map(r => (<Card key={r.id}><CardHeader><div className="flex items-start justify-between"><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-4 w-4" />{r.title}</CardTitle><div className="flex items-center gap-1 text-sm"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{(r.similarity * 100).toFixed(0)}%</div></div></CardHeader><CardContent><Badge>{r.type}</Badge><p className="mt-2 text-sm text-muted-foreground">{r.excerpt}</p></CardContent></Card>))}</div>
    </div>
  );
};
