import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Receipt,
  Plus,
  Eye,
  Download,
  FileText,
  CreditCard,
  Plane,
  Building,
  Utensils,
  ShoppingBag,
  Fuel,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Target,
} from "lucide-react";

interface Expense {
  id: string;
  tripId: string;
  tripTitle: string;
  category: "accommodation" | "transport" | "meals" | "fuel" | "other";
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  merchant: string;
  receiptUrl?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  submittedAt?: Date;
  approvedAt?: Date;
  notes?: string;
  tags?: string[];
  location?: string;
  reimbursable: boolean;
  businessPurpose: string;
}

interface ExpenseBudget {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export const TravelExpenseSystem: React.FC = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: "transport",
    currency: "BRL",
    reimbursable: true,
    status: "draft",
  });
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // Mock data
  const mockExpenses: Expense[] = [
    {
      id: "1",
      tripId: "trip-001",
      tripTitle: "Inspeção Técnica - Santos",
      category: "transport",
      subcategory: "Voo",
      amount: 850.0,
      currency: "BRL",
      description: "Passagem aérea São Paulo - Santos",
      date: new Date("2024-03-15"),
      merchant: "GOL Linhas Aéreas",
      receiptUrl: "/receipts/receipt-001.pdf",
      status: "approved",
      submittedAt: new Date("2024-03-16"),
      approvedAt: new Date("2024-03-17"),
      notes: "Voo aprovado com antecedência",
      tags: ["voo", "urgente"],
      location: "Santos, SP",
      reimbursable: true,
      businessPurpose: "Inspeção obrigatória de embarcação",
    },
    {
      id: "2",
      tripId: "trip-001",
      tripTitle: "Inspeção Técnica - Santos",
      category: "accommodation",
      amount: 320.0,
      currency: "BRL",
      description: "Hotel Ibis Santos - 2 diárias",
      date: new Date("2024-03-15"),
      merchant: "Ibis Santos",
      receiptUrl: "/receipts/receipt-002.pdf",
      status: "approved",
      submittedAt: new Date("2024-03-16"),
      approvedAt: new Date("2024-03-17"),
      location: "Santos, SP",
      reimbursable: true,
      businessPurpose: "Hospedagem durante inspeção",
    },
    {
      id: "3",
      tripId: "trip-001",
      tripTitle: "Inspeção Técnica - Santos",
      category: "meals",
      amount: 85.5,
      currency: "BRL",
      description: "Almoço de negócios com cliente",
      date: new Date("2024-03-16"),
      merchant: "Restaurante Mariscos",
      status: "submitted",
      submittedAt: new Date("2024-03-17"),
      location: "Santos, SP",
      reimbursable: true,
      businessPurpose: "Reunião com cliente durante inspeção",
    },
    {
      id: "4",
      tripId: "trip-002",
      tripTitle: "Conferência Marítima - Hamburg",
      category: "transport",
      subcategory: "Voo Internacional",
      amount: 4500.0,
      currency: "BRL",
      description: "Passagem São Paulo - Hamburg (ida e volta)",
      date: new Date("2024-04-20"),
      merchant: "Lufthansa",
      status: "draft",
      location: "Hamburg, Alemanha",
      reimbursable: true,
      businessPurpose: "Participação em conferência técnica",
    },
  ];

  const mockBudgets: ExpenseBudget[] = [
    { category: "Transporte", allocated: 15000, spent: 5350, remaining: 9650, percentage: 36 },
    { category: "Hospedagem", allocated: 8000, spent: 3200, remaining: 4800, percentage: 40 },
    { category: "Alimentação", allocated: 3000, spent: 985, remaining: 2015, percentage: 33 },
    { category: "Combustível", allocated: 2000, spent: 450, remaining: 1550, percentage: 23 },
    { category: "Outros", allocated: 2000, spent: 320, remaining: 1680, percentage: 16 },
  ];

  useEffect(() => {
    loadExpensesAndBudgets();
  }, []);

  const loadExpensesAndBudgets = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from Supabase
      setExpenses(mockExpenses);
      setBudgets(mockBudgets);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.merchant) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const expense: Expense = {
        id: `exp-${Date.now()}`,
        tripId: "trip-current",
        tripTitle: "Viagem Atual",
        category: newExpense.category as Expense["category"],
        amount: newExpense.amount!,
        currency: newExpense.currency || "BRL",
        description: newExpense.description!,
        date: new Date(),
        merchant: newExpense.merchant!,
        status: "draft",
        reimbursable: newExpense.reimbursable || true,
        businessPurpose: newExpense.businessPurpose || "",
        location: newExpense.location,
        notes: newExpense.notes,
      };

      setExpenses(prev => [...prev, expense]);
      setNewExpense({
        category: "transport",
        currency: "BRL",
        reimbursable: true,
        status: "draft",
      });
      setIsAddingExpense(false);

      toast({
        title: "Despesa adicionada",
        description: "Despesa criada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport":
        return <Plane className="h-4 w-4" />;
      case "accommodation":
        return <Building className="h-4 w-4" />;
      case "meals":
        return <Utensils className="h-4 w-4" />;
      case "fuel":
        return <Fuel className="h-4 w-4" />;
      case "other":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "paid":
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "paid":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = expenses
    .filter(exp => exp.status === "approved")
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses
    .filter(exp => exp.status === "submitted")
    .reduce((sum, exp) => sum + exp.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {expenses.length} registros
                </p>
              </div>
              <Receipt className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(approvedExpenses)}
                </p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  {expenses.filter(e => e.status === "approved").length} itens
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-warning">{formatCurrency(pendingExpenses)}</p>
                <p className="text-xs text-warning flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {expenses.filter(e => e.status === "submitted").length} itens
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-3xl font-bold text-info">
                  {expenses.length > 0
                    ? Math.round(
                        (expenses.filter(e => e.status === "approved").length / expenses.length) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-info flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" />
                  Última semana
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de despesas por categoria */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["transport", "accommodation", "meals", "fuel", "other"].map(category => {
                    const categoryExpenses = expenses.filter(e => e.category === category);
                    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(total)}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{categoryExpenses.length} itens</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Orçamentos resumidos */}
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Status dos Orçamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.map((budget, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                        </span>
                      </div>
                      <Progress value={budget.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Restante: {formatCurrency(budget.remaining)}</span>
                        <span
                          className={budget.percentage > 80 ? "text-red-600" : "text-green-600"}
                        >
                          {budget.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gerenciar Despesas</h3>
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button className="btn-travel">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Despesa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={value =>
                          setNewExpense(prev => ({
                            ...prev,
                            category: value as Expense["category"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transport">Transporte</SelectItem>
                          <SelectItem value="accommodation">Hospedagem</SelectItem>
                          <SelectItem value="meals">Alimentação</SelectItem>
                          <SelectItem value="fuel">Combustível</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Valor</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newExpense.amount || ""}
                        onChange={e =>
                          setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Descrição da despesa"
                      value={newExpense.description || ""}
                      onChange={e =>
                        setNewExpense(prev => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="merchant">Fornecedor</Label>
                      <Input
                        id="merchant"
                        placeholder="Nome do fornecedor"
                        value={newExpense.merchant || ""}
                        onChange={e =>
                          setNewExpense(prev => ({ ...prev, merchant: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        placeholder="Cidade, Estado"
                        value={newExpense.location || ""}
                        onChange={e =>
                          setNewExpense(prev => ({ ...prev, location: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessPurpose">Finalidade Comercial</Label>
                    <Textarea
                      id="businessPurpose"
                      placeholder="Descreva a finalidade comercial da despesa"
                      value={newExpense.businessPurpose || ""}
                      onChange={e =>
                        setNewExpense(prev => ({ ...prev, businessPurpose: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddExpense} className="btn-travel">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Despesa
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {expenses.map(expense => (
              <Card
                key={expense.id}
                className="travel-card hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">{expense.merchant}</p>
                        </div>
                        <Badge className={getStatusColor(expense.status)}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1 capitalize">{expense.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{expense.date.toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{expense.location || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{expense.tripTitle}</span>
                        </div>
                      </div>

                      {expense.businessPurpose && (
                        <p className="text-sm text-muted-foreground">{expense.businessPurpose}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="btn-travel">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {expense.receiptUrl && (
                        <Button variant="outline" size="sm" className="btn-travel">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Controle de Orçamentos
              </CardTitle>
              <CardDescription>Acompanhe o uso dos orçamentos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgets.map((budget, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">{budget.category}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(budget.spent)}</p>
                        <p className="text-sm text-muted-foreground">
                          de {formatCurrency(budget.allocated)}
                        </p>
                      </div>
                    </div>

                    <Progress value={budget.percentage} className="h-3 mb-2" />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Restante: {formatCurrency(budget.remaining)}
                      </span>
                      <span
                        className={`font-medium ${budget.percentage > 80 ? "text-red-600" : budget.percentage > 60 ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {budget.percentage}% utilizado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Relatórios de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <Download className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Relatório Mensal</h4>
                    <p className="text-sm text-muted-foreground">Despesas do mês atual</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Análise de Tendências</h4>
                    <p className="text-sm text-muted-foreground">Comparativo trimestral</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Controle Orçamentário</h4>
                    <p className="text-sm text-muted-foreground">Status dos orçamentos</p>
                  </div>
                </Button>

                <Button variant="outline" className="btn-travel p-6 h-auto">
                  <div className="text-center">
                    <User className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold">Por Funcionário</h4>
                    <p className="text-sm text-muted-foreground">Despesas por pessoa</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
