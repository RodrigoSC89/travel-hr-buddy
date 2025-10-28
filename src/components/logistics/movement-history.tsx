// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Package,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

interface Movement {
  id: string;
  item_name: string;
  movement_type: 'in' | 'out' | 'transfer';
  quantity: number;
  unit: string;
  from_location?: string;
  to_location?: string;
  vessel_name?: string;
  reference_number?: string;
  performed_by: string;
  timestamp: string;
  notes?: string;
}

export const MovementHistory = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVessel, setFilterVessel] = useState<string>('all');
  const [vessels, setVessels] = useState<string[]>([]);

  useEffect(() => {
    loadMovements();
    loadVessels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, dateRange, filterType, filterVessel]);

  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("logistics_movements")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error("Error loading movements:", error);
      toast.error("Failed to load movement history");
    } finally {
      setLoading(false);
    }
  };

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("logistics_movements")
        .select("vessel_name")
        .not("vessel_name", "is", null);

      if (error) throw error;
      
      const uniqueVessels = [...new Set(data?.map(m => m.vessel_name).filter(Boolean))];
      setVessels(uniqueVessels as string[]);
    } catch (error) {
      console.error("Error loading vessels:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= dateRange.from!);
    }
    if (dateRange.to) {
      filtered = filtered.filter(m => new Date(m.timestamp) <= dateRange.to!);
    }

    // Filter by movement type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.movement_type === filterType);
    }

    // Filter by vessel
    if (filterVessel !== 'all') {
      filtered = filtered.filter(m => m.vessel_name === filterVessel);
    }

    setFilteredMovements(filtered);
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredMovements.map(m => ({
        'Date': format(new Date(m.timestamp), 'yyyy-MM-dd HH:mm'),
        'Item': m.item_name,
        'Type': m.movement_type.toUpperCase(),
        'Quantity': m.quantity,
        'Unit': m.unit,
        'From': m.from_location || '-',
        'To': m.to_location || '-',
        'Vessel': m.vessel_name || '-',
        'Reference': m.reference_number || '-',
        'Performed By': m.performed_by,
        'Notes': m.notes || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Movements');
      
      const fileName = `logistics_movements_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Item', 'Type', 'Quantity', 'Unit', 'From', 'To', 'Vessel', 'Reference', 'Performed By', 'Notes'];
      const csvData = filteredMovements.map(m => [
        format(new Date(m.timestamp), 'yyyy-MM-dd HH:mm'),
        m.item_name,
        m.movement_type.toUpperCase(),
        m.quantity,
        m.unit,
        m.from_location || '-',
        m.to_location || '-',
        m.vessel_name || '-',
        m.reference_number || '-',
        m.performed_by,
        m.notes || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `logistics_movements_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'out': return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case 'transfer': return <Package className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getMovementBadgeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-500';
      case 'out': return 'bg-red-500';
      case 'transfer': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateStats = () => {
    const totalIn = filteredMovements
      .filter(m => m.movement_type === 'in')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalOut = filteredMovements
      .filter(m => m.movement_type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const transfers = filteredMovements.filter(m => m.movement_type === 'transfer').length;

    return { totalIn, totalOut, transfers };
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="text-center py-8">Loading movement history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
              Total In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIn}</div>
            <p className="text-xs text-muted-foreground">Items received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
              Total Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOut}</div>
            <p className="text-xs text-muted-foreground">Items dispatched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transfers}</div>
            <p className="text-xs text-muted-foreground">Inter-location</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              Total Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMovements.length}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>Track all inventory movements and generate reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date Range</Label>
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div>
              <Label>Movement Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Incoming</SelectItem>
                  <SelectItem value="out">Outgoing</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vessel</Label>
              <Select value={filterVessel} onValueChange={setFilterVessel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {vessels.map(vessel => (
                    <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Movements Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No movements found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {format(new Date(movement.timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{movement.item_name}</TableCell>
                      <TableCell>
                        <Badge className={`${getMovementBadgeColor(movement.movement_type)} text-white`}>
                          {getMovementIcon(movement.movement_type)}
                          <span className="ml-1">{movement.movement_type.toUpperCase()}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movement.quantity} {movement.unit}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.from_location || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.to_location || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.vessel_name || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.performed_by}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
