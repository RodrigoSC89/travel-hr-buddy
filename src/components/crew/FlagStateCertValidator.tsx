/**
 * Flag State Certificate Validator
 * Validação inteligente de certificados contra regras de Flag State
 * Fecha o gap #2: Crew Flag State validation
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock, FileText, Download, RefreshCw, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { validateCertificateAgainstFlagState, getFlagStateRules, type CertValidationResult } from '@/lib/maritime/market-intelligence';

interface CertRow {
  id: string;
  crew_member_id: string;
  certification_name: string;
  certification_type: string;
  expiry_date: string | null;
  status: string;
  issuing_authority: string | null;
}

export function FlagStateCertValidator() {
  const [selectedFlag, setSelectedFlag] = useState<string>('all');

  const { data: vessels = [] } = useQuery({
    queryKey: ['vessels-flags'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name, flag_state, flag').eq('status', 'active');
      return data || [];
    },
  });

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['crew-certs-validation'],
    queryFn: async () => {
      const { data } = await supabase
        .from('crew_certifications')
        .select('id, crew_member_id, certification_name, certification_type, expiry_date, status, issuing_authority')
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })
        .limit(500);
      return (data || []) as CertRow[];
    },
  });

  const flagRules = useMemo(() => getFlagStateRules(), []);
  const uniqueFlags = useMemo(() => [...new Set(vessels.map(v => (v.flag_state || v.flag || 'Unknown') as string))], [vessels]);

  const validationResults = useMemo(() => {
    return certs.map(cert => {
      const flag = selectedFlag !== 'all' ? selectedFlag : (uniqueFlags[0] || 'Panama');
      const result = validateCertificateAgainstFlagState(
        cert.certification_type || cert.certification_name,
        cert.expiry_date || new Date().toISOString(),
        flag,
        cert.issuing_authority ? true : false,
      );
      return { cert, result, flag };
    });
  }, [certs, selectedFlag, uniqueFlags]);

  const stats = useMemo(() => {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.result.isValid).length;
    const critical = validationResults.filter(r => r.result.issues.some(i => i.severity === 'critical')).length;
    const warnings = validationResults.filter(r => r.result.issues.some(i => i.severity === 'warning') && !r.result.issues.some(i => i.severity === 'critical')).length;
    const missingEndorsement = validationResults.filter(r => r.result.endorsementStatus === 'missing').length;
    return { total, valid, critical, warnings, missingEndorsement, complianceRate: total > 0 ? Math.round((valid / total) * 100) : 100 };
  }, [validationResults]);

  const exportCSV = () => {
    const csv = ['Certificate,Type,Expiry,Flag,Valid,Days to Expiry,Endorsement,Issues',
      ...validationResults.map(r => 
        `"${r.cert.certification_name}","${r.cert.certification_type}","${r.cert.expiry_date}","${r.flag}",${r.result.isValid},${r.result.daysToExpiry},${r.result.endorsementStatus},"${r.result.issues.map(i => i.message).join('; ')}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `flag-state-validation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Relatório exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" /> Flag State Certificate Validator
          </h3>
          <p className="text-sm text-muted-foreground">Validação automática contra regras de {flagRules.length} Flag States — Endorsement tracking</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedFlag}
            onChange={(e) => setSelectedFlag(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
          >
            <option value="all">Todos os Flags</option>
            {uniqueFlags.map(f => <option key={f} value={f}>{f}</option>)}
            {flagRules.map(r => !uniqueFlags.includes(r.flag) && <option key={r.flag} value={r.flag}>{r.flag}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{stats.complianceRate}%</p>
          <p className="text-xs text-muted-foreground">Compliance Rate</p>
        </CardContent></Card>
        <Card className="border-success/30"><CardContent className="p-4 text-center">
          <CheckCircle2 className="h-6 w-6 mx-auto text-success mb-1" />
          <p className="text-2xl font-bold text-success">{stats.valid}</p>
          <p className="text-xs text-muted-foreground">Valid</p>
        </CardContent></Card>
        <Card className="border-destructive/30"><CardContent className="p-4 text-center">
          <XCircle className="h-6 w-6 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </CardContent></Card>
        <Card className="border-warning/30"><CardContent className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 mx-auto text-warning mb-1" />
          <p className="text-2xl font-bold text-warning">{stats.warnings}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold">{stats.missingEndorsement}</p>
          <p className="text-xs text-muted-foreground">Missing Endorsement</p>
        </CardContent></Card>
      </div>

      {/* Validation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Certificate Validation Results</CardTitle>
          <CardDescription>{validationResults.length} certificados validados contra regras do Flag State</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando certificados...</div>
          ) : validationResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum certificado encontrado</p>
              <p className="text-sm mt-1">Cadastre certificações na aba de tripulação</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background"><tr className="border-b bg-muted/30">
                  <th className="text-center py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Certificate</th>
                  <th className="text-left py-3 px-3">Type</th>
                  <th className="text-center py-3 px-3">Expiry</th>
                  <th className="text-center py-3 px-3">Days Left</th>
                  <th className="text-center py-3 px-3">Endorsement</th>
                  <th className="text-center py-3 px-3">Renewal Deadline</th>
                  <th className="text-left py-3 px-3">Issues</th>
                </tr></thead>
                <tbody>
                  {validationResults.slice(0, 100).map(({ cert, result }) => (
                    <tr key={cert.id} className={`border-b hover:bg-muted/20 ${!result.isValid ? 'bg-destructive/5' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        {result.isValid ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}
                      </td>
                      <td className="py-3 px-3 font-medium">{cert.certification_name}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{cert.certification_type}</td>
                      <td className="py-3 px-3 text-center text-xs">{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={result.daysToExpiry <= 0 ? 'destructive' : result.daysToExpiry <= 90 ? 'secondary' : 'outline'} className="text-xs">
                          {result.daysToExpiry <= 0 ? `${Math.abs(result.daysToExpiry)}d expired` : `${result.daysToExpiry}d`}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={result.endorsementStatus === 'valid' ? 'default' : result.endorsementStatus === 'missing' ? 'destructive' : 'outline'} className="text-[10px]">
                          {result.endorsementStatus === 'valid' ? '✅' : result.endorsementStatus === 'missing' ? '❌' : '?'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-muted-foreground">{result.renewalDeadline || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          {result.issues.filter(i => i.severity !== 'info').slice(0, 2).map((issue, idx) => (
                            <p key={idx} className={`text-xs ${issue.severity === 'critical' ? 'text-destructive' : 'text-warning'}`}>
                              {issue.severity === 'critical' ? '🔴' : '🟡'} {issue.message}
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag State Rules Reference */}
      <Card>
        <CardHeader><CardTitle className="text-base">Flag State Rules Reference</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4">Flag</th><th className="text-left py-3 px-4">Cert Type</th>
                <th className="text-center py-3 px-4">Validity</th><th className="text-center py-3 px-4">Renewal Window</th>
                <th className="text-center py-3 px-4">Endorsement</th><th className="text-left py-3 px-4">Requirements</th>
              </tr></thead>
              <tbody>
                {flagRules.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-muted/20">
                    <td className="py-3 px-4 font-medium">{r.flag}</td>
                    <td className="py-3 px-4">{r.certificateType}</td>
                    <td className="py-3 px-4 text-center">{r.maxValidityYears}yr</td>
                    <td className="py-3 px-4 text-center">{r.renewalWindowDays}d</td>
                    <td className="py-3 px-4 text-center">{r.endorsementRequired ? '✅ Required' : '—'}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{r.additionalRequirements.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FlagStateCertValidator;
