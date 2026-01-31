import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Building2, Package, FileText, Star, TrendingUp, Clock, CheckCircle, AlertTriangle, Search, Plus } from 'lucide-react';
import RFQManagementPanel from './RFQManagementPanel';

interface Supplier {
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

interface PurchaseOrder {
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

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Marine Parts Global',
    category: 'Spare Parts',
    rating: 4.8,
    totalOrders: 156,
    onTimeDelivery: 95,
    qualityScore: 98,
    status: 'active',
    lastOrder: '2024-01-18',
    country: 'Singapore'
  },
  {
    id: '2',
    name: 'Ocean Supplies Ltd',
    category: 'Provisions',
    rating: 4.5,
    totalOrders: 89,
    onTimeDelivery: 88,
    qualityScore: 92,
    status: 'active',
    lastOrder: '2024-01-15',
    country: 'Netherlands'
  },
  {
    id: '3',
    name: 'TechNav Systems',
    category: 'Navigation Equipment',
    rating: 4.9,
    totalOrders: 45,
    onTimeDelivery: 98,
    qualityScore: 99,
    status: 'active',
    lastOrder: '2024-01-10',
    country: 'Japan'
  },
  {
    id: '4',
    name: 'SafeSea Equipment',
    category: 'Safety Equipment',
    rating: 3.8,
    totalOrders: 23,
    onTimeDelivery: 75,
    qualityScore: 85,
    status: 'pending',
    lastOrder: '2023-12-20',
    country: 'China'
  }
];

const mockOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplierName: 'Marine Parts Global',
    items: 12,
    totalValue: 45000,
    currency: 'USD',
    status: 'shipped',
    createdDate: '2024-01-15',
    expectedDelivery: '2024-01-25',
    vesselName: 'MV Atlantic Explorer'
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    supplierName: 'Ocean Supplies Ltd',
    items: 45,
    totalValue: 12500,
    currency: 'EUR',
    status: 'confirmed',
    createdDate: '2024-01-18',
    expectedDelivery: '2024-02-01',
    vesselName: 'MV Pacific Star'
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    supplierName: 'TechNav Systems',
    items: 3,
    totalValue: 85000,
    currency: 'USD',
    status: 'draft',
    createdDate: '2024-01-20',
    expectedDelivery: '2024-02-15',
    vesselName: 'MV Indian Ocean'
  }
];

export const SupplierPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
      case 'confirmed':
      case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'draft':
      case 'submitted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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

  const filteredSuppliers = mockSuppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{mockSuppliers.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Orders</p>
                <p className="text-2xl font-bold">{mockOrders.filter(o => o.status !== 'delivered').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">4.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  Supplier Directory
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
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{supplier.rating}</span>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchase Orders
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-lg border border-border/50 bg-background/50"
                  >
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
