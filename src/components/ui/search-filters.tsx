import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Filter,
  X,
  Star,
  Plane,
  Clock,
  DollarSign
} from 'lucide-react';

interface FilterOptions {
  priceRange: [number, number];
  airlines: string[];
  rating: number;
  stops: 'any' | 'direct' | '1stop';
  departureTime: 'any' | 'morning' | 'afternoon' | 'evening';
  duration: number;
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  availableAirlines: string[];
  maxPrice: number;
}

export const SearchFilters = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  availableAirlines,
  maxPrice 
}: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, maxPrice],
    airlines: [],
    rating: 0,
    stops: 'any',
    departureTime: 'any',
    duration: 24
  });

  const handleAirlineToggle = (airline: string) => {
    setFilters(prev => ({
      ...prev,
      airlines: prev.airlines.includes(airline)
        ? prev.airlines.filter(a => a !== airline)
        : [...prev.airlines, airline]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      priceRange: [0, maxPrice],
      airlines: [],
      rating: 0,
      stops: 'any',
      departureTime: 'any',
      duration: 24
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Filter size={20} />
              Filtros Avançados
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Faixa de Preço</Label>
            <div className="px-3">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={maxPrice}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>R$ {filters.priceRange[0]}</span>
              <span>R$ {filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Airlines */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Companhias Aéreas</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableAirlines.map((airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <Checkbox
                    id={airline}
                    checked={filters.airlines.includes(airline)}
                    onCheckedChange={() => handleAirlineToggle(airline)}
                  />
                  <Label htmlFor={airline} className="text-sm cursor-pointer">
                    {airline}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Avaliação Mínima</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.rating >= rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                  className="p-2"
                >
                  <Star size={16} fill={filters.rating >= rating ? "currentColor" : "none"} />
                </Button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {filters.rating > 0 ? `${filters.rating}+ estrelas` : 'Qualquer avaliação'}
              </span>
            </div>
          </div>

          {/* Stops */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Conexões</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'any', label: 'Qualquer' },
                { value: 'direct', label: 'Voo Direto' },
                { value: '1stop', label: 'Até 1 Conexão' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.stops === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, stops: option.value as any }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Horário de Partida</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'any', label: 'Qualquer Horário' },
                { value: 'morning', label: 'Manhã (06:00-12:00)' },
                { value: 'afternoon', label: 'Tarde (12:00-18:00)' },
                { value: 'evening', label: 'Noite (18:00-24:00)' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.departureTime === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, departureTime: option.value as any }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClear}>
              Limpar Filtros
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleApply} className="gradient-ocean">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};