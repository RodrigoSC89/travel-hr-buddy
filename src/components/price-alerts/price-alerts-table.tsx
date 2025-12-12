import { useMemo, useState, useCallback } from "react";;
import React, { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowUpDown, 
  Filter, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { PriceAlert } from "@/services/price-alerts-service";
import { format } from "date-fns";

interface PriceAlertsTableProps {
  alerts: PriceAlert[];
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (alert: PriceAlert) => void;
  onDelete: (id: string) => void;
  onView: (alert: PriceAlert) => void;
}

type SortField = "product_name" | "target_price" | "current_price" | "created_at" | "travel_date";
type SortOrder = "asc" | "desc";

export const PriceAlertsTable: React.FC<PriceAlertsTableProps> = ({
  alerts,
  onToggle,
  onEdit,
  onDelete,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = alerts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.route?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((alert) =>
        filterStatus === "active" ? alert.is_active : !alert.is_active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: unknown = a[sortField];
      let bValue: unknown = b[sortField];

      if (sortField === "created_at" || sortField === "travel_date") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [alerts, searchTerm, filterStatus, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getPriceTrend = (alert: PriceAlert) => {
    if (!alert.current_price) return null;
    
    const diff = alert.current_price - alert.target_price;
    if (diff > 0) return "above";
    if (diff < 0) return "below";
    return "equal";
  };

  const renderPriceTrendIcon = (alert: PriceAlert) => {
    const trend = getPriceTrend(alert);
    
    if (trend === "above") {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    }
    if (trend === "below") {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by product name or route..."
            value={searchTerm}
            onChange={handleChange}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(value: unknown) => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handlehandleSort}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Product
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>Route</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handlehandleSort}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Target Price
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handlehandleSort}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Current Price
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>Trend</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handlehandleSort}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Travel Date
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handlehandleSort}
                  className="flex items-center gap-1 p-0 h-auto font-semibold"
                >
                  Created
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => onToggle(alert.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {alert.product_name}
                  </TableCell>
                  <TableCell>
                    {alert.route ? (
                      <Badge variant="outline">{alert.route}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${alert.target_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {alert.current_price ? (
                      <span className="font-medium">${alert.current_price.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderPriceTrendIcon(alert)}
                  </TableCell>
                  <TableCell>
                    {alert.travel_date ? (
                      format(new Date(alert.travel_date), "MMM dd, yyyy")
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(alert.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleonView}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleonEdit}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleonDelete}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedAlerts.length} of {alerts.length} alerts
      </div>
    </div>
  );
};
