/**
 * Manuals Library Component
 * Searchable manual library with AI-powered search
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  Download,
  Eye,
  Sparkles,
  Book,
  Wrench,
  AlertTriangle,
  Settings,
  Shield,
  FileWarning
} from 'lucide-react';
import { useVesselManuals, type VesselManual } from '@/hooks/use-vessel-digital-twin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ManualsLibraryProps {
  vesselId: string;
}

const DOCUMENT_TYPES = [
  { value: 'all', label: 'Todos os Tipos', icon: FileText },
  { value: 'operations', label: 'Operação', icon: Book },
  { value: 'maintenance', label: 'Manutenção', icon: Wrench },
  { value: 'emergency', label: 'Emergência', icon: AlertTriangle },
  { value: 'technical', label: 'Técnico', icon: Settings },
  { value: 'safety', label: 'Segurança', icon: Shield },
  { value: 'regulatory', label: 'Regulatório', icon: FileWarning },
];

const TYPE_COLORS: Record<string, string> = {
  operations: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-amber-100 text-amber-800',
  emergency: 'bg-red-100 text-red-800',
  technical: 'bg-purple-100 text-purple-800',
  safety: 'bg-green-100 text-green-800',
  regulatory: 'bg-gray-100 text-gray-800',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManualsLibrary({ vesselId }: ManualsLibraryProps) {
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('all');
  const [selectedManual, setSelectedManual] = useState<VesselManual | null>(null);
  const [aiSearchMode, setAiSearchMode] = useState(false);

  const { data: manuals, isLoading } = useVesselManuals(
    vesselId, 
    aiSearchMode ? search : undefined
  );

  const filteredManuals = manuals?.filter(manual => {
    const matchesSearch = !search || !aiSearchMode && (
      manual.title.toLowerCase().includes(search.toLowerCase()) ||
      manual.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
      manual.category?.toLowerCase().includes(search.toLowerCase())
    );
    
    const matchesType = docType === 'all' || manual.document_type === docType;
    
    return matchesSearch && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={aiSearchMode ? "Pergunte sobre os manuais..." : "Buscar manuais..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-24"
          />
          <Button
            variant={aiSearchMode ? "default" : "ghost"}
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 gap-1"
            onClick={() => setAiSearchMode(!aiSearchMode)}
          >
            <Sparkles className="h-3 w-3" />
            IA
          </Button>
        </div>
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI Search hint */}
      {aiSearchMode && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm">
              <strong>Busca Inteligente:</strong> Pergunte em linguagem natural, 
              ex: "Como fazer manutenção do motor principal?" ou "Procedimento de emergência para incêndio"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manuals Grid */}
      {filteredManuals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum manual encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredManuals.map(manual => (
            <Card 
              key={manual.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedManual(manual)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{manual.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {manual.manufacturer || 'Sem fabricante'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge 
                    variant="secondary"
                    className={TYPE_COLORS[manual.document_type] || 'bg-gray-100'}
                  >
                    {manual.document_type}
                  </Badge>
                  {manual.ocr_status === 'completed' && (
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      IA
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {manual.language?.toUpperCase() || 'EN'}
                  </Badge>
                </div>

                {manual.ai_summary && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {manual.ai_summary}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{manual.page_count || '?'} páginas</span>
                  <span>{formatFileSize(manual.file_size_bytes)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Details Dialog */}
      <Dialog open={!!selectedManual} onOpenChange={() => setSelectedManual(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedManual?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedManual && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={TYPE_COLORS[selectedManual.document_type]}>
                  {selectedManual.document_type}
                </Badge>
                <Badge variant="outline">{selectedManual.language?.toUpperCase()}</Badge>
                {selectedManual.version && (
                  <Badge variant="outline">v{selectedManual.version}</Badge>
                )}
              </div>

              {selectedManual.ai_summary && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Resumo IA
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedManual.ai_summary}
                  </p>
                </div>
              )}

              {selectedManual.ai_keywords && selectedManual.ai_keywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Palavras-chave</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedManual.ai_keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fabricante</p>
                  <p className="font-medium">{selectedManual.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Categoria</p>
                  <p className="font-medium">{selectedManual.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Páginas</p>
                  <p className="font-medium">{selectedManual.page_count || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tamanho</p>
                  <p className="font-medium">{formatFileSize(selectedManual.file_size_bytes)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data Revisão</p>
                  <p className="font-medium">
                    {selectedManual.revision_date 
                      ? new Date(selectedManual.revision_date).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status OCR</p>
                  <Badge variant={selectedManual.ocr_status === 'completed' ? 'default' : 'secondary'}>
                    {selectedManual.ocr_status}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => window.open(selectedManual.file_url, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
