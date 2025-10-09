import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  FileText,
  Check,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Hash,
  Lock,
  Key,
  Globe,
  Users,
  Calendar,
  Award,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockchainDocument {
  id: string;
  name: string;
  type: "certificate" | "contract" | "license" | "audit" | "permit";
  hash: string;
  timestamp: string;
  status: "verified" | "pending" | "invalid" | "expired";
  issuer: string;
  owner: string;
  expiryDate?: string;
  verifications: number;
  smartContractAddress: string;
  ipfsHash: string;
}

interface VerificationLog {
  id: string;
  documentId: string;
  verifier: string;
  timestamp: string;
  result: "success" | "failure";
  details: string;
}

export const BlockchainDocuments: React.FC = () => {
  const { toast } = useToast();
  const [searchHash, setSearchHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const [documents] = useState<BlockchainDocument[]>([
    {
      id: "1",
      name: "Certificado STCW Basic Safety",
      type: "certificate",
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      timestamp: "2024-01-15T10:30:00Z",
      status: "verified",
      issuer: "IMO - International Maritime Organization",
      owner: "João Silva",
      expiryDate: "2026-01-15",
      verifications: 12,
      smartContractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    },
    {
      id: "2",
      name: "Licença de Operação Portuária",
      type: "license",
      hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
      timestamp: "2024-01-10T14:20:00Z",
      status: "verified",
      issuer: "ANTAQ - Agência Nacional de Transportes Aquaviários",
      owner: "Empresa Marítima S.A.",
      expiryDate: "2025-12-31",
      verifications: 8,
      smartContractAddress: "0xbcdef1234567890abcdef1234567890abcdef123",
      ipfsHash: "QmZwBPKzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH",
    },
    {
      id: "3",
      name: "Contrato de Fretamento",
      type: "contract",
      hash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
      timestamp: "2024-01-12T09:15:00Z",
      status: "pending",
      issuer: "Smart Contract System",
      owner: "Nautilus Shipping Co.",
      verifications: 3,
      smartContractAddress: "0xcdef1234567890abcdef1234567890abcdef1234",
      ipfsHash: "QmXvAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI",
    },
  ]);

  const [verificationLogs] = useState<VerificationLog[]>([
    {
      id: "1",
      documentId: "1",
      verifier: "Sistema Portuário Santos",
      timestamp: "2024-01-16T08:30:00Z",
      result: "success",
      details: "Certificado válido e reconhecido",
    },
    {
      id: "2",
      documentId: "1",
      verifier: "Inspeção Marítima RJ",
      timestamp: "2024-01-14T15:45:00Z",
      result: "success",
      details: "Verificação completa aprovada",
    },
    {
      id: "3",
      documentId: "2",
      verifier: "Autoridade Portuária SP",
      timestamp: "2024-01-13T11:20:00Z",
      result: "success",
      details: "Licença válida para operações",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "verified":
      return "text-green-600 bg-green-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "invalid":
      return "text-red-600 bg-red-100";
    case "expired":
      return "text-muted-foreground bg-gray-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "certificate":
      return <Award className="h-5 w-5" />;
    case "contract":
      return <FileText className="h-5 w-5" />;
    case "license":
      return <Key className="h-5 w-5" />;
    case "audit":
      return <Eye className="h-5 w-5" />;
    case "permit":
      return <Shield className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
    }
  };

  const verifyDocument = async (hash: string) => {
    setIsVerifying(true);

    // Simular verificação na blockchain
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsVerifying(false);
    toast({
      title: "Verificação Concluída",
      description: "Documento verificado com sucesso na blockchain",
    });
  };

  const uploadDocument = () => {
    toast({
      title: "Upload Iniciado",
      description: "Documento sendo processado e adicionado à blockchain",
    });
  };

  const downloadDocument = (document: BlockchainDocument) => {
    toast({
      title: "Download Iniciado",
      description: `Baixando ${document.name} do IPFS`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Blockchain para Documentos
          </h1>
          <p className="text-muted-foreground">
            Sistema seguro e descentralizado para verificação de documentos
          </p>
        </div>
        <Button onClick={uploadDocument} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-sm text-muted-foreground">Documentos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === "verified").length}
                </div>
                <div className="text-sm text-muted-foreground">Verificados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Hash className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{verificationLogs.length}</div>
                <div className="text-sm text-muted-foreground">Verificações</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-orange-100">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verificação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Verificação Rápida
          </CardTitle>
          <CardDescription>
            Verifique a autenticidade de um documento usando seu hash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Digite o hash do documento (0x...)"
              value={searchHash}
              onChange={e => setSearchHash(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => verifyDocument(searchHash)}
              disabled={isVerifying || !searchHash}
              className="flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Verificar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="verifications">Verificações</TabsTrigger>
          <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(document => (
              <Card
                key={document.id}
                className={selectedDocument === document.id ? "ring-2 ring-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(document.type)}
                      <CardTitle className="text-lg">{document.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status === "verified"
                        ? "Verificado"
                        : document.status === "pending"
                          ? "Pendente"
                          : document.status === "invalid"
                            ? "Inválido"
                            : "Expirado"}
                    </Badge>
                  </div>
                  <CardDescription>Emitido por: {document.issuer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Proprietário:</span>
                      <p className="text-muted-foreground">{document.owner}</p>
                    </div>
                    <div>
                      <span className="font-medium">Verificações:</span>
                      <p className="text-muted-foreground">{document.verifications}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data de Criação:</span>
                      <p className="text-muted-foreground">
                        {new Date(document.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {document.expiryDate && (
                      <div>
                        <span className="font-medium">Expira em:</span>
                        <p className="text-muted-foreground">
                          {new Date(document.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Hash do Documento:
                      </span>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                        <Hash className="h-3 w-3" />
                        {document.hash}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">IPFS Hash:</span>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                        <Globe className="h-3 w-3" />
                        {document.ipfsHash}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyDocument(document.hash)}
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      Verificar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadDocument(document)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(document.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Verificações</CardTitle>
              <CardDescription>
                Registro completo de todas as verificações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationLogs.map(log => {
                  const document = documents.find(d => d.id === log.documentId);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            log.result === "success" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {log.result === "success" ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{document?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Verificado por: {log.verifier}
                          </div>
                          <div className="text-sm text-muted-foreground">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-contracts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Contrato de Documentos
                </CardTitle>
                <CardDescription>
                  Smart contract principal para gerenciamento de documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Endereço:</span>
                  <div className="p-2 bg-muted rounded text-xs font-mono">
                    0x1234567890abcdef1234567890abcdef12345678
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Rede:</span>
                  <p className="text-sm text-muted-foreground">Ethereum Mainnet</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Versão:</span>
                  <p className="text-sm text-muted-foreground">v2.1.0</p>
                </div>
                <Button variant="outline" className="w-full">
                  Ver no Etherscan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Contrato de Verificação
                </CardTitle>
                <CardDescription>Smart contract para verificações e autenticações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Endereço:</span>
                  <div className="p-2 bg-muted rounded text-xs font-mono">
                    0xabcdef1234567890abcdef1234567890abcdef12
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Gas Usado:</span>
                  <p className="text-sm text-muted-foreground">45,231 Gwei</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Transações:</span>
                  <p className="text-sm text-muted-foreground">1,247</p>
                </div>
                <Button variant="outline" className="w-full">
                  Ver Código Fonte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da Rede</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nós Ativos:</span>
                  <Badge variant="default">127</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Latência Média:</span>
                  <Badge variant="outline">42ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Último Bloco:</span>
                  <Badge variant="secondary">#18,247,392</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gas Price:</span>
                  <Badge variant="outline">15 Gwei</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IPFS Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peers Conectados:</span>
                  <Badge variant="default">89</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arquivos Armazenados:</span>
                  <Badge variant="outline">1,243</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tamanho Total:</span>
                  <Badge variant="secondary">2.3 GB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disponibilidade:</span>
                  <Badge variant="default">99.9%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Criptografia:</span>
                  <Badge variant="default">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hash Function:</span>
                  <Badge variant="outline">SHA-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Assinatura Digital:</span>
                  <Badge variant="secondary">ECDSA</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auditoria:</span>
                  <Badge variant="default">Aprovada</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
