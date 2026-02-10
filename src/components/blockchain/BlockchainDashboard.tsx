/**
 * Blockchain Compliance Dashboard
 * Immutable ledger visualization for maritime compliance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  FileCheck,
  Link2,
  Clock,
  Search,
  Download,
  ExternalLink,
  Hash,
  Database,
  Activity,
  Layers,
  FileText,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BlockchainTransaction {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: Date;
  type: 'certificate' | 'audit' | 'contract' | 'inspection' | 'training';
  documentId: string;
  documentName: string;
  issuer: string;
  status: 'confirmed' | 'pending' | 'failed';
  blockNumber: number;
  gasUsed?: number;
  network: 'polygon' | 'ethereum' | 'private';
}

interface ComplianceStats {
  totalTransactions: number;
  confirmedBlocks: number;
  pendingBlocks: number;
  storageUsed: string;
  lastSync: Date;
  networkHealth: number;
}

export const BlockchainDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    
    // Fallback blockchain data - no dedicated blockchain table yet
    const fallbackTransactions: BlockchainTransaction[] = [
      {
        id: '1',
        hash: '0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385',
        previousHash: '0x0000000000000000000000000000000000000000',
        timestamp: new Date(Date.now() - 3600000),
        type: 'certificate',
        documentId: 'CERT-2024-001',
        documentName: 'Certificado STCW - João Silva',
        issuer: 'Maritime Training Center',
        status: 'confirmed',
        blockNumber: 18547832,
        gasUsed: 21000,
        network: 'polygon'
      },
      {
        id: '2',
        hash: '0x3e8e9c1a5b4d6f7a8b9c0d1e2f3a4b5c6d7e8f90',
        previousHash: '0x7f9fade1c0d57a7af66ab4ead7c2eb7b11a91385',
        timestamp: new Date(Date.now() - 7200000),
        type: 'audit',
        documentId: 'AUD-2024-045',
        documentName: 'Auditoria ISM Code - MV Nautilus',
        issuer: 'Classification Society',
        status: 'confirmed',
        blockNumber: 18547830,
        gasUsed: 45000,
        network: 'polygon'
      },
      {
        id: '3',
        hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        previousHash: '0x3e8e9c1a5b4d6f7a8b9c0d1e2f3a4b5c6d7e8f90',
        timestamp: new Date(Date.now() - 14400000),
        type: 'contract',
        documentId: 'CON-2024-012',
        documentName: 'Charter Party Agreement',
        issuer: 'Maritime Legal Corp',
        status: 'confirmed',
        blockNumber: 18547825,
        gasUsed: 65000,
        network: 'ethereum'
      },
      {
        id: '4',
        hash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0',
        previousHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        timestamp: new Date(Date.now() - 28800000),
        type: 'inspection',
        documentId: 'INS-2024-089',
        documentName: 'PSC Inspection Report - Singapore',
        issuer: 'Singapore MPA',
        status: 'pending',
        blockNumber: 18547820,
        network: 'polygon'
      },
      {
        id: '5',
        hash: '0xabcdef1234567890abcdef1234567890abcdef12',
        previousHash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0',
        timestamp: new Date(Date.now() - 86400000),
        type: 'training',
        documentId: 'TRN-2024-156',
        documentName: 'Safety Drill Completion',
        issuer: 'Vessel Safety Officer',
        status: 'confirmed',
        blockNumber: 18547810,
        gasUsed: 18000,
        network: 'private'
      }
    ];

    const fallbackStats: ComplianceStats = {
      totalTransactions: 1247,
      confirmedBlocks: 1243,
      pendingBlocks: 4,
      storageUsed: '2.4 GB',
      lastSync: new Date(),
      networkHealth: 99.7
    };

    setTimeout(() => {
      setTransactions(fallbackTransactions);
      setStats(fallbackStats);
      setIsLoading(false);
    }, 1000);
  };

  const getTypeIcon = (type: BlockchainTransaction['type']) => {
    switch (type) {
      case 'certificate': return <FileCheck className="h-4 w-4" />;
      case 'audit': return <Shield className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'inspection': return <Search className="h-4 w-4" />;
      case 'training': return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: BlockchainTransaction['type']) => {
    switch (type) {
      case 'certificate': return 'bg-primary/20 text-primary';
      case 'audit': return 'bg-secondary/20 text-secondary';
      case 'contract': return 'bg-success/20 text-success';
      case 'inspection': return 'bg-warning/20 text-warning';
      case 'training': return 'bg-primary/20 text-primary';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Hash copiado para área de transferência');
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.documentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || tx.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            Blockchain Compliance Ledger
          </h2>
          <p className="text-muted-foreground">
            Registro imutável de documentos e certificações marítimas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBlockchainData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sincronizar
          </Button>
          <Badge variant="outline" className="gap-1 py-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Rede Ativa
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transações</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blocos Confirmados</p>
                  <p className="text-2xl font-bold text-green-500">{stats.confirmedBlocks.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pendingBlocks}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saúde da Rede</p>
                  <p className="text-2xl font-bold">{stats.networkHealth}%</p>
                </div>
                <Activity className="h-8 w-8 text-primary opacity-50" />
              </div>
              <Progress value={stats.networkHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por hash ou documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {['all', 'certificate', 'audit', 'contract', 'inspection', 'training'].map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredTransactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      "hover:bg-muted/50",
                      selectedTx?.id === tx.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedTx(tx)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          getTypeColor(tx.type)
                        )}>
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium">{tx.documentName}</p>
                          <p className="text-sm text-muted-foreground">{tx.documentId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Hash className="h-3 w-3" />
                            <code className="text-xs text-muted-foreground">
                              {tx.hash.slice(0, 18)}...
                            </code>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          tx.status === 'confirmed' ? 'default' :
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {tx.status === 'confirmed' && <Lock className="h-3 w-3 mr-1" />}
                          {tx.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {tx.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tx.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Chain Visualization */}
                    {index < filteredTransactions.length - 1 && (
                      <div className="flex items-center justify-center my-2">
                        <div className="w-px h-4 bg-primary/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Transação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTx ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Documento</label>
                  <p className="font-medium">{selectedTx.documentName}</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Hash da Transação</label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted p-2 rounded flex-1 overflow-hidden">
                      {selectedTx.hash}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(selectedTx.hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Hash Anterior</label>
                  <code className="text-xs bg-muted p-2 rounded block overflow-hidden">
                    {selectedTx.previousHash.slice(0, 24)}...
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Bloco</label>
                    <p className="font-mono">{selectedTx.blockNumber.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Gas</label>
                    <p className="font-mono">{selectedTx.gasUsed?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Rede</label>
                  <Badge variant="outline" className="mt-1">
                    {selectedTx.network.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Emissor</label>
                  <p>{selectedTx.issuer}</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Data/Hora</label>
                  <p>{selectedTx.timestamp.toLocaleString()}</p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no Explorer
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Certificado
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Link2 className="h-12 w-12 mb-4 opacity-50" />
                <p>Selecione uma transação</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Visualização da Cadeia
          </CardTitle>
          <CardDescription>
            Representação visual da integridade do blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 overflow-x-auto">
            {transactions.slice(0, 8).map((tx, index) => (
              <React.Fragment key={tx.id}>
                <div 
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center",
                    "border-2 transition-all cursor-pointer",
                    tx.status === 'confirmed' && "border-green-500 bg-green-500/10",
                    tx.status === 'pending' && "border-yellow-500 bg-yellow-500/10 animate-pulse",
                    tx.status === 'failed' && "border-red-500 bg-red-500/10",
                    selectedTx?.id === tx.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedTx(tx)}
                  title={tx.documentName}
                >
                  <div className="text-center">
                    {getTypeIcon(tx.type)}
                    <p className="text-xs mt-1 font-mono">
                      #{tx.blockNumber.toString().slice(-4)}
                    </p>
                  </div>
                </div>
                {index < transactions.slice(0, 8).length - 1 && (
                  <div className="flex-shrink-0 w-8 h-0.5 bg-primary/30" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainDashboard;
