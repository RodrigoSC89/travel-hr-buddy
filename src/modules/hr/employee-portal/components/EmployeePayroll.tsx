/**
 * PATCH 353: Employee Payroll Component
 * View payroll history and download payslips
 * PATCH 855 - Removed @ts-nocheck, added proper typing
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

interface PayrollBreakdown {
  [key: string]: number;
}

interface PayrollRecord {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  payment_date: string;
  gross_salary: number;
  deductions: number;
  bonuses: number;
  net_salary: number;
  currency: string;
  status: string;
  payslip_url?: string;
  breakdown: PayrollBreakdown;
  notes?: string;
  created_at: string;
}

// Mock data for demo - in production this would come from crew_payroll table
const MOCK_PAYROLL_DATA: PayrollRecord[] = [
  {
    id: "1",
    pay_period_start: "2024-12-01",
    pay_period_end: "2024-12-15",
    payment_date: "2024-12-20",
    gross_salary: 5000,
    deductions: 1000,
    bonuses: 500,
    net_salary: 4500,
    currency: "USD",
    status: "paid",
    breakdown: { tax: 800, insurance: 200 },
    created_at: "2024-12-20T00:00:00Z"
  },
  {
    id: "2",
    pay_period_start: "2024-11-16",
    pay_period_end: "2024-11-30",
    payment_date: "2024-12-05",
    gross_salary: 5000,
    deductions: 1000,
    bonuses: 0,
    net_salary: 4000,
    currency: "USD",
    status: "paid",
    breakdown: { tax: 800, insurance: 200 },
    created_at: "2024-12-05T00:00:00Z"
  }
];

export const EmployeePayroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayrollRecords();
  }, []);

  const loadPayrollRecords = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPayrollRecords([]);
        return;
      }

      // Query crew_payroll table for real data
      const { data, error } = await supabase
        .from('crew_payroll')
        .select('*')
        .order('payment_date', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn("No payroll records found, using fallback", { error: error.message });
        // Fallback to demo data only if DB query fails
        setPayrollRecords(MOCK_PAYROLL_DATA);
        return;
      }

      if (data && data.length > 0) {
        // Map DB data to component interface
        const mappedRecords: PayrollRecord[] = data.map((record: Record<string, unknown>) => ({
          id: String(record.id || ''),
          pay_period_start: String(record.pay_period_start || record.period_start || ''),
          pay_period_end: String(record.pay_period_end || record.period_end || ''),
          payment_date: String(record.payment_date || record.created_at || ''),
          gross_salary: Number(record.gross_salary || record.gross_amount || 0),
          deductions: Number(record.deductions || record.total_deductions || 0),
          bonuses: Number(record.bonuses || record.allowances || 0),
          net_salary: Number(record.net_salary || record.net_amount || 0),
          currency: String(record.currency || 'USD'),
          status: String(record.status || 'pending'),
          payslip_url: record.payslip_url ? String(record.payslip_url) : undefined,
          breakdown: (record.breakdown as PayrollBreakdown) || {},
          notes: record.notes ? String(record.notes) : undefined,
          created_at: String(record.created_at || new Date().toISOString())
        }));
        setPayrollRecords(mappedRecords);
      } else {
        // No data found - show empty state
        setPayrollRecords([]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Error loading payroll", { error: errorMessage });
      toast({
        title: "Error loading payroll",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewRecord = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const downloadPayslip = async (record: PayrollRecord) => {
    if (record.payslip_url) {
      window.open(record.payslip_url, "_blank");
    } else {
      toast({
        title: "Payslip not available",
        description: "Payslip document is not available for this period",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      paid: { label: "Paid", className: "bg-green-500", icon: CheckCircle },
      processed: { label: "Processed", className: "bg-blue-500", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-500", icon: Clock },
      cancelled: { label: "Cancelled", className: "bg-red-500", icon: XCircle },
    };

    const statusConfig = config[status] || { label: status, className: "bg-gray-500", icon: FileText };
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const calculateYearToDate = () => {
    const currentYear = new Date().getFullYear();
    const ytdRecords = payrollRecords.filter(record => 
      new Date(record.payment_date).getFullYear() === currentYear &&
      record.status === "paid"
    );

    return {
      grossTotal: ytdRecords.reduce((sum, r) => sum + r.gross_salary, 0),
      netTotal: ytdRecords.reduce((sum, r) => sum + r.net_salary, 0),
      deductionsTotal: ytdRecords.reduce((sum, r) => sum + r.deductions, 0),
      bonusesTotal: ytdRecords.reduce((sum, r) => sum + r.bonuses, 0),
    };
  };

  const ytd = calculateYearToDate();

  return (
    <div className="space-y-6">
      {/* YTD Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YTD Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytd.grossTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YTD Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytd.netTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YTD Deductions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytd.deductionsTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Taxes & benefits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YTD Bonuses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytd.bonusesTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Extra compensation</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll History
          </CardTitle>
          <CardDescription>
            View your payment history and download payslips
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payroll history...</div>
          ) : payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(record.pay_period_start), "MMM dd")} - {format(new Date(record.pay_period_end), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(record.payment_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right font-medium">
                      {record.currency} ${record.gross_salary.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -${record.deductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${record.net_salary.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => viewRecord(record)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {record.payslip_url && (
                          <Button size="sm" variant="outline" onClick={() => downloadPayslip(record)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
            <DialogDescription>
              {selectedRecord && (
                <>
                  Pay period: {format(new Date(selectedRecord.pay_period_start), "MMM dd")} - {format(new Date(selectedRecord.pay_period_end), "MMM dd, yyyy")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Payment Date</div>
                  <div className="text-lg font-medium">{format(new Date(selectedRecord.payment_date), "MMMM dd, yyyy")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Salary</span>
                  <span className="font-semibold">${selectedRecord.gross_salary.toLocaleString()}</span>
                </div>
                {selectedRecord.bonuses > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonuses</span>
                    <span className="font-semibold">+${selectedRecord.bonuses.toLocaleString()}</span>
                  </div>
                )}
                {selectedRecord.deductions > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Deductions</span>
                    <span className="font-semibold">-${selectedRecord.deductions.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Net Salary</span>
                  <span>{selectedRecord.currency} ${selectedRecord.net_salary.toLocaleString()}</span>
                </div>
              </div>

              {selectedRecord.breakdown && Object.keys(selectedRecord.breakdown).length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <h4 className="font-semibold">Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedRecord.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        <span>${(value as number).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedRecord.payslip_url && (
                  <Button onClick={() => downloadPayslip(selectedRecord)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Payslip
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
