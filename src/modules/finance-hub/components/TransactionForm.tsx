import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { useFinanceData, FinancialTransaction } from "../hooks/useFinanceData";

interface TransactionFormProps {
  transaction?: FinancialTransaction | null;
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  transaction, 
  onSuccess 
}) => {
  const { createTransaction, updateTransaction } = useFinanceData();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    transaction_type: transaction?.transaction_type || 'expense',
    amount: transaction?.amount || 0,
    currency: transaction?.currency || 'USD',
    description: transaction?.description || '',
    transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
    payment_method: transaction?.payment_method || 'bank_transfer',
    vendor_supplier: transaction?.vendor_supplier || '',
    status: transaction?.status || 'completed'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transaction?.id) {
        await updateTransaction(transaction.id, formData);
      } else {
        await createTransaction(formData);
      }
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
      
      // Reset form if creating new
      if (!transaction) {
        setFormData({
          transaction_type: 'expense',
          amount: 0,
          currency: 'USD',
          description: '',
          transaction_date: new Date().toISOString().split('T')[0],
          payment_method: 'bank_transfer',
          vendor_supplier: '',
          status: 'completed'
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Create New Transaction'}
          </DialogTitle>
          <DialogDescription>
            Enter transaction details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Type</Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value) => 
                    setFormData({ ...formData, transaction_type: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => 
                    setFormData({ ...formData, amount: parseFloat(e.target.value) })
                  }
                  required
                />
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => 
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter transaction description"
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
                placeholder="Enter vendor or supplier name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Transaction Date</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => 
                    setFormData({ ...formData, transaction_date: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => 
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
