/**
 * Smart Supplier Catalog — IMPA-coded maritime catalog with estimated pricing
 * Fecha o gap #3: Procurement Punchout Catalogs
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, ShoppingCart, Download, Clock, AlertTriangle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getMaritimeCatalog, type CatalogItem } from '@/lib/maritime/market-intelligence';

export function SmartSupplierCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<{ item: CatalogItem; qty: number }[]>([]);

  const catalog = useMemo(() => getMaritimeCatalog(), []);
  const categories = useMemo(() => ['all', ...new Set(catalog.map(c => c.category))], [catalog]);

  const filtered = useMemo(() => {
    return catalog.filter(item => {
      const matchSearch = !search || item.description.toLowerCase().includes(search.toLowerCase()) || item.impaCode.includes(search);
      const matchCategory = category === 'all' || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [catalog, search, category]);

  const addToCart = (item: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.impaCode === item.impaCode);
      if (existing) return prev.map(c => c.item.impaCode === item.impaCode ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`${item.description} adicionado ao carrinho`);
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.estimatedPrice * c.qty, 0);

  const createRFQ = () => {
    if (cart.length === 0) { toast.error('Carrinho vazio'); return; }
    const csv = ['IMPA Code,Description,Qty,Unit,Est. Price,Category',
      ...cart.map(c => `${c.item.impaCode},"${c.item.description}",${c.qty},${c.item.unit},$${c.item.estimatedPrice},${c.item.category}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `rfq-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`RFQ gerada com ${cart.length} itens — Total estimado: $${cartTotal.toLocaleString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Smart Supplier Catalog
          </h3>
          <p className="text-sm text-muted-foreground">Catálogo IMPA com preços estimados • Geração automática de RFQ</p>
        </div>
        <div className="flex gap-2 items-center">
          {cart.length > 0 && (
            <Badge className="text-sm px-3 py-1">
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> {cart.length} itens · ${cartTotal.toLocaleString()}
            </Badge>
          )}
          <Button size="sm" onClick={createRFQ} disabled={cart.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Gerar RFQ
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por IMPA code ou descrição..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'Todas categorias' : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Cart summary */}
      {cart.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Carrinho RFQ ({cart.length} itens)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cart.map(c => (
                <Badge key={c.item.impaCode} variant="secondary" className="text-xs cursor-pointer" onClick={() => setCart(prev => prev.filter(p => p.item.impaCode !== c.item.impaCode))}>
                  {c.item.impaCode} × {c.qty} — ${(c.item.estimatedPrice * c.qty).toLocaleString()} ✕
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catalog Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4">IMPA Code</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-center py-3 px-4">Unit</th>
                <th className="text-right py-3 px-4">Est. Price</th>
                <th className="text-center py-3 px-4">Lead Time</th>
                <th className="text-center py-3 px-4">Critical</th>
                <th className="text-center py-3 px-4">Alternativas</th>
                <th className="text-center py-3 px-4">Ação</th>
              </tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.impaCode} className="border-b hover:bg-muted/20">
                    <td className="py-3 px-4 font-mono text-xs">{item.impaCode}</td>
                    <td className="py-3 px-4 font-medium">{item.description}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{item.category}</td>
                    <td className="py-3 px-4 text-center text-xs">{item.unit}</td>
                    <td className="py-3 px-4 text-right font-bold">${item.estimatedPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{item.leadTimeDays}d</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.criticalSpare ? <AlertTriangle className="h-4 w-4 text-warning mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                      {item.alternatives.length > 0 ? item.alternatives.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" variant="outline" onClick={() => addToCart(item)} className="h-7 text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartSupplierCatalog;
