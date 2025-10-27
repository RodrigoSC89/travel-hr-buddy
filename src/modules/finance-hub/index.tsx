import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PieChart, 
  FileText,
  Activity,
  AlertTriangle,
  Download 
} from "lucide-react";
import { useFinanceData } from "./hooks/useFinanceData";
import { InvoiceManager } from "./components/InvoiceManager";
import { FinanceExportService } from "./services/finance-export";
import { useToast } from "@/hooks/use-toast";

// PATCH 192.0: Complete Finance Hub with real Supabase integration

const FinanceHub = () => {
  const { summary, transactions, categories, invoices, loading } = useFinanceData();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Finance Hub</h1>
          <p className="text-muted-foreground">Complete financial management with real-time data</p>
        </div>
      </div>
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary ? formatCurrency(summary.totalIncome) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary ? formatCurrency(summary.totalExpenses) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary && summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary ? formatCurrency(summary.netProfit) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? summary.pendingInvoices : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.overdueInvoices > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  {summary.overdueInvoices} overdue
                </span>
              )}
              {(!summary || summary.overdueInvoices === 0) && "Pending invoices"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found. Start by creating your first transaction.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {transaction.transaction_type === "income" ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.description || "Transaction"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.transaction_type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.transaction_type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline">{transaction.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No categories found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{category.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {category.category_type}
                            </p>
                          </div>
                          {category.budget_allocated && (
                            <div className="text-right">
                              <p className="font-bold">
                                {formatCurrency(category.budget_allocated)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {category.budget_period || "monthly"}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Full Report</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Export complete financial report including transactions, invoices, and budget categories
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        if (!summary) {
                          toast({
                            title: "No Data",
                            description: "No financial data available to export",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        const dateFrom = new Date();
                        dateFrom.setMonth(dateFrom.getMonth() - 1);
                        const dateTo = new Date();
                        
                        FinanceExportService.exportToPDF({
                          summary,
                          transactions,
                          invoices,
                          categories,
                          dateRange: {
                            from: dateFrom.toISOString(),
                            to: dateTo.toISOString()
                          }
                        }, `financial-report-${new Date().toISOString().split("T")[0]}.pdf`);
                        
                        toast({
                          title: "Success",
                          description: "Financial report exported to PDF"
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (!summary) {
                          toast({
                            title: "No Data",
                            description: "No financial data available to export",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        const dateFrom = new Date();
                        dateFrom.setMonth(dateFrom.getMonth() - 1);
                        const dateTo = new Date();
                        
                        FinanceExportService.exportToCSV({
                          summary,
                          transactions,
                          invoices,
                          categories,
                          dateRange: {
                            from: dateFrom.toISOString(),
                            to: dateTo.toISOString()
                          }
                        }, `financial-report-${new Date().toISOString().split("T")[0]}.csv`);
                        
                        toast({
                          title: "Success",
                          description: "Financial report exported to CSV"
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Transactions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Export only transaction data to CSV format
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (transactions.length === 0) {
                          toast({
                            title: "No Data",
                            description: "No transactions available to export",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        FinanceExportService.exportTransactionsToCSV(
                          transactions,
                          `transactions-${new Date().toISOString().split("T")[0]}.csv`
                        );
                        
                        toast({
                          title: "Success",
                          description: "Transactions exported to CSV"
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Transactions
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Invoices</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Export only invoice data to CSV format
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (invoices.length === 0) {
                          toast({
                            title: "No Data",
                            description: "No invoices available to export",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        FinanceExportService.exportInvoicesToCSV(
                          invoices,
                          `invoices-${new Date().toISOString().split("T")[0]}.csv`
                        );
                        
                        toast({
                          title: "Success",
                          description: "Invoices exported to CSV"
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Invoices
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Summary</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Current period financial overview
                    </p>
                  </CardHeader>
                  <CardContent>
                    {summary && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-semibold">{summary.transactionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Invoices:</span>
                          <span className="font-semibold">{invoices.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Categories:</span>
                          <span className="font-semibold">{categories.length}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceHub;
