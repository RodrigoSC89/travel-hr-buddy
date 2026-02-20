/**
 * Wave 44 - ISM Gap Analyzer
 * Análise de lacunas nos 13 elementos do ISM Code
 * Schema: ism_elements (element_number, title), ism_evidence (requirement_id, status)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ISM_ELEMENTS = [
  { code: '1', name: 'General' },
  { code: '2', name: 'Safety & Environmental Policy' },
  { code: '3', name: 'Company Responsibilities' },
  { code: '4', name: 'Designated Person(s)' },
  { code: '5', name: "Master's Responsibility" },
  { code: '6', name: 'Resources & Personnel' },
  { code: '7', name: 'Shipboard Operations' },
  { code: '8', name: 'Emergency Preparedness' },
  { code: '9', name: 'Non-Conformities & CAPA' },
  { code: '10', name: 'Maintenance' },
  { code: '11', name: 'Documentation' },
  { code: '12', name: 'Verification & Audit' },
  { code: '13', name: 'Certification' },
];

export default function ISMGapAnalyzer() {
  const { data: ismElements = [], isLoading } = useQuery<any[]>({
    queryKey: ['ism-gap-analysis'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('ism_elements')
        .select('id, element_number, title')
        .order('element_number');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: evidence = [] } = useQuery<any[]>({
    queryKey: ['ism-evidence-count'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('ism_evidence')
        .select('requirement_id, status')
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: requirements = [] } = useQuery<any[]>({
    queryKey: ['ism-requirements-map'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('ism_requirements')
        .select('id, element_id')
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const analysis = useMemo(() => {
    const elementMap = new Map(ismElements.map((e: any) => [String(e.element_number), e]));
    
    // Build requirement -> element mapping
    const reqToElement = new Map(requirements.map((r: any) => [r.id, r.element_id]));
    
    // Count evidence per element
    const evidenceByElement: Record<string, { total: number; approved: number }> = {};
    evidence.forEach((ev: any) => {
      const elementId = reqToElement.get(ev.requirement_id);
      if (!elementId) return;
      if (!evidenceByElement[elementId]) evidenceByElement[elementId] = { total: 0, approved: 0 };
      evidenceByElement[elementId].total++;
      if (ev.status === 'approved' || ev.status === 'verified') evidenceByElement[elementId].approved++;
    });

    const elements = ISM_ELEMENTS.map(ism => {
      const dbEl = elementMap.get(ism.code);
      const evData = dbEl ? evidenceByElement[dbEl.id] : undefined;
      const score = evData ? Math.round((evData.approved / evData.total) * 100) : 0;
      const status = score >= 80 ? 'compliant' : score >= 50 ? 'partial' : 'gap';
      return { ...ism, score, evidenceCount: evData?.total || 0, status };
    });

    const avgScore = elements.reduce((s, e) => s + e.score, 0) / elements.length;
    const gaps = elements.filter(e => e.status === 'gap').length;
    const compliant = elements.filter(e => e.status === 'compliant').length;

    return { elements, avgScore: Math.round(avgScore), gaps, compliant, totalEvidence: evidence.length };
  }, [ismElements, evidence, requirements]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case 'partial': return <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
      default: return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">ISM Code Gap Analyzer</CardTitle>
          </div>
          <Badge variant={analysis.avgScore >= 80 ? 'default' : 'destructive'} className="text-xs">
            {analysis.avgScore}% Conformidade
          </Badge>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="text-success">✓ {analysis.compliant} conforme</span>
          <span className="text-destructive">✗ {analysis.gaps} gaps</span>
          <span>{analysis.totalEvidence} evidências</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {analysis.elements.map((el) => (
            <div key={el.code} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
              {getStatusIcon(el.status)}
              <span className="text-xs font-mono text-muted-foreground w-5">{el.code}</span>
              <span className="text-xs flex-1 truncate">{el.name}</span>
              <div className="w-16">
                <Progress value={el.score} className="h-1.5" />
              </div>
              <span className="text-[10px] font-medium w-8 text-right">{el.score}%</span>
              {el.evidenceCount > 0 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                  {el.evidenceCount}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
