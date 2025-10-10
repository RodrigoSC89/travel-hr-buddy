import React, { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { AlertMessage } from "@/components/ui/alert-message";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Receipt, Calendar, Tag, TrendingUp, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const Expenses = () => {
  const { expenses, loading, error, createExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const handleCreateExpense = async (data: any) => {
    try {
      setIsCreating(true);
      await createExpense(data);
      setShowForm(false);
    } catch (error) {
  } finally {
      setIsCreating(false);
    }
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = expenses.filter(exp => exp.status === "pending").length;
  const approvedCount = expenses.filter(exp => exp.status === "approved").length;
  const rejectedCount = expenses.filter(exp => exp.status === "rejected").length;

  // Filter expenses
  const filteredExpenses = filterStatus === "all" 
    ? expenses 
    : expenses.filter(exp => exp.status === filterStatus);

  const statusColors = {
    pending: "bg-warning text-warning-foreground",
    approved: "bg-success text-success-foreground",
    rejected: "bg-danger text-danger-foreground",
  };

  const statusLabels = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };

  const categoryLabels: Record<string, string> = {
    travel: "Viagem",
    accommodation: "Hospedagem",
    meals: "Alimentação",
    transport: "Transporte",
    equipment: "Equipamentos",
    other: "Outros",
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Despesas</h1>
              <p className="text-muted-foreground mt-1">Gerencie suas despesas e reembolsos</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold shadow-azure transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <AlertMessage
            type="error"
            title="Erro"
            message={error}
            className="mb-6"
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border shadow-soft hover:shadow-azure transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {expenses.length} {expenses.length === 1 ? "despesa" : "despesas"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-soft hover:shadow-azure transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {pendingCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-soft hover:shadow-azure transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {approvedCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(expenses.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-soft hover:shadow-azure transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Rejeitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-danger">
                {rejectedCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Requer revisão</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className="whitespace-nowrap"
          >
            Todas
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            className="whitespace-nowrap"
          >
            Pendentes
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            onClick={() => setFilterStatus("approved")}
            className="whitespace-nowrap"
          >
            Aprovadas
          </Button>
          <Button
            variant={filterStatus === "rejected" ? "default" : "outline"}
            onClick={() => setFilterStatus("rejected")}
            className="whitespace-nowrap"
          >
            Rejeitadas
          </Button>
        </div>

        {/* Expenses List */}
        <Card className="bg-card border-border shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-bold text-foreground">Despesas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Histórico de despesas registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredExpenses.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={filterStatus === "all" ? "Nenhuma despesa registrada" : `Nenhuma despesa ${statusLabels[filterStatus as keyof typeof statusLabels]?.toLowerCase()}`}
                description="Adicione uma nova despesa para começar a rastrear seus gastos"
                actionLabel={filterStatus === "all" ? "Adicionar Despesa" : undefined}
                onAction={filterStatus === "all" ? () => setShowForm(true) : undefined}
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-6 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-lg font-semibold text-foreground">
                            {expense.description}
                          </h4>
                          <Badge className={statusColors[expense.status]}>
                            {statusLabels[expense.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {categoryLabels[expense.category]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(expense.date)}
                          </span>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground">{expense.notes}</p>
                        )}
                      </div>
                      <div className="text-right sm:text-left">
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(expense.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(expense.created_at, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              Nova Despesa
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha os detalhes da despesa
            </p>
          </DialogHeader>
          <div className="pt-4">
            <ExpenseForm
              onSubmit={handleCreateExpense}
              onCancel={() => setShowForm(false)}
              isLoading={isCreating}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
