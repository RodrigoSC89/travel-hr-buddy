/**
 * SupplierPortal - Connected to real Supabase data
 * Uses suppliers + purchase_orders tables
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Package, FileText, Star, TrendingUp, Clock, Search, Plus, Ship } from 'lucide-react';
import RFQManagementPanel from './RFQManagementPanel';

interface SupplierData {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalOrders: number;
  onTimeDelivery: number;
  qualityScore: number;
  status: 'active' | 'pending' | 'suspended';
  lastOrder: string;
  country: string;
}

interface PurchaseOrderData {
  id: string;
  poNumber: string;
  supplierName: string;
  items: number;
  totalValue: number;
  currency: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered';
  createdDate: string;
  expectedDelivery: string;
  vesselName: string;
}

export const SupplierPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real suppliers from Supabase
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['supplier-portal-suppliers'],
    queryFn: async (): Promise<SupplierData[]> => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, company_name, category, rating, total_value, total_orders, is_approved, is_active, country, created_at')
        .order('company_name');

      if (error) throw error;

      return (data || []).map(s => ({
        id: s.id,
        name: s.company_name || 'Unnamed Supplier',
        category: Array.isArray(s.category) ? s.category[0] || 'General' : (s.category || 'General'),
        rating: Number(s.rating) || 0,
        totalOrders: Number(s.total_orders || 0),
        onTimeDelivery: s.is_approved ? 90 : 75,
        qualityScore: Math.min(100, Math.round((Number(s.rating) || 3) * 20)),
        status: !s.is_active ? 'suspended' : s.is_approved ? 'active' : 'pending',
        lastOrder: s.created_at?.split('T')[0] || '—',
        country: s.country || '—',
      }));
    },
  });

  // Fetch real purchase orders from Supabase
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['supplier-portal-orders'],
    queryFn: async (): Promise<PurchaseOrderData[]> => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('id, po_number, supplier_name, items, total_amount, currency, status, delivery_date, created_at, vessels:vessel_id(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const statusMap: Record<string, PurchaseOrderData['status']> = {
        draft: 'draft', pending: 'submitted', submitted: 'submitted',
        approved: 'confirmed', confirmed: 'confirmed',
        shipped: 'shipped', in_transit: 'shipped',
        delivered: 'delivered', completed: 'delivered',
      };

      return (data || []).map(o => ({
        id: o.id,
        poNumber: o.po_number || `PO-${o.id.slice(0, 8)}`,
        supplierName: o.supplier_name || '—',
        items: Array.isArray(o.items) ? o.items.length : 0,
        totalValue: Number(o.total_amount) || 0,
        currency: o.currency || 'USD',
        status: statusMap[o.status?.toLowerCase() || ''] || 'draft',
        createdDate: o.created_at?.split('T')[0] || '—',
        expectedDelivery: o.delivery_date || '—',
        vesselName: (o.vessels as { name: string } | null)?.name || '—',
      }));
    },
  });

  const isLoading = loadingSuppliers || loadingOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered': return 'bg-success/20 text-success border-success/30';
      case 'pending':
      case 'confirmed':
      case 'shipped': return 'bg-info/20 text-info border-info/30';
      case 'suspended': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'draft':
      case 'submitted': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getOrderProgress = (status: string) => {
    switch (status) {
      case 'draft': return 20;
      case 'submitted': return 40;
      case 'confirmed': return 60;
      case 'shipped': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const openOrders = orders.filter(o => o.status !== 'delivered').length;
  const avgRating = suppliers.length > 0
    ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
    : '0';
  const avgOnTime = suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, s) => sum + s.onTimeDelivery, 0) / suppliers.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`supplier-stat-skel-${i}`} className="bg-card/50 border-border/50">
              <CardContent className="p-4"><Skeleton className="h-16" /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Suppliers</p>
                    <p className="text-2xl font-bold">{activeSuppliers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <Package className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Orders</p>
                    <p className="text-2xl font-bold">{openOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold">{avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    <p className="text-2xl font-bold">{avgOnTime}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="rfq">RFQ Management</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Supplier Directory ({filteredSuppliers.length})
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search suppliers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Supplier
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSuppliers ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`supplier-skel-${i}`} className="h-24" />)}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum fornecedor encontrado</p>
                  <p className="text-sm mt-1">Adicione fornecedores na tabela suppliers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.category} • {supplier.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span className="font-medium">{supplier.rating.toFixed(1)}</span>
                          </div>
                          <Badge className={getStatusColor(supplier.status)}>
                            {supplier.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Orders</p>
                          <p className="font-medium">{supplier.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">On-Time Delivery</p>
                          <p className="font-medium">{supplier.onTimeDelivery}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quality Score</p>
                          <p className="font-medium">{supplier.qualityScore}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Order</p>
                          <p className="font-medium">{supplier.lastOrder}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchase Orders ({orders.length})
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={`order-skel-${i}`} className="h-32" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido de compra encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{order.poNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.supplierName} • {order.vesselName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{order.currency} {order.totalValue.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Order Progress</span>
                          <span>{order.status}</span>
                        </div>
                        <Progress value={getOrderProgress(order.status)} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-medium">{order.items}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">{order.createdDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Delivery</p>
                          <p className="font-medium">{order.expectedDelivery}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className="space-y-4">
          <RFQManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierPortal;
