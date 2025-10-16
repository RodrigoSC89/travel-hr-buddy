import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BiFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  startDate: string;
  endDate: string;
  vesselId: string;
  standard: string;
}

interface Vessel {
  id: string;
  name: string;
}

export default function BiFilters({ onFilterChange }: BiFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    startDate: "",
    endDate: "",
    vesselId: "all",
    standard: "all",
  });
  const [vessels, setVessels] = useState<Vessel[]>([]);

  useEffect(() => {
    async function fetchVessels() {
      try {
        const { data, error } = await supabase
          .from("vessels")
          .select("id, name")
          .order("name");

        if (error) {
          console.error("Error fetching vessels:", error);
        } else if (data) {
          setVessels(data);
        }
      } catch (error) {
        console.error("Error loading vessels:", error);
      }
    }

    fetchVessels();
  }, []);

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterValues = {
      startDate: "",
      endDate: "",
      vesselId: "all",
      standard: "all",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros Interativos
        </CardTitle>
        <CardDescription>
          Filtre os dados por período, embarcação e norma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vessel">Embarcação</Label>
            <Select value={filters.vesselId} onValueChange={(value) => setFilters({ ...filters, vesselId: value })}>
              <SelectTrigger id="vessel">
                <SelectValue placeholder="Todas as embarcações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as embarcações</SelectItem>
                {vessels.map((vessel) => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="standard">Norma</Label>
            <Select value={filters.standard} onValueChange={(value) => setFilters({ ...filters, standard: value })}>
              <SelectTrigger id="standard">
                <SelectValue placeholder="Todas as normas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as normas</SelectItem>
                <SelectItem value="IMCA">IMCA</SelectItem>
                <SelectItem value="ISO">ISO</SelectItem>
                <SelectItem value="NORMAM">NORMAM</SelectItem>
                <SelectItem value="SOLAS">SOLAS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApplyFilters} className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button onClick={handleResetFilters} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
