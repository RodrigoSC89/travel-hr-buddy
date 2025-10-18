import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TokenData {
  is_valid: boolean;
  vessel_id: string;
  organization_id: string;
  permissions: {
    view_audits: boolean;
    view_documents: boolean;
    view_metrics: boolean;
  };
  vessel_name: string;
  organization_name: string;
}

export default function CertViewer() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateAndLoadData();
    }
  }, [token]);

  const validateAndLoadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate token
      const { data, error: validationError } = await supabase
        .rpc('validate_cert_token', { p_token: token });

      if (validationError) throw validationError;

      if (!data || data.length === 0 || !data[0].is_valid) {
        setError('Token inválido, expirado ou revogado.');
        setLoading(false);
        return;
      }

      const tokenInfo = data[0];
      setTokenData(tokenInfo);

      // Load data based on permissions
      if (tokenInfo.permissions.view_audits) {
        await loadAudits(tokenInfo.vessel_id);
      }

      if (tokenInfo.permissions.view_metrics) {
        await loadMetrics(tokenInfo.vessel_id);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error validating token:', err);
      setError('Erro ao validar token de acesso.');
      setLoading(false);
    }
  };

  const loadAudits = async (vesselId: string) => {
    try {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAudits(data || []);
    } catch (err) {
      console.error('Error loading audits:', err);
    }
  };

  const loadMetrics = async (vesselId: string) => {
    try {
      // Load SGSO metrics
      const { data, error } = await supabase
        .from('sgso_incidents')
        .select('severity, count')
        .eq('vessel_id', vesselId);

      if (error) throw error;

      // Aggregate metrics
      const severityCounts = data?.reduce((acc: any, item: any) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {});

      setMetrics(severityCounts);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Não foi possível validar o token de acesso.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Visualização de Certificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Organização</p>
                <p className="font-semibold">{tokenData.organization_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Embarcação</p>
                <p className="font-semibold">{tokenData.vessel_name}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Permissões de Visualização:</p>
              <div className="flex gap-2 flex-wrap">
                {tokenData.permissions.view_audits && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Auditorias
                  </span>
                )}
                {tokenData.permissions.view_documents && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Documentos
                  </span>
                )}
                {tokenData.permissions.view_metrics && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Métricas
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audits Section */}
        {tokenData.permissions.view_audits && (
          <Card>
            <CardHeader>
              <CardTitle>Auditorias Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma auditoria encontrada.
                </p>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <div
                      key={audit.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{audit.title || 'Auditoria'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {audit.standard} - {audit.status}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(audit.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metrics Section */}
        {tokenData.permissions.view_metrics && metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics).map(([severity, count]: [string, any]) => (
                  <div key={severity} className="border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{severity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Read-only Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta é uma visualização somente leitura. As informações exibidas são específicas
            para o token de acesso fornecido e não podem ser modificadas.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
