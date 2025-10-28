/**
 * PATCH 352: Inventory Management Component
 * Complete inventory management with add, move, and remove operations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Upload
} from "lucide-react";

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_cost?: number;
  location?: string;
  supplier?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item_code: "",
    name: "",
    description: "",
    category: "general",
    unit: "unit",
    current_stock: 0,
    min_stock: 10,
    max_stock: 100,
    unit_cost: 0,
    location: "",
    supplier: ""
  });

  useEffect(() => {
    loadItems();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Error loading inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const createItem = async () => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          ...formData,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "✅ Item Created",
        description: "Inventory item has been added successfully",
      });

      setIsCreateOpen(false);
      resetForm();
      loadItems();
    } catch (error: any) {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(formData)
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "✅ Item Updated",
        description: "Inventory item has been updated successfully",
      });

      setIsEditOpen(false);
      setSelectedItem(null);
      resetForm();
      loadItems();
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ status: 'discontinued' })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item Discontinued",
        description: "Inventory item has been discontinued",
      });

      loadItems();
    } catch (error: any) {
      toast({
        title: "Error discontinuing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const adjustStock = async (itemId: string, adjustment: number) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newStock = Math.max(0, item.current_stock + adjustment);

      const { error } = await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "✅ Stock Updated",
        description: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`,
      });

      loadItems();
    } catch (error: any) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: "",
      name: "",
      description: "",
      category: "general",
      unit: "unit",
      current_stock: 0,
      min_stock: 10,
      max_stock: 100,
      unit_cost: 0,
      location: "",
      supplier: ""
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      item_code: item.item_code,
      name: item.name,
      description: item.description || "",
      category: item.category,
      unit: item.unit,
      current_stock: item.current_stock,
      min_stock: item.min_stock,
      max_stock: item.max_stock || 100,
      unit_cost: item.unit_cost || 0,
      location: item.location || "",
      supplier: item.supplier || ""
    });
    setIsEditOpen(true);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (item.current_stock <= item.min_stock) {
      return <Badge variant="default" className="bg-orange-500">Low Stock</Badge>;
    } else if (item.max_stock && item.current_stock >= item.max_stock) {
      return <Badge variant="default" className="bg-blue-500">Max Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">In Stock</Badge>;
  };

  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Manage supply inventory, track stock levels, and monitor alerts
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to the inventory system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item_code">Item Code</Label>
                    <Input
                      id="item_code"
                      value={formData.item_code}
                      onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                      placeholder="e.g., SAFE-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Safety Helmet"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., safety, tools"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit">Unit</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_stock">Minimum Stock</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_stock">Maximum Stock</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      value={formData.max_stock}
                      onChange={(e) => setFormData({ ...formData, max_stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_cost">Unit Cost</Label>
                    <Input
                      id="unit_cost"
                      type="number"
                      step="0.01"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Warehouse A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createItem}>Create Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min/Max</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold">{item.current_stock}</span>
                        <span className="text-muted-foreground">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.min_stock} / {item.max_stock || 'N/A'}
                    </TableCell>
                    <TableCell>{getStockStatus(item)}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustStock(item.id, -1)}
                          disabled={item.current_stock === 0}
                        >
                          <TrendingDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustStock(item.id, 1)}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update item details and stock levels
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_item_code">Item Code</Label>
              <Input
                id="edit_item_code"
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="edit_name">Item Name</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_description">Description</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_current_stock">Current Stock</Label>
              <Input
                id="edit_current_stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit_min_stock">Minimum Stock</Label>
              <Input
                id="edit_min_stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit_location">Location</Label>
              <Input
                id="edit_location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_supplier">Supplier</Label>
              <Input
                id="edit_supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
