/**
 * Certificate Blockchain - Immutable Certificate Registry
 * Issue, verify, and track maritime certificates with blockchain technology
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  Shield,
  FileCheck,
  QrCode,
  Link2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building,
  Hash,
  Calendar,
  Loader2,
  Download,
  Search,
  Plus,
  ShieldCheck,
  Lock
} from "lucide-react";

interface CertificateData {
  type: string;
  holderName: string;
  holderDocument: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  endorsements?: string[];
  limitations?: string[];
}

interface VerificationResult {
  valid: boolean;
  integrityCheck: boolean;
  expired: boolean;
  certificate: {
    blockId: string;
    type: string;
    holderName: string;
    certificateNumber: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
  };
  blockchain: {
    hash: string;
    previousHash: string;
    timestamp: string;
    signature: string;
  };
  message: string;
}

const certificateTypes = [
  "STCW - Padrão de Treinamento",
  "MLC 2006 - Trabalho Marítimo",
  "Certificado de Competência",
  "Certificado de Proficiência",
  "Certificado Médico Marítimo",
  "GMDSS - Operador Rádio",
  "Certificado de Segurança",
  "Certificado de Tripulante",
];

const issuingAuthorities = [
  "Marinha do Brasil",
  "IBAMA",
  "ANTAQ",
  "IMO",
  "Autoridade Marítima Nacional",
  "Capitania dos Portos",
];

export default function CertificateBlockchain() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("issue");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Issue form state
  const [formData, setFormData] = useState<CertificateData>({
    type: "",
    holderName: "",
    holderDocument: "",
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    endorsements: [],
    limitations: [],
  });
  const [issuedCertificate, setIssuedCertificate] = useState<{
    blockId: string;
    hash: string;
    qrCodeUrl: string;
    verificationUrl: string;
  } | null>(null);

  // Verify state
  const [verifyInput, setVerifyInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // History state
  const [holderSearch, setHolderSearch] = useState("");
  const [certificateHistory, setCertificateHistory] = useState<Array<{
    blockId: string;
    type: string;
    certificateNumber: string;
    issueDate: string;
    expiryDate: string;
    valid: boolean;
    hash: string;
  }>>([]);

  const handleIssueCertificate = async () => {
    if (!formData.holderName || !formData.certificateNumber || !formData.type) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("certificate-blockchain", {
        body: {
          operation: "issue",
          certificate: formData
        }
      });

      if (error) throw error;

      setIssuedCertificate({
        blockId: data.certificate.id,
        hash: data.certificate.hash,
        qrCodeUrl: data.qrCode.url,
        verificationUrl: data.verificationUrl,
      });

      toast({
        title: "Certificado emitido",
        description: `Block ID: ${data.certificate.id}`,
      });

      // Reset form
      setFormData({
        type: "",
        holderName: "",
        holderDocument: "",
        certificateNumber: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
      });
    } catch (error) {
      logger.error("Issue error:", error);
      toast({
        title: "Erro ao emitir",
        description: error instanceof Error ? error.message : "Falha na emissão",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!verifyInput) {
      toast({
        title: "ID necessário",
        description: "Informe o Block ID ou Hash do certificado",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("certificate-blockchain", {
        body: {
          operation: "verify",
          blockId: verifyInput.startsWith("CERT-") ? verifyInput : undefined,
          hash: !verifyInput.startsWith("CERT-") ? verifyInput : undefined,
        }
      });

      if (error) throw error;

      setVerificationResult(data);

      toast({
        title: data.valid ? "Certificado válido ✓" : "Certificado inválido",
        description: data.message,
        variant: data.valid ? "default" : "destructive"
      });
    } catch (error) {
      logger.error("Verify error:", error);
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Falha na verificação",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchHistory = async () => {
    if (!holderSearch) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("certificate-blockchain", {
        body: {
          operation: "history",
          holderDocument: holderSearch
        }
      });

      if (error) throw error;

      setCertificateHistory(data.certificates || []);

      toast({
        title: "Busca concluída",
        description: `${data.count} certificados encontrados`,
      });
    } catch (error) {
      logger.error("History error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Link2 className="h-8 w-8 text-primary" />
            Certificate Blockchain
          </h1>
          <p className="text-muted-foreground">
            Registro imutável de certificados marítimos com verificação por QR Code
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Lock className="h-3 w-3 mr-1" />
          SHA-256 + HMAC
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Integridade</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <FileCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Imutável</p>
              <p className="text-sm text-muted-foreground">Blockchain</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <QrCode className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">QR Code</p>
              <p className="text-sm text-muted-foreground">Verificação</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Hash className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Hash</p>
              <p className="text-sm text-muted-foreground">Criptográfico</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="issue">
                <Plus className="h-4 w-4 mr-2" />
                Emitir
              </TabsTrigger>
              <TabsTrigger value="verify">
                <Shield className="h-4 w-4 mr-2" />
                Verificar
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="issue" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Certificado *</Label>
                    <Select 
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Autoridade Emissora *</Label>
                    <Select 
                      value={formData.issuingAuthority}
                      onValueChange={(v) => setFormData({ ...formData, issuingAuthority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {issuingAuthorities.map((auth) => (
                          <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome do Titular *</Label>
                  <Input 
                    placeholder="Nome completo"
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Documento (CPF/Passaporte)</Label>
                    <Input 
                      placeholder="000.000.000-00"
                      value={formData.holderDocument}
                      onChange={(e) => setFormData({ ...formData, holderDocument: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Número do Certificado *</Label>
                    <Input 
                      placeholder="CERT-2025-0001"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Emissão *</Label>
                    <Input 
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Validade *</Label>
                    <Input 
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleIssueCertificate}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Emitir Certificado na Blockchain
                    </>
                  )}
                </Button>
              </div>

              {/* Result */}
              <div>
                {issuedCertificate ? (
                  <div className="space-y-4 p-6 border rounded-lg bg-green-500/5 border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <h3 className="text-lg font-bold">Certificado Emitido!</h3>
                    </div>

                    <div className="flex justify-center">
                      <img 
                        src={issuedCertificate.qrCodeUrl} 
                        alt="QR Code" 
                        className="w-48 h-48 border rounded-lg bg-card p-2"
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Block ID:</span>
                        <code className="font-mono">{issuedCertificate.blockId}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hash:</span>
                        <code className="font-mono text-xs">{issuedCertificate.hash.substring(0, 24)}...</code>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={issuedCertificate.qrCodeUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar QR
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(issuedCertificate.blockId);
                          toast({ title: "Copiado!" });
                        }}
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        Copiar ID
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                    <QrCode className="h-16 w-16 mb-4 opacity-50" />
                    <p>Preencha o formulário para emitir</p>
                    <p className="text-sm">Um QR Code será gerado automaticamente</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-0">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite o Block ID (CERT-...) ou Hash do certificado"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleVerifyCertificate} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>

              {verificationResult && (
                <Card className={`${
                  verificationResult.valid 
                    ? "border-green-500 bg-green-500/5" 
                    : "border-red-500 bg-red-500/5"
                }`}>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      {verificationResult.valid ? (
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      ) : (
                        <XCircle className="h-12 w-12 text-red-500" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          {verificationResult.valid ? "Certificado VÁLIDO" : "Certificado INVÁLIDO"}
                        </h3>
                        <p className="text-muted-foreground">{verificationResult.message}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          Dados do Certificado
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span>{verificationResult.certificate.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Titular:</span>
                            <span>{verificationResult.certificate.holderName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Número:</span>
                            <code>{verificationResult.certificate.certificateNumber}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Emissão:</span>
                            <span>{new Date(verificationResult.certificate.issueDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Validade:</span>
                            <span className="flex items-center gap-1">
                              {new Date(verificationResult.certificate.expiryDate).toLocaleDateString("pt-BR")}
                              {verificationResult.expired && (
                                <Badge variant="destructive" className="ml-2">Expirado</Badge>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Autoridade:</span>
                            <span>{verificationResult.certificate.issuingAuthority}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          Dados Blockchain
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Block ID:</span>
                            <code className="text-xs">{verificationResult.certificate.blockId}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hash:</span>
                            <code className="text-xs">{verificationResult.blockchain.hash}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prev Hash:</span>
                            <code className="text-xs">{verificationResult.blockchain.previousHash}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timestamp:</span>
                            <span className="text-xs">{new Date(verificationResult.blockchain.timestamp).toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Integridade:</span>
                            {verificationResult.integrityCheck ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verificada
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Comprometida
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="space-y-6">
              <div className="flex gap-2 max-w-md">
                <Input 
                  placeholder="CPF ou Passaporte do titular"
                  value={holderSearch}
                  onChange={(e) => setHolderSearch(e.target.value)}
                />
                <Button onClick={handleSearchHistory} disabled={isProcessing}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {certificateHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Block ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateHistory.map((cert) => (
                      <TableRow 
                        key={cert.blockId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setVerifyInput(cert.blockId);
                          setActiveTab("verify");
                        }}
                      >
                        <TableCell className="font-mono text-xs">{cert.blockId}</TableCell>
                        <TableCell>{cert.type}</TableCell>
                        <TableCell>{cert.certificateNumber}</TableCell>
                        <TableCell>{new Date(cert.issueDate).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{new Date(cert.expiryDate).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          {cert.valid ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">Válido</Badge>
                          ) : (
                            <Badge variant="destructive">Expirado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{cert.hash}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mb-4 opacity-50" />
                  <p>Busque certificados por documento do titular</p>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}
