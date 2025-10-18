import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, AlertTriangle, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CertViewerData {
  valid: boolean;
  vessel_id?: string;
  organization_id?: string;
  permissions?: {
    view_audits?: boolean;
    view_documents?: boolean;
    view_incidents?: boolean;
    view_metrics?: boolean;
  };
  expires_at?: string;
}

export const CertViewer = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<CertViewerData | null>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      validateTokenAndLoadData();
    }
  }, [token]);

  const validateTokenAndLoadData = async () => {
    try {
      setLoading(true);

      // Validate token via database function
      const { data, error } = await supabase.rpc("validate_cert_token", {
        token_id: token,
      });

      if (error) throw error;

      if (!data || !data.valid) {
        toast.error("Token inválido ou expirado");
        setTokenData({ valid: false });
        return;
      }

      setTokenData(data);

      // Load data based on permissions
      if (data.permissions?.view_audits) {
        await loadAudits(data.vessel_id, data.organization_id);
      }

      if (data.permissions?.view_documents) {
        await loadDocuments(data.vessel_id, data.organization_id);
      }

      if (data.permissions?.view_incidents) {
        await loadIncidents(data.vessel_id, data.organization_id);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      toast.error("Erro ao validar token");
      setTokenData({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const loadAudits = async (vesselId?: string, orgId?: string) => {
    try {
      let query = supabase
        .from("auditorias_imca")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      } else if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error("Error loading audits:", error);
    }
  };

  const loadDocuments = async (vesselId?: string, orgId?: string) => {
    try {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const loadIncidents = async (vesselId?: string, orgId?: string) => {
    try {
      let query = supabase
        .from("dp_incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      } else if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error("Error loading incidents:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Validando acesso...</p>
        </div>
      </div>
    );
  }

  if (!tokenData?.valid) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Token inválido, expirado ou não autorizado. Entre em contato com o administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Visualização de Certificadora
          </h1>
          <p className="text-muted-foreground mt-2">
            Acesso somente leitura - Válido até:{" "}
            {tokenData.expires_at
              ? new Date(tokenData.expires_at).toLocaleDateString("pt-BR")
              : "N/A"}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Acesso Autorizado
        </Badge>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {tokenData.permissions?.view_audits && (
            <TabsTrigger value="audits">
              <FileText className="mr-2 h-4 w-4" />
              Auditorias ({audits.length})
            </TabsTrigger>
          )}
          {tokenData.permissions?.view_documents && (
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Evidências ({documents.length})
            </TabsTrigger>
          )}
          {tokenData.permissions?.view_incidents && (
            <TabsTrigger value="incidents">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Incidentes ({incidents.length})
            </TabsTrigger>
          )}
          {tokenData.permissions?.view_metrics && (
            <TabsTrigger value="metrics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Indicadores
            </TabsTrigger>
          )}
        </TabsList>

        {/* Audits Tab */}
        {tokenData.permissions?.view_audits && (
          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auditorias Simuladas</CardTitle>
                <CardDescription>
                  Histórico de auditorias e status de conformidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audits.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma auditoria disponível
                    </p>
                  ) : (
                    audits.map((audit) => (
                      <Card key={audit.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {audit.norma || "Auditoria"}
                              </CardTitle>
                              <CardDescription>
                                {new Date(audit.created_at).toLocaleDateString("pt-BR")}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                audit.score >= 80
                                  ? "default"
                                  : audit.score >= 60
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              Score: {audit.score}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {audit.descricao || "Sem descrição"}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Documents Tab */}
        {tokenData.permissions?.view_documents && (
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evidências e Documentos</CardTitle>
                <CardDescription>
                  Documentos de conformidade e evidências anexadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum documento disponível
                    </p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{doc.title || doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline">{doc.category || "Documento"}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Incidents Tab */}
        {tokenData.permissions?.view_incidents && (
          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Incidentes</CardTitle>
                <CardDescription>
                  Registro de incidentes e ações corretivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum incidente registrado
                    </p>
                  ) : (
                    incidents.map((incident) => (
                      <Card key={incident.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{incident.title}</CardTitle>
                              <CardDescription>
                                {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                incident.severity === "high" || incident.severity === "critical"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {incident.severity || "Medium"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {incident.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Metrics Tab */}
        {tokenData.permissions?.view_metrics && (
          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Normativos</CardTitle>
                <CardDescription>
                  Métricas de conformidade e desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Score Médio</CardDescription>
                      <CardTitle className="text-3xl">
                        {audits.length > 0
                          ? Math.round(
                              audits.reduce((acc, a) => acc + (a.score || 0), 0) / audits.length
                            )
                          : 0}
                        %
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Auditorias</CardDescription>
                      <CardTitle className="text-3xl">{audits.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Incidentes</CardDescription>
                      <CardTitle className="text-3xl">{incidents.length}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CertViewer;
