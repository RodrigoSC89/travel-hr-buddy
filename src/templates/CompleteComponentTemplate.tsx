/**
 * 🎯 COMPLETE COMPONENT TEMPLATE
 * Use this template for ALL new components to ensure 100% completeness
 * 
 * Features included:
 * ✅ TypeScript types
 * ✅ Zod validation
 * ✅ CRUD operations with error handling
 * ✅ Loading states
 * ✅ Empty states
 * ✅ Error states
 * ✅ Toast notifications
 * ✅ Accessibility
 * ✅ Responsive design
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Download, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ============================================
// 1. VALIDATION SCHEMA (REQUIRED)
// ============================================
const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  priority: z.number().min(1).max(5).default(3),
});

type ItemFormData = z.infer<typeof itemSchema>;

// ============================================
// 2. TYPE DEFINITIONS (REQUIRED)
// ============================================
interface Item {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  priority: number;
  created_at: string;
  updated_at: string;
}

interface CompleteComponentProps {
  organizationId: string;
  userId: string;
  onItemSelect?: (item: Item) => void;
}

// ============================================
// 3. MOCK DATA SERVICE (Replace with real API)
// ============================================
const mockItems: Item[] = [
  {
    id: '1',
    name: 'Sample Item 1',
    description: 'This is a sample item',
    status: 'active',
    priority: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================
// 4. COMPONENT (100% COMPLETE)
// ============================================
export default function CompleteComponentTemplate({
  organizationId,
  userId,
  onItemSelect,
}: CompleteComponentProps) {
  const queryClient = useQueryClient();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // ============================================
  // FORM MANAGEMENT (WITH VALIDATION)
  // ============================================
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      priority: 3,
    },
  });

  // ============================================
  // DATA FETCHING (WITH ERROR HANDLING)
  // ============================================
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['items', organizationId, search],
    queryFn: async () => {
      // Replace with real API call
      // Example:
      // const { data, error } = await supabase
      //   .from('items')
      //   .select('*')
      //   .eq('organization_id', organizationId)
      //   .is('deleted_at', null);
      // if (error) throw error;
      // return data as Item[];
      
      // Mock implementation
      return mockItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // ============================================
  // CREATE MUTATION (WITH ERROR HANDLING)
  // ============================================
  const createMutation = useMutation({
    mutationFn: async (values: ItemFormData) => {
      // Replace with real API call
      const newItem: Item = {
        id: Date.now().toString(),
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully');
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
      console.error('Create error:', error);
    },
  });

  // ============================================
  // UPDATE MUTATION (WITH ERROR HANDLING)
  // ============================================
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<ItemFormData> }) => {
      // Replace with real API call
      return { id, ...values };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
      setIsEditOpen(false);
      setSelectedItem(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
      console.error('Update error:', error);
    },
  });

  // ============================================
  // DELETE MUTATION (WITH ERROR HANDLING)
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Replace with real API call
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
      console.error('Delete error:', error);
    },
  });

  // ============================================
  // EVENT HANDLERS (ALL WITH IMPLEMENTATION)
  // ============================================
  const handleCreate = useCallback(() => {
    form.reset();
    setIsCreateOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (item: Item) => {
      setSelectedItem(item);
      form.reset({
        name: item.name,
        description: item.description,
        status: item.status,
        priority: item.priority,
      });
      setIsEditOpen(true);
    },
    [form]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  }, [itemToDelete, deleteMutation]);

  const handleSubmitCreate = form.handleSubmit((values) => {
    createMutation.mutate(values);
  });

  const handleSubmitEdit = form.handleSubmit((values) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, values });
    }
  });

  const handleExport = useCallback(async () => {
    if (!items) return;

    try {
      const csv = [
        ['Name', 'Description', 'Status', 'Priority', 'Created At'].join(','),
        ...items.map((item) =>
          [item.name, item.description || '', item.status, item.priority, item.created_at].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items-${new Date().toISOString()}.csv`;
      a.click();

      toast.success('Items exported successfully');
    } catch (error) {
      toast.error('Failed to export items');
      console.error('Export error:', error);
    }
  }, [items]);

  // ============================================
  // MEMOIZED VALUES
  // ============================================
  const filteredItems = useMemo(() => {
    return items || [];
  }, [items]);

  const stats = useMemo(() => {
    if (!items) return { total: 0, active: 0, inactive: 0 };

    return {
      total: items.length,
      active: items.filter((i) => i.status === 'active').length,
      inactive: items.filter((i) => i.status === 'inactive').length,
    };
  }, [items]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Failed to load items</p>
                  <p className="text-sm">{error.message}</p>
                  <Button onClick={() => refetch()} size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-muted-foreground">
            Manage your items ({stats.total} total, {stats.active} active)
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!items?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          // Empty State
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No items found</p>
              <Button onClick={handleCreate}>Create your first item</Button>
            </CardContent>
          </Card>
        ) : (
          // Items List
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Priority: {item.priority}/5
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(item.id)}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>Add a new item to your collection.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="5"
                {...form.register('priority', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update the item details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" {...form.register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority (1-5)</Label>
              <Input
                id="edit-priority"
                type="number"
                min="1"
                max="5"
                {...form.register('priority', { valueAsNumber: true })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
