import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, FileText, BarChart3, History } from 'lucide-react';

interface TokenValidation {
  is_valid: boolean;
  vessel_id: string | null;
  organization_id: string | null;
  permissions: {
    view_audits?: boolean;
    view_documents?: boolean;
    view_incidents?: boolean;
    view_metrics?: boolean;
  };
}

interface AuditData {
  id: string;
  norm: string;
  score: number;
  status: string;
  created_at: string;
}

export default function CertViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [tokenValidation, setTokenValidation] = useState<TokenValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditData[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Token não fornecido');
      setLoading(false);
      return;
    }

    try {
      const { data, error: validateError } = await supabase.rpc('validate_cert_token', {
        p_token: token
      });

      if (validateError) throw validateError;

      if (data && data.length > 0 && data[0].is_valid) {
        setTokenValidation(data[0]);
        await loadData(data[0]);
      } else {
        setError('Token inválido ou expirado');
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Erro ao validar token de acesso');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (validation: TokenValidation) => {
    try {
      // Load audits if permitted
      if (validation.permissions.view_audits) {
        const { data: auditData } = await supabase
          .from('auditorias_simuladas')
          .select('*')
          .eq('vessel_id', validation.vessel_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (auditData) setAudits(auditData);
      }

      // Load documents if permitted
      if (validation.permissions.view_documents) {
        const { data: docData } = await supabase
          .from('documents')
          .select('*')
          .eq('organization_id', validation.organization_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (docData) setDocuments(docData);
      }

      // Load metrics if permitted
      if (validation.permissions.view_metrics) {
        const { data: metricsData } = await supabase
          .from('metricas_risco')
          .select('*')
          .eq('vessel_id', validation.vessel_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (metricsData) setMetrics(metricsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (error || !tokenValidation?.is_valid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Acesso Negado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Token inválido ou expirado. Entre em contato com o administrador para obter acesso.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Portal de Certificação Externa</CardTitle>
            </div>
            <CardDescription>
              Visualização de dados de conformidade e evidências (Modo Somente Leitura)
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="audits" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audits" disabled={!tokenValidation.permissions.view_audits}>
              <FileText className="h-4 w-4 mr-2" />
              Auditorias
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!tokenValidation.permissions.view_documents}>
              <FileText className="h-4 w-4 mr-2" />
              Evidências
            </TabsTrigger>
            <TabsTrigger value="metrics" disabled={!tokenValidation.permissions.view_metrics}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Indicadores
            </TabsTrigger>
          </TabsList>

          {/* Audits Tab */}
          <TabsContent value="audits">
            <Card>
              <CardHeader>
                <CardTitle>Auditorias Simuladas</CardTitle>
                <CardDescription>Status de conformidade por norma</CardDescription>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma auditoria disponível</p>
                ) : (
                  <div className="space-y-4">
                    {audits.map((audit) => (
                      <div key={audit.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{audit.norm || 'Auditoria'}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(audit.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={audit.score >= 80 ? 'default' : 'destructive'}>
                              Score: {audit.score}%
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{audit.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Evidências Anexadas</CardTitle>
                <CardDescription>PDFs, relatórios e documentação de conformidade</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum documento disponível</p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <h3 className="font-medium">{doc.title || 'Documento'}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{doc.type || 'PDF'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Normativos</CardTitle>
                <CardDescription>Métricas de conformidade e risco</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Score Geral</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.overall_score || 'N/A'}%
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Nível de Risco</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {metrics.risk_level || 'N/A'}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Conformidade</p>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.compliance_rate || 'N/A'}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma métrica disponível</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <History className="h-4 w-4" />
              <p>
                Este é um acesso somente leitura para fins de certificação e auditoria externa.
                Para mais informações, entre em contato com o administrador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
