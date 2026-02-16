/**
 * Procurement Dialogs - New Supplier, RFQ, Inventory Item, Alternatives
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabels, type Supplier, type PurchaseRecommendation } from "./types";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newSupplier: { company_name: string; contact_email: string; contact_phone: string; city: string; country: string; category: string };
  setNewSupplier: (v: any) => void;
  onSubmit: () => void;
}

export function NewSupplierDialog({ open, onOpenChange, newSupplier, setNewSupplier, onSubmit }: SupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
          <DialogDescription>Preencha os dados do fornecedor para cadastro</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Empresa *</Label>
            <Input value={newSupplier.company_name} onChange={(e) => setNewSupplier({...newSupplier, company_name: e.target.value})} placeholder="Nome da empresa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email de Contato</Label>
              <Input type="email" value={newSupplier.contact_email} onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})} placeholder="contato@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={newSupplier.contact_phone} onChange={(e) => setNewSupplier({...newSupplier, contact_phone: e.target.value})} placeholder="+55 21 99999-9999" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={newSupplier.city} onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})} placeholder="Rio de Janeiro" />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Input value={newSupplier.country} onChange={(e) => setNewSupplier({...newSupplier, country: e.target.value})} placeholder="Brasil" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria Principal</Label>
            <Select value={newSupplier.category} onValueChange={(v) => setNewSupplier({...newSupplier, category: v})}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={!newSupplier.company_name}>
            <Plus className="h-4 w-4 mr-2" />Cadastrar Fornecedor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RFQDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newRFQ: { title: string; category: string; delivery_port: string; budget_estimate: number; deadline: string };
  setNewRFQ: (v: any) => void;
  onSubmit: () => void;
}

export function NewRFQDialog({ open, onOpenChange, newRFQ, setNewRFQ, onSubmit }: RFQDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Cotação (RFQ)</DialogTitle>
          <DialogDescription>Crie uma nova RFQ para solicitar cotações de fornecedores</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={newRFQ.title} onChange={(e) => setNewRFQ({...newRFQ, title: e.target.value})} placeholder="Ex: Compra de filtros para motor principal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newRFQ.category} onValueChange={(v) => setNewRFQ({...newRFQ, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Porto de Entrega</Label>
              <Input value={newRFQ.delivery_port} onChange={(e) => setNewRFQ({...newRFQ, delivery_port: e.target.value})} placeholder="Ex: Porto de Santos" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Orçamento Estimado (R$)</Label>
              <Input type="number" value={newRFQ.budget_estimate} onChange={(e) => setNewRFQ({...newRFQ, budget_estimate: Number(e.target.value)})} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Data Limite</Label>
              <Input type="date" value={newRFQ.deadline} onChange={(e) => setNewRFQ({...newRFQ, deadline: e.target.value})} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={!newRFQ.title}>
            <FileText className="h-4 w-4 mr-2" />Criar RFQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newItem: { name: string; item_code: string; category: string; current_stock: number; minimum_stock: number; maximum_stock: number; unit_cost: number; location: string };
  setNewItem: (v: any) => void;
  onSubmit: () => void;
}

export function NewItemDialog({ open, onOpenChange, newItem, setNewItem, onSubmit }: ItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
          <DialogDescription>Cadastre um novo item no sistema de inventário</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Nome do item" />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={newItem.item_code} onChange={(e) => setNewItem({...newItem, item_code: e.target.value})} placeholder="SKU-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} placeholder="Ex: Lubrificantes" />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} placeholder="Ex: Armazém A" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Estoque Atual</Label>
              <Input type="number" value={newItem.current_stock} onChange={(e) => setNewItem({...newItem, current_stock: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Mínimo</Label>
              <Input type="number" value={newItem.minimum_stock} onChange={(e) => setNewItem({...newItem, minimum_stock: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Máximo</Label>
              <Input type="number" value={newItem.maximum_stock} onChange={(e) => setNewItem({...newItem, maximum_stock: Number(e.target.value)})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Custo Unitário (R$)</Label>
            <Input type="number" value={newItem.unit_cost} onChange={(e) => setNewItem({...newItem, unit_cost: Number(e.target.value)})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={!newItem.name}>
            <Plus className="h-4 w-4 mr-2" />Adicionar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AlternativesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recommendation: PurchaseRecommendation | null;
  suppliers: Supplier[];
  onSelect: (supplier: Supplier) => void;
}

export function AlternativesDialog({ open, onOpenChange, recommendation, suppliers, onSelect }: AlternativesDialogProps) {
  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("h-3.5 w-3.5", star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating?.toFixed(1) || "N/A"})</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fornecedores Alternativos</DialogTitle>
          <DialogDescription>
            {recommendation && `Alternativas para: ${recommendation.item.name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {suppliers.slice(0, 5).map((supplier, index) => (
            <div key={supplier.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{index + 1}</div>
                <div>
                  <p className="font-medium">{supplier.company_name}</p>
                  <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {renderStars(supplier.rating)}
                <Badge variant="outline">{supplier.lead_time_days || 5} dias</Badge>
                <Button size="sm" onClick={() => onSelect(supplier)}>Selecionar</Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
