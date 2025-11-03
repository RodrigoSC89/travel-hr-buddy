/**
 * ISM Audit History Component
 * PATCH-609: Historical view and comparison
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ship, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ISMAudit } from "@/types/ism-audit";
import { calculateComplianceScore } from "@/types/ism-audit";
import { NonConformityTag } from "./components/NonConformityTag";

interface ISMAuditHistoryProps {
  audits: ISMAudit[];
  onViewDetails: (audit: ISMAudit) => void;
  onBack: () => void;
}

export function ISMAuditHistory({ audits, onViewDetails, onBack }: ISMAuditHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Get unique vessel names
  const vessels = useMemo(() => {
    const uniqueVessels = new Set(audits.map(a => a.vesselName));
    return Array.from(uniqueVessels).sort();
  }, [audits]);

  // Filter and sort audits
  const filteredAudits = useMemo(() => {
    const result = audits.filter(audit => {
      const matchesSearch = 
        audit.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.port?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVessel = filterVessel === "all" || audit.vesselName === filterVessel;
      const matchesType = filterType === "all" || audit.auditType === filterType;

      return matchesSearch && matchesVessel && matchesType;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
      case "date-desc":
        return new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime();
      case "date-asc":
        return new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime();
      case "score-desc":
        return (b.complianceScore || 0) - (a.complianceScore || 0);
      case "score-asc":
        return (a.complianceScore || 0) - (b.complianceScore || 0);
      case "vessel":
        return a.vesselName.localeCompare(b.vesselName);
      default:
        return 0;
      }
    });

    return result;
  }, [audits, searchTerm, filterVessel, filterType, sortBy]);

  // Calculate trend for each vessel
  const vesselTrends = useMemo(() => {
    const trends = new Map<string, { current: number; previous: number; trend: "up" | "down" | "stable" }>();

    vessels.forEach(vessel => {
      const vesselAudits = audits
        .filter(a => a.vesselName === vessel && a.complianceScore !== undefined)
        .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime());

      if (vesselAudits.length >= 2) {
        const current = vesselAudits[0].complianceScore!;
        const previous = vesselAudits[1].complianceScore!;
        const diff = current - previous;
        
        trends.set(vessel, {
          current,
          previous,
          trend: diff > 2 ? "up" : diff < -2 ? "down" : "stable"
        });
      } else if (vesselAudits.length === 1) {
        trends.set(vessel, {
          current: vesselAudits[0].complianceScore!,
          previous: 0,
          trend: "stable"
        });
      }
    });

    return trends;
  }, [audits, vessels]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Auditorias ISM</h1>
          <p className="text-gray-600 mt-1">
            {filteredAudits.length} auditorias encontradas
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as embarcações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as embarcações</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="internal">Interna</SelectItem>
                <SelectItem value="external">Externa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Data (mais recente)</SelectItem>
                <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
                <SelectItem value="score-desc">Score (maior)</SelectItem>
                <SelectItem value="score-asc">Score (menor)</SelectItem>
                <SelectItem value="vessel">Embarcação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vessel Trends */}
      {vessels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendências por Embarcação</CardTitle>
            <CardDescription>Comparação com auditoria anterior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vessels.map(vessel => {
                const trend = vesselTrends.get(vessel);
                if (!trend) return null;

                const TrendIcon = 
                  trend.trend === "up" ? TrendingUp :
                  trend.trend === "down" ? TrendingDown :
                  Minus;

                const trendColor = 
                  trend.trend === "up" ? "text-green-600" :
                  trend.trend === "down" ? "text-red-600" :
                  "text-gray-600";

                return (
                  <div key={vessel} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{vessel}</span>
                      <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{trend.current}%</span>
                      {trend.previous > 0 && (
                        <span className="text-sm text-gray-500">
                          (anterior: {trend.previous}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit List */}
      <div className="space-y-3">
        {filteredAudits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Nenhuma auditoria encontrada com os filtros aplicados
            </CardContent>
          </Card>
        ) : (
          filteredAudits.map(audit => {
            const score = calculateComplianceScore(audit.items);
            const nonCompliantItems = audit.items.filter(i => i.compliant === "non-compliant");
            
            return (
              <Card
                key={audit.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onViewDetails(audit)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-lg">{audit.vesselName}</span>
                        <Badge variant={audit.auditType === "internal" ? "default" : "secondary"}>
                          {audit.auditType === "internal" ? "Interna" : "Externa"}
                        </Badge>
                        <Badge variant="outline">{audit.status}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </div>
                        {audit.port && <span>Porto: {audit.port}</span>}
                        <span>Auditor: {audit.auditor}</span>
                      </div>

                      {nonCompliantItems.length > 0 && (
                        <div className="flex gap-2">
                          <NonConformityTag 
                            riskLevel="high" 
                            count={nonCompliantItems.length} 
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {score.score}%
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {score.grade}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {score.compliantItems}/{score.totalItems - score.notApplicableItems} conformes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
