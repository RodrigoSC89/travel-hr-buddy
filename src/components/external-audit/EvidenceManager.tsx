/**
 * Evidence Manager - Full Implementation
 * Manages audit evidence and documentation
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, 
  Upload, 
  Search, 
  Filter,
  FolderOpen,
  FileText,
  Image,
  Video,
  File,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  Eye,
  Trash2,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Evidence {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'other';
  category: string;
  regulation: string;
  status: 'approved' | 'pending' | 'rejected';
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  linkedAudits: string[];
}

const fallbackEvidence: Evidence[] = [
  { id: '1', name: 'SMS_Manual_v4.2.pdf', type: 'document', category: 'SMS Documentation', regulation: 'ISM 11.2', status: 'approved', uploadedBy: 'Carlos Silva', uploadedAt: '2026-01-10', size: '2.4 MB', linkedAudits: ['ISM-2026-001'] },
  { id: '2', name: 'Safety_Policy_2026.pdf', type: 'document', category: 'Safety Policies', regulation: 'ISM 2.1', status: 'approved', uploadedBy: 'Maria Santos', uploadedAt: '2026-01-08', size: '1.1 MB', linkedAudits: ['ISM-2026-001', 'ISPS-2026-002'] },
  { id: '3', name: 'Drill_Record_Jan2026.xlsx', type: 'document', category: 'Training Records', regulation: 'SOLAS III/19', status: 'pending', uploadedBy: 'João Oliveira', uploadedAt: '2026-01-12', size: '856 KB', linkedAudits: [] },
  { id: '4', name: 'Fire_Drill_Evidence.mp4', type: 'video', category: 'Training Records', regulation: 'SOLAS III/19', status: 'approved', uploadedBy: 'Pedro Costa', uploadedAt: '2026-01-05', size: '45 MB', linkedAudits: ['SOLAS-2026-001'] },
  { id: '5', name: 'Equipment_Inspection.jpg', type: 'image', category: 'Maintenance', regulation: 'ISM 10.3', status: 'pending', uploadedBy: 'Ana Lima', uploadedAt: '2026-01-14', size: '3.2 MB', linkedAudits: [] },
  { id: '6', name: 'STCW_Certificates_Crew.zip', type: 'other', category: 'Crew Competence', regulation: 'STCW I/2', status: 'approved', uploadedBy: 'Carlos Silva', uploadedAt: '2026-01-03', size: '12.5 MB', linkedAudits: ['MLC-2026-001'] },
];

const categories = [
  { name: 'SMS Documentation', count: 12, complete: 10 },
  { name: 'Safety Policies', count: 8, complete: 8 },
  { name: 'Training Records', count: 15, complete: 11 },
  { name: 'Crew Competence', count: 22, complete: 20 },
  { name: 'Maintenance', count: 18, complete: 14 },
  { name: 'Emergency Plans', count: 6, complete: 6 },
];

export function EvidenceManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [evidence] = useState<Evidence[]>(fallbackEvidence);

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      default: return File;
    }
  };

  const getStatusBadge = (status: Evidence['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success hover:bg-success/10"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/10"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10"><AlertTriangle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
    }
  };

  const filteredEvidence = evidence.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.regulation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalEvidence = evidence.length;
  const approvedEvidence = evidence.filter(e => e.status === 'approved').length;
  const completionRate = (approvedEvidence / totalEvidence) * 100;

  const handleUpload = () => {
    toast({
      title: "📤 Upload Iniciado",
      description: "Arraste arquivos ou clique para selecionar",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciador de Evidências</h1>
          <p className="text-muted-foreground">
            Organize e gerencie documentação para auditorias externas
          </p>
        </div>
        <Button className="gap-2" onClick={handleUpload}>
          <Upload className="h-4 w-4" />
          Upload de Evidência
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Evidências</p>
                <p className="text-2xl font-bold">{totalEvidence}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{approvedEvidence}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{evidence.filter(e => e.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              </div>
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Categorias</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="px-4 pb-4 space-y-2">
                <Button 
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory(null)}
                >
                  <span>Todas</span>
                  <Badge variant="outline">{evidence.length}</Badge>
                </Button>
                {categories.map((cat) => (
                  <Button 
                    key={cat.name}
                    variant={selectedCategory === cat.name ? "secondary" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <span className="truncate text-left">{cat.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{cat.complete}/{cat.count}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Evidence List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar evidências..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvidence.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{item.regulation}</Badge>
                          <span className="text-xs text-muted-foreground">{item.size}</span>
                        </div>
                        {item.linkedAudits.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Link2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {item.linkedAudits.length} auditoria(s)
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="ghost" className="h-8 gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 gap-1">
                            <Download className="h-3 w-3" />
                            Baixar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 gap-1 text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEvidence.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma evidência encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tente ajustar seus filtros ou faça upload de novas evidências
                </p>
                <Button className="gap-2" onClick={handleUpload}>
                  <Plus className="h-4 w-4" />
                  Adicionar Evidência
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}