import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";

interface ReservationFiltersProps {
  filters: {
    type: string;
    status: string;
    dateRange: { from: string; to: string } | null;
    searchTerm: string;
    crewMember: string;
  };
  onFiltersChange: (filters: any) => void;
  reservations: EnhancedReservation[];
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  onFiltersChange,
  reservations,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      status: "all",
      dateRange: null,
      searchTerm: "",
      crewMember: "all",
    });
  };

  const uniqueCrewMembers = Array.from(
    new Set(reservations.map(r => r.crew_member_name).filter(Boolean))
  );

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.searchTerm ||
    filters.dateRange ||
    filters.crewMember !== "all";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou local..."
                value={filters.searchTerm}
                onChange={e => handleFilterChange("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filters.type} onValueChange={value => handleFilterChange("type", value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="transport">Transporte</SelectItem>
                <SelectItem value="embarkation">Embarque</SelectItem>
                <SelectItem value="flight">Voo</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>

            {/* Crew Member Filter */}
            <Select
              value={filters.crewMember}
              onValueChange={value => handleFilterChange("crewMember", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tripulante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tripulantes</SelectItem>
                {uniqueCrewMembers.map(member => (
                  <SelectItem key={member} value={member || ""}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateRange?.from || ""}
                onChange={e =>
                  handleFilterChange(
                    "dateRange",
                    e.target.value ? { ...filters.dateRange, from: e.target.value } : null
                  )
                }
                className="w-[130px]"
              />
              <Input
                type="date"
                value={filters.dateRange?.to || ""}
                onChange={e =>
                  handleFilterChange(
                    "dateRange",
                    filters.dateRange ? { ...filters.dateRange, to: e.target.value } : null
                  )
                }
                className="w-[130px]"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
