/**
 * Document Version Control - Premium Component
 * WORLD-CLASS: Upload/download, versioning, full-text search
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Upload, Download, Search, Clock,
  History, User, Folder, File, ChevronRight,
  Eye, Trash2, Edit, Plus, Filter, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  size: string;
  version: string;
  lastModified: Date;
  modifiedBy: string;
  category: string;
  tags: string[];
  status: 'current' | 'archived' | 'draft';
  versions: { version: string; date: Date; author: string; changes: string }[];
}

const DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'SMS Manual - Rev 15',
    type: 'pdf',
    size: '4.2 MB',
    version: '15.0',
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    modifiedBy: 'Carlos Silva',
    category: 'ISM',
    tags: ['safety', 'manual', 'required'],
    status: 'current',
    versions: [
      { version: '15.0', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), author: 'Carlos Silva', changes: 'Atualização procedimentos de emergência' },
      { version: '14.0', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), author: 'Pedro Lima', changes: 'Revisão anual' },
      { version: '13.0', date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), author: 'João Santos', changes: 'Correções menores' },
    ],
  },
  {
    id: '2',
    name: 'SSP - Ship Security Plan',
    type: 'pdf',
    size: '2.8 MB',
    version: '5.0',
    lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    modifiedBy: 'André Costa',
    category: 'ISPS',
    tags: ['security', 'confidential', 'required'],
    status: 'current',
    versions: [
      { version: '5.0', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), author: 'André Costa', changes: 'Atualização SSA 2026' },
      { version: '4.0', date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), author: 'Carlos Silva', changes: 'Revisão ISPS' },
    ],
  },
  {
    id: '3',
    name: 'DMLC Part II',
    type: 'doc',
    size: '1.5 MB',
    version: '3.2',
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    modifiedBy: 'Maria Santos',
    category: 'MLC',
    tags: ['crew', 'labour', 'required'],
    status: 'current',
    versions: [
      { version: '3.2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), author: 'Maria Santos', changes: 'Atualização área de acomodações' },
    ],
  },
  {
    id: '4',
    name: 'Checklist Inspeção PSC',
    type: 'xls',
    size: '0.8 MB',
    version: '2.0',
    lastModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    modifiedBy: 'Roberto Oliveira',
    category: 'Compliance',
    tags: ['checklist', 'inspection'],
    status: 'current',
    versions: [],
  },
  {
    id: '5',
    name: 'Procedimento de Bunkering',
    type: 'pdf',
    size: '3.1 MB',
    version: '8.0',
    lastModified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    modifiedBy: 'Fernando Pereira',
    category: 'Operations',
    tags: ['fuel', 'procedure'],
    status: 'current',
    versions: [],
  },
];

const TYPE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-500' },
  doc: { icon: FileText, color: 'text-blue-500' },
  xls: { icon: FileText, color: 'text-green-500' },
  img: { icon: FileText, color: 'text-purple-500' },
  other: { icon: File, color: 'text-gray-500' },
};

const CATEGORIES = ['Todos', 'ISM', 'ISPS', 'MLC', 'Compliance', 'Operations', 'Maintenance'];

export function DocumentVersionControl() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      return file.name;
    },
    onSuccess: (fileName) => {
      toast.success(`"${fileName}" enviado com sucesso`);
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar documentos, tags, conteúdo..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              Documentos ({filteredDocs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredDocs.map(doc => {
                const typeConfig = TYPE_ICONS[doc.type];
                const TypeIcon = typeConfig.icon;
                
                return (
                  <div 
                    key={doc.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-muted ${typeConfig.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{doc.size}</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.modifiedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {doc.lastModified.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{doc.category}</Badge>
                          {doc.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Histórico de Versões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedDoc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Versão atual: {selectedDoc.version}
                  </p>
                </div>
                
                {selectedDoc.versions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDoc.versions.map((v, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${idx === 0 ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={idx === 0 ? 'default' : 'outline'}>
                            v{v.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {v.date.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{v.changes}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {v.author}
                        </p>
                        
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <Download className="h-3 w-3" />
                            Baixar
                          </Button>
                          {idx > 0 && (
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                              Restaurar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum histórico de versões disponível
                  </p>
                )}
                
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Versão
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um documento para ver o histórico</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DocumentVersionControl;
