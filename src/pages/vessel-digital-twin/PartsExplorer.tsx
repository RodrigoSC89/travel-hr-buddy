/**
 * Parts Explorer Component
 * Hierarchical parts catalog with search and filters
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { useVesselParts, type VesselPart } from '@/hooks/use-vessel-digital-twin';
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

interface PartsExplorerProps {
  vesselId: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'hull', label: 'Casco' },
  { value: 'propulsion', label: 'Propulsão' },
  { value: 'electrical', label: 'Elétrica' },
  { value: 'mechanical', label: 'Mecânica' },
  { value: 'navigation', label: 'Navegação' },
  { value: 'safety', label: 'Segurança' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Hidráulica' },
];

const STATUS_ICONS = {
  operational: { icon: CheckCircle, color: 'text-green-500' },
  degraded: { icon: AlertTriangle, color: 'text-amber-500' },
  failed: { icon: XCircle, color: 'text-red-500' },
  replaced: { icon: Wrench, color: 'text-gray-500' },
};

const CRITICALITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

function PartTreeItem({ 
  part, 
  level = 0, 
  onSelect 
}: { 
  part: VesselPart; 
  level?: number;
  onSelect: (part: VesselPart) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = part.children && part.children.length > 0;
  const StatusIcon = STATUS_ICONS[part.status]?.icon || CheckCircle;
  const statusColor = STATUS_ICONS[part.status]?.color || 'text-gray-500';

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-2 px-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(part)}
      >
        {hasChildren ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{part.name}</span>
            <Badge variant="outline" className="text-xs shrink-0">
              {part.part_number}
            </Badge>
          </div>
          {part.manufacturer && (
            <p className="text-xs text-muted-foreground truncate">
              {part.manufacturer} {part.model ? `• ${part.model}` : ''}
            </p>
          )}
        </div>
        
        <StatusIcon className={`h-4 w-4 shrink-0 ${statusColor}`} />
        
        <Badge 
          variant="secondary" 
          className={`text-xs shrink-0 ${CRITICALITY_COLORS[part.criticality]}`}
        >
          {part.criticality}
        </Badge>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {part.children!.map(child => (
            <PartTreeItem 
              key={child.id} 
              part={child} 
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartsExplorer({ vesselId }: PartsExplorerProps) {
  const { data: parts, isLoading } = useVesselParts(vesselId);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedPart, setSelectedPart] = useState<VesselPart | null>(null);

  const filterParts = (items: VesselPart[]): VesselPart[] => {
    return items
      .filter(part => {
        const matchesSearch = !search || 
          part.name.toLowerCase().includes(search.toLowerCase()) ||
          part.part_number.toLowerCase().includes(search.toLowerCase()) ||
          (part.manufacturer?.toLowerCase().includes(search.toLowerCase()));
        
        const matchesCategory = category === 'all' || part.category === category;
        
        return matchesSearch && matchesCategory;
      })
      .map(part => ({
        ...part,
        children: part.children ? filterParts(part.children) : []
      }));
  };

  const filteredParts = parts ? filterParts(parts) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Parts Tree */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar partes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {filteredParts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma parte encontrada</p>
                </div>
              ) : (
                filteredParts.map(part => (
                  <PartTreeItem 
                    key={part.id} 
                    part={part}
                    onSelect={setSelectedPart}
                  />
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Part Details Sidebar */}
      <div className="lg:col-span-1">
        {selectedPart ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{selectedPart.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedPart.part_number}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge 
                  className={CRITICALITY_COLORS[selectedPart.criticality]}
                >
                  {selectedPart.criticality}
                </Badge>
                <Badge variant="outline">
                  {selectedPart.status}
                </Badge>
              </div>

              {selectedPart.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedPart.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Fabricante</p>
                  <p className="font-medium">{selectedPart.manufacturer || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modelo</p>
                  <p className="font-medium">{selectedPart.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nº Série</p>
                  <p className="font-medium">{selectedPart.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {selectedPart.location_deck || 'N/A'}
                    {selectedPart.location_compartment && ` / ${selectedPart.location_compartment}`}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas de Operação</span>
                  <span className="font-medium">{selectedPart.operating_hours.toLocaleString()}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Última Manutenção</span>
                  <span className="font-medium">
                    {selectedPart.last_maintenance 
                      ? new Date(selectedPart.last_maintenance).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próxima Manutenção</span>
                  <span className={`font-medium ${
                    selectedPart.next_maintenance && new Date(selectedPart.next_maintenance) < new Date()
                      ? 'text-red-500'
                      : ''
                  }`}>
                    {selectedPart.next_maintenance 
                      ? new Date(selectedPart.next_maintenance).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo Reposição</span>
                  <span className="font-medium">
                    {selectedPart.replacement_cost 
                      ? `R$ ${selectedPart.replacement_cost.toLocaleString()}`
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedPart.qr_code && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                )}
                {selectedPart.related_manuals?.length > 0 && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manuais ({selectedPart.related_manuals.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma parte para ver os detalhes</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
