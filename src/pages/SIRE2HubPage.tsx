/**
 * SIRE 2.0 Vetting Hub - Sprint 10
 * OCIMF SIRE 2.0 inspection management with 13-chapter framework
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { SmartKPIGrid } from '@/components/ui/premium-module-kit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, ClipboardCheck, AlertTriangle, Calendar, Eye, Plus, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const SIRE2_CHAPTERS = [
  { num: 1, name: 'General Information' },
  { num: 2, name: 'Certification & Documentation' },
  { num: 3, name: 'Crew Management' },
  { num: 4, name: 'Navigation' },
  { num: 5, name: 'Safety Management' },
  { num: 6, name: 'Pollution Prevention' },
  { num: 7, name: 'Structural Condition' },
  { num: 8, name: 'Cargo & Ballast Operations' },
  { num: 9, name: 'Mooring' },
  { num: 10, name: 'Engine & Steering' },
  { num: 11, name: 'General Appearance & Condition' },
  { num: 12, name: 'Ice Operations' },
  { num: 13, name: 'Human Factors' },
];

const riskColors: Record<string, string> = {
  low: 'bg-success text-success-foreground',
  standard: 'bg-muted text-muted-foreground',
  elevated: 'bg-warning text-warning-foreground',
  high: 'bg-destructive/80 text-destructive-foreground',
  unacceptable: 'bg-destructive text-destructive-foreground',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-info/20 text-info border-info/30',
  in_progress: 'bg-warning/20 text-warning border-warning/30',
  completed: 'bg-success/20 text-success border-success/30',
  report_issued: 'bg-primary/20 text-primary border-primary/30',
  closed: 'bg-muted text-muted-foreground',
};

export default function SIRE2HubPage() {
  const [activeTab, setActiveTab] = useState('inspections');

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['sire2-inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sire2_inspections')
        .select('*')
        .order('inspection_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['sire2-findings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sire2_findings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const totalInspections = inspections.length;
  const avgScore = totalInspections > 0 ? inspections.reduce((s, i) => s + (i.overall_score || 0), 0) / totalInspections : 0;
  const openFindings = findings.filter(f => f.status === 'open' || f.status === 'in_progress').length;
  const criticalFindings = findings.filter(f => f.severity === 'critical').length;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">SIRE 2.0 Vetting Hub</h1>
        <p className="text-muted-foreground">OCIMF Ship Inspection Report Programme — 13-chapter focused inspection framework</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartKPIGrid kpis={[
          { id: 'total-insp', title: 'Total Inspections', value: totalInspections.toString(), icon: ClipboardCheck, trend: 0 },
          { id: 'avg-score', title: 'Avg Score', value: avgScore > 0 ? `${avgScore.toFixed(1)}%` : 'N/A', icon: TrendingUp, trend: avgScore >= 85 ? 5 : -5 },
          { id: 'open-findings', title: 'Open Findings', value: openFindings.toString(), icon: Eye, trend: -openFindings },
          { id: 'critical-findings', title: 'Critical Findings', value: criticalFindings.toString(), icon: AlertTriangle, trend: -criticalFindings },
        ]} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="chapters">13 Chapters</TabsTrigger>
            <TabsTrigger value="findings">Findings & CAPA</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections" className="space-y-4">
            <div className="flex gap-3">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Inspection</Button>
              <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Export Report</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading inspections...</div>
            ) : inspections.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No SIRE 2.0 inspections recorded</p>
                <p className="text-sm">Schedule your first vetting inspection to begin tracking</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {inspections.map(insp => (
                  <Card key={insp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{insp.inspection_number || 'Inspection'}</span>
                            <Badge className={statusColors[insp.status || 'scheduled']}>{insp.status}</Badge>
                            <Badge className={riskColors[insp.risk_rating || 'standard']}>{insp.risk_rating}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {insp.inspection_type} • {insp.port}, {insp.country} • {new Date(insp.inspection_date).toLocaleDateString()}
                          </div>
                          {insp.oil_major && <div className="text-sm">Oil Major: <span className="font-medium">{insp.oil_major}</span></div>}
                          {insp.inspector_name && <div className="text-sm text-muted-foreground">Inspector: {insp.inspector_name} ({insp.inspector_company})</div>}
                        </div>
                        <div className="text-right">
                          {insp.overall_score != null && (
                            <div className="text-2xl font-bold">{insp.overall_score}%</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {insp.total_observations || 0} obs • {insp.total_non_conformities || 0} NC
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chapters" className="space-y-4">
            <p className="text-sm text-muted-foreground">SIRE 2.0 uses a focused inspection framework across 13 chapters. Each chapter covers specific operational areas.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {SIRE2_CHAPTERS.map(ch => {
                const chFindings = findings.filter(f => f.chapter_number === ch.num);
                const openCh = chFindings.filter(f => f.status === 'open' || f.status === 'in_progress').length;
                const totalCh = chFindings.length;
                const score = totalCh > 0 ? ((totalCh - openCh) / totalCh * 100) : 100;

                return (
                  <Card key={ch.num} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">{ch.num}</Badge>
                          <span className="font-medium text-sm">{ch.name}</span>
                        </div>
                        <span className="text-sm font-medium">{score.toFixed(0)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{totalCh} findings</span>
                        <span>{openCh} open</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="findings" className="space-y-4">
            {findings.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No findings recorded</p>
                <p className="text-sm">Findings will appear here after inspections are completed</p>
              </CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Chapter</th>
                      <th className="text-left p-3 font-medium">Ref</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Severity</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {findings.slice(0, 50).map(f => (
                      <tr key={f.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono">{f.chapter_number}</td>
                        <td className="p-3">{f.question_ref || '-'}</td>
                        <td className="p-3"><Badge variant="outline">{f.finding_type}</Badge></td>
                        <td className="p-3">
                          <Badge className={f.severity === 'critical' ? 'bg-destructive text-destructive-foreground' : f.severity === 'major' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}>
                            {f.severity}
                          </Badge>
                        </td>
                        <td className="p-3 max-w-[300px] truncate">{f.description || '-'}</td>
                        <td className="p-3"><Badge variant="outline">{f.status}</Badge></td>
                        <td className="p-3">{f.target_date ? new Date(f.target_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
