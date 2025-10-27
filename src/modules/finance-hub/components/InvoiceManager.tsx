import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useFinanceData, Invoice } from "../hooks/useFinanceData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateInvoicePDF, previewInvoicePDF } from "./InvoicePDFGenerator";

export const InvoiceManager = () => {
  const { invoices, loading, createInvoice, updateInvoice } = useFinanceData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_type: 'sales',
    vendor_supplier: '',
    customer_name: '',
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    currency: 'USD',
    payment_terms: '',
    notes: ''
  });

  const handleCreateInvoice = async () => {
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      await createInvoice({
        ...formData,
        invoice_type: formData.invoice_type as 'sales' | 'purchase' | 'expense',
        invoice_number: invoiceNumber,
        status: 'draft',
        issue_date: new Date().toISOString()
      } as Partial<Invoice>);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_type: 'sales',
      vendor_supplier: '',
      customer_name: '',
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      currency: 'USD',
      payment_terms: '',
      notes: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Loading invoices...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>Create, track, and manage invoices</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Enter invoice details below
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_type">Invoice Type</Label>
                    <Select
                      value={formData.invoice_type}
                      onValueChange={(value) => 
                        setFormData({ ...formData, invoice_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Invoice</SelectItem>
                        <SelectItem value="purchase">Purchase Invoice</SelectItem>
                        <SelectItem value="expense">Expense Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => 
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => 
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor_supplier">Vendor/Supplier</Label>
                  <Input
                    id="vendor_supplier"
                    value={formData.vendor_supplier}
                    onChange={(e) => 
                      setFormData({ ...formData, vendor_supplier: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtotal">Subtotal</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      value={formData.subtotal}
                      onChange={(e) => {
                        const subtotal = Number(e.target.value);
                        const total = subtotal + formData.tax_amount - formData.discount_amount;
                        setFormData({ ...formData, subtotal, total_amount: total });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_amount">Tax</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      value={formData.tax_amount}
                      onChange={(e) => {
                        const tax = Number(e.target.value);
                        const total = formData.subtotal + tax - formData.discount_amount;
                        setFormData({ ...formData, tax_amount: tax, total_amount: total });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_amount">Discount</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => {
                        const discount = Number(e.target.value);
                        const total = formData.subtotal + formData.tax_amount - discount;
                        setFormData({ ...formData, discount_amount: discount, total_amount: total });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => 
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invoices found. Create your first invoice to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer/Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="capitalize">
                    {invoice.invoice_type}
                  </TableCell>
                  <TableCell>
                    {invoice.customer_name || invoice.vendor_supplier || '-'}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(invoice.total_amount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(invoice.issue_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => previewInvoicePDF(invoice)}
                        title="Preview Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        title="Edit Invoice"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => generateInvoicePDF(invoice)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
