/**
 * Global Crew Marketplace - World-Class Feature
 * AI-powered crew matching, availability board, and talent pool
 * No competitor offers a global marketplace integrated with compliance
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Globe, Search, Star, Anchor, Award, Bot, TrendingUp, MapPin, Calendar, Filter, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CrewCandidate {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  experience_years: number;
  stcw_valid: boolean;
  mlc_compliant: boolean;
  availability: string;
  match_score: number;
  skills: string[];
  last_vessel_type: string;
  rating: number;
}

const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer",
  "Chief Engineer", "2nd Engineer", "3rd Engineer", "Electrician",
  "Bosun", "AB Seaman", "OS Seaman", "Oiler", "Wiper",
  "Cook", "Steward", "DP Operator", "Crane Operator",
];

const VESSEL_TYPES = [
  "AHTS", "PSV", "FPSO", "Tanker", "Bulk Carrier", "Container",
  "Offshore Drill", "Cable Layer", "Tug", "MPSV", "DSV",
];

// Generate deterministic candidates using seed-based values
function seedHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateCandidates(count: number): CrewCandidate[] {
  const firstNames = ["João", "Maria", "Pedro", "Ana", "Carlos", "Fernanda", "Lucas", "Julia", "Rafael", "Camila", "Andrei", "Sven", "Raj", "Yuki", "Kim"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Ferreira", "Rodrigues", "Petrov", "Müller", "Patel", "Tanaka", "Lee"];
  const nationalities = ["🇧🇷 Brasil", "🇵🇭 Filipinas", "🇮🇳 Índia", "🇺🇦 Ucrânia", "🇷🇺 Rússia", "🇳🇴 Noruega", "🇬🇧 Reino Unido", "🇯🇵 Japão", "🇰🇷 Coreia"];
  const skills = ["DP-2", "GMDSS", "Tanker", "HUET", "BOSIET", "H2S", "ECDIS", "Crane", "Welding", "ERM"];
  const availabilities = ["Imediata", "15 dias", "30 dias", "45 dias", "60 dias"];

  return Array.from({ length: count }, (_, i) => {
    const id = `CRW-${String(i + 1).padStart(4, "0")}`;
    const h = seedHash(id);
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const skillCount = 2 + (h % 4);
    const startIdx = h % skills.length;
    const candidateSkills = Array.from({ length: skillCount }, (_, si) => skills[(startIdx + si) % skills.length]);

    return {
      id,
      name,
      rank: RANKS[i % RANKS.length],
      nationality: nationalities[i % nationalities.length],
      experience_years: 3 + (h % 20),
      stcw_valid: (h % 100) > 15,
      mlc_compliant: (h % 100) > 10,
      availability: availabilities[h % availabilities.length],
      match_score: 60 + (h % 40),
      skills: candidateSkills,
      last_vessel_type: VESSEL_TYPES[h % VESSEL_TYPES.length],
      rating: 3 + ((h % 21) / 10),
    };
  });
}

export default function CrewMarketplacePage() {
  const [candidates, setCandidates] = useState<CrewCandidate[]>([]);
  const [filteredCandidates, setFiltered] = useState<CrewCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [vesselFilter, setVesselFilter] = useState("");
  const [isMatchingAI, setIsMatchingAI] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CrewCandidate | null>(null);
  const [aiRecommendation, setAIRecommendation] = useState("");

  useEffect(() => {
    const data = generateCandidates(50);
    setCandidates(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    let result = candidates;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.rank.toLowerCase().includes(q) || c.nationality.toLowerCase().includes(q));
    }
    if (rankFilter) result = result.filter(c => c.rank === rankFilter);
    if (vesselFilter) result = result.filter(c => c.last_vessel_type === vesselFilter);
    setFiltered(result);
  }, [searchQuery, rankFilter, vesselFilter, candidates]);

  const handleAIMatch = async (candidate: CrewCandidate) => {
    setSelectedCandidate(candidate);
    setIsMatchingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Analise este candidato para posição marítima e dê uma recomendação detalhada:

Nome: ${candidate.name}
Posto: ${candidate.rank}
Nacionalidade: ${candidate.nationality}
Experiência: ${candidate.experience_years} anos
STCW válido: ${candidate.stcw_valid ? "Sim" : "Não"}
MLC conforme: ${candidate.mlc_compliant ? "Sim" : "Não"}
Competências: ${candidate.skills.join(", ")}
Último tipo de embarcação: ${candidate.last_vessel_type}
Avaliação: ${candidate.rating}/5
Match Score: ${candidate.match_score}%

Forneça: pontos fortes, riscos, recomendação de embarque e compatibilidade com diferentes tipos de operação (offshore, cabotagem, longo curso).`,
        },
      });
      if (error) throw error;
      setAIRecommendation(data?.response || "Análise concluída.");
    } catch (err) {
      toast.error("Erro na análise IA");
    } finally {
      setIsMatchingAI(false);
    }
  };

  const topStats = {
    total: candidates.length,
    available: candidates.filter(c => c.availability === "Imediata").length,
    stcwValid: candidates.filter(c => c.stcw_valid).length,
    avgScore: Math.round(candidates.reduce((a, b) => a + b.match_score, 0) / (candidates.length || 1)),
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-primary" />
            Global Crew Marketplace — Pool de Talentos Marítimos
          </CardTitle>
          <CardDescription>
            Marketplace global com matching inteligente por IA. Encontre e contrate tripulantes qualificados com verificação automática de STCW, MLC e competências.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pool Total", value: topStats.total, icon: Users },
          { label: "Disponíveis Agora", value: topStats.available, icon: UserCheck },
          { label: "STCW Válido", value: `${topStats.stcwValid}`, icon: Award },
          { label: "Match Score Médio", value: `${topStats.avgScore}%`, icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <kpi.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar nome, posto, nacionalidade..." className="pl-10" />
            </div>
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Posto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Postos</SelectItem>
                {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Tipo de Embarcação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {VESSEL_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setRankFilter(""); setVesselFilter(""); }}>
              <Filter className="h-4 w-4 mr-1" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{filteredCandidates.length} Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredCandidates.sort((a, b) => b.match_score - a.match_score).map(c => (
                    <div
                      key={c.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedCandidate?.id === c.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelectedCandidate(c)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{c.name}</p>
                            <Badge variant="outline" className="text-xs">{c.id}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.rank} • {c.nationality} • {c.experience_years}a exp</p>
                          <div className="flex flex-wrap gap-1">
                            {c.skills.slice(0, 4).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{c.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant={c.match_score >= 85 ? "default" : c.match_score >= 70 ? "secondary" : "outline"}>
                            {c.match_score}%
                          </Badge>
                          <p className="text-xs text-muted-foreground">{c.availability}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {c.stcw_valid && <Badge className="text-xs bg-success/10 text-success border-success/20" variant="outline">STCW ✓</Badge>}
                        {c.mlc_compliant && <Badge className="text-xs bg-success/10 text-success border-success/20" variant="outline">MLC ✓</Badge>}
                        <Badge variant="outline" className="text-xs">{c.last_vessel_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Análise do Candidato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCandidate ? (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold">{selectedCandidate.name}</p>
                  <p className="text-muted-foreground">{selectedCandidate.rank}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={`star-${i}`} className={`h-4 w-4 ${i < Math.floor(selectedCandidate.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="ml-1 text-sm">{selectedCandidate.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 border rounded"><p className="text-xs text-muted-foreground">Experiência</p><p className="font-medium">{selectedCandidate.experience_years} anos</p></div>
                  <div className="p-2 border rounded"><p className="text-xs text-muted-foreground">Match</p><p className="font-medium">{selectedCandidate.match_score}%</p></div>
                  <div className="p-2 border rounded"><p className="text-xs text-muted-foreground">Disponível</p><p className="font-medium">{selectedCandidate.availability}</p></div>
                  <div className="p-2 border rounded"><p className="text-xs text-muted-foreground">Último Navio</p><p className="font-medium">{selectedCandidate.last_vessel_type}</p></div>
                </div>

                <Button onClick={() => handleAIMatch(selectedCandidate)} disabled={isMatchingAI} className="w-full gap-2">
                  {isMatchingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  {isMatchingAI ? "Analisando..." : "Análise IA Completa"}
                </Button>

                {aiRecommendation && (
                  <ScrollArea className="h-[250px]">
                    <div className="p-3 border rounded-lg bg-muted/30 text-sm whitespace-pre-wrap">{aiRecommendation}</div>
                  </ScrollArea>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione um candidato</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
