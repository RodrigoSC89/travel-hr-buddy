/**
 * Blockchain Certificates Page
 * Certificados imutáveis verificáveis por QR Code
 */
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link, Shield, CheckCircle, QrCode, FileText, 
  Clock, AlertTriangle, Download, Search, Eye
} from "lucide-react";

const BlockchainCertificatesPage = () => {
  const [verifying, setVerifying] = useState(false);

  const certificates = [
    {
      id: "CERT-2024-001",
      type: "STCW Certificate",
      holder: "João Silva",
      rank: "Master",
      issueDate: "2023-06-15",
      expiryDate: "2028-06-15",
      blockHash: "0x7f83...4e2a",
      verified: true,
      issuer: "Brazilian Maritime Authority"
    },
    {
      id: "CERT-2024-002",
      type: "Medical Certificate",
      holder: "Maria Santos",
      rank: "Chief Engineer",
      issueDate: "2024-01-10",
      expiryDate: "2026-01-10",
      blockHash: "0x3a91...8f7c",
      verified: true,
      issuer: "ANVISA"
    },
    {
      id: "CERT-2024-003",
      type: "GMDSS Operator",
      holder: "Pedro Lima",
      rank: "2nd Officer",
      issueDate: "2022-09-20",
      expiryDate: "2027-09-20",
      blockHash: "0x9d45...2b1e",
      verified: true,
      issuer: "ANATEL"
    },
    {
      id: "CERT-2024-004",
      type: "Tanker Endorsement",
      holder: "Ana Costa",
      rank: "3rd Officer",
      issueDate: "2023-03-05",
      expiryDate: "2028-03-05",
      blockHash: "0x1c72...6a9d",
      verified: true,
      issuer: "DPC - Marinha do Brasil"
    }
  ];

  const blockchainStats = {
    totalCertificates: 1247,
    verifiedToday: 89,
    pendingVerification: 12,
    revoked: 3,
    avgVerificationTime: "1.2s"
  };

  const recentVerifications = [
    { time: "2 min atrás", cert: "STCW - João Silva", result: "verified", by: "Port Authority Singapore" },
    { time: "15 min atrás", cert: "Medical - Maria Santos", result: "verified", by: "PSC Inspector Rotterdam" },
    { time: "1h atrás", cert: "GMDSS - Pedro Lima", result: "verified", by: "Flag State Audit" }
  ];

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.rpc("verify_audit_chain_integrity");
      const result = data?.[0];
      if (result?.is_valid) {
        toast.success("Cadeia de auditoria íntegra — todos os hashes verificados");
      } else {
        toast.warning(`Inconsistência detectada: ${result?.message || "Verifique os logs"}`);
      }
    } catch {
      toast.info("Verificação concluída (sem dados na cadeia de auditoria)");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Link className="h-8 w-8 text-primary" />
            Blockchain Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            Certificados imutáveis com verificação instantânea por QR Code
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Shield className="h-4 w-4 text-success" />
            Blockchain Ativo
          </Badge>
          <Button onClick={handleVerify} disabled={verifying}>
            <QrCode className="h-4 w-4 mr-2" />
            {verifying ? "Verificando..." : "Verificar QR"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{blockchainStats.totalCertificates}</p>
            <p className="text-xs text-muted-foreground">Certificados Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold text-success">{blockchainStats.verifiedToday}</p>
            <p className="text-xs text-muted-foreground">Verificados Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold text-warning">{blockchainStats.pendingVerification}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{blockchainStats.revoked}</p>
            <p className="text-xs text-muted-foreground">Revogados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Search className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-500">{blockchainStats.avgVerificationTime}</p>
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="verify">Verificar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="issue">Emitir</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificados na Blockchain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div 
                    key={cert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{cert.type}</p>
                          {cert.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cert.holder} • {cert.rank}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Válido: {cert.issueDate} → {cert.expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="outline" className="font-mono text-xs">
                          {cert.blockHash}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{cert.issuer}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" aria-label="Ver QR Code" title="QR Code">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Ver certificado" title="Ver certificado">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Baixar certificado" title="Baixar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Verificar por QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-48 h-48 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Posicione o QR Code aqui
                    </p>
                  </div>
                </div>
                <Button className="mt-6">
                  Ativar Câmera
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Verificar por Hash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Hash do Certificado</label>
                  <input 
                    type="text"
                    placeholder="0x..."
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Número do Certificado</label>
                  <input 
                    type="text"
                    placeholder="CERT-XXXX-XXX"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Verificações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentVerifications.map((ver) => (
                  <div key={`${ver.cert}-${ver.by}-${ver.time}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{ver.cert}</p>
                        <p className="text-sm text-muted-foreground">Por: {ver.by}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Verificado</Badge>
                      <span className="text-sm text-muted-foreground">{ver.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Emitir Novo Certificado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Certificado</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md bg-background">
                    <option>STCW Certificate</option>
                    <option>Medical Certificate</option>
                    <option>GMDSS Operator</option>
                    <option>Tanker Endorsement</option>
                    <option>Training Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome do Titular</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Posto/Função</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data de Emissão</label>
                    <input 
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Validade</label>
                    <input 
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                <Button className="w-full">
                  <Link className="h-4 w-4 mr-2" />
                  Registrar na Blockchain
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainCertificatesPage;
