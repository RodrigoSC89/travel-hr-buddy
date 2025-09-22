import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Clock, 
  Loader2,
  X
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  city: string;
  country: string;
  airport: string;
  code: string;
  type: 'city' | 'airport';
}

interface LiveSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  type?: 'flight' | 'hotel';
}

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', city: 'São Paulo', country: 'Brasil', airport: 'Aeroporto de Guarulhos', code: 'GRU', type: 'airport' },
  { id: '2', city: 'Rio de Janeiro', country: 'Brasil', airport: 'Aeroporto Santos Dumont', code: 'SDU', type: 'airport' },
  { id: '3', city: 'Rio de Janeiro', country: 'Brasil', airport: 'Aeroporto do Galeão', code: 'GIG', type: 'airport' },
  { id: '4', city: 'Brasília', country: 'Brasil', airport: 'Aeroporto de Brasília', code: 'BSB', type: 'airport' },
  { id: '5', city: 'Salvador', country: 'Brasil', airport: 'Aeroporto de Salvador', code: 'SSA', type: 'airport' },
  { id: '6', city: 'Fortaleza', country: 'Brasil', airport: 'Aeroporto de Fortaleza', code: 'FOR', type: 'airport' },
  { id: '7', city: 'Recife', country: 'Brasil', airport: 'Aeroporto do Recife', code: 'REC', type: 'airport' },
  { id: '8', city: 'Belo Horizonte', country: 'Brasil', airport: 'Aeroporto de Confins', code: 'CNF', type: 'airport' },
  { id: '9', city: 'Porto Alegre', country: 'Brasil', airport: 'Aeroporto Salgado Filho', code: 'POA', type: 'airport' },
  { id: '10', city: 'Curitiba', country: 'Brasil', airport: 'Aeroporto Afonso Pena', code: 'CWB', type: 'airport' },
  { id: '11', city: 'Miami', country: 'Estados Unidos', airport: 'Miami International Airport', code: 'MIA', type: 'airport' },
  { id: '12', city: 'Nova York', country: 'Estados Unidos', airport: 'John F. Kennedy Airport', code: 'JFK', type: 'airport' },
  { id: '13', city: 'Londres', country: 'Reino Unido', airport: 'Heathrow Airport', code: 'LHR', type: 'airport' },
  { id: '14', city: 'Paris', country: 'França', airport: 'Charles de Gaulle Airport', code: 'CDG', type: 'airport' },
  { id: '15', city: 'Lisboa', country: 'Portugal', airport: 'Aeroporto de Lisboa', code: 'LIS', type: 'airport' }
];

export const LiveSearch = ({ 
  placeholder, 
  value, 
  onChange, 
  onSelect,
  type = 'flight'
}: LiveSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches] = useState<SearchSuggestion[]>(
    mockSuggestions.slice(0, 3)
  );

  useEffect(() => {
    if (value.length > 2) {
      setIsLoading(true);
      
      // Simular busca com delay
      const timer = setTimeout(() => {
        const filtered = mockSuggestions.filter(suggestion =>
          suggestion.city.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.airport.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.code.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 8));
        setIsLoading(false);
        setIsOpen(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  }, [value]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    const displayValue = `${suggestion.city} (${suggestion.code})`;
    onChange(displayValue);
    setIsOpen(false);
    onSelect?.(suggestion);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length === 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
            onClick={handleClear}
          >
            <X size={16} />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" size={16} />
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <div className="p-2">
            {/* Recent Searches - shown when no input */}
            {value.length === 0 && (
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock size={14} />
                    Buscas Recentes
                  </p>
                </div>
                {recentSearches.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors"
                    onMouseDown={() => handleSelect(suggestion)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{suggestion.city}</p>
                        <p className="text-sm text-muted-foreground">{suggestion.airport}</p>
                      </div>
                      <Badge variant="outline">{suggestion.code}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {value.length > 2 && suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Search size={14} />
                    Resultados para "{value}"
                  </p>
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors"
                    onMouseDown={() => handleSelect(suggestion)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{suggestion.city}, {suggestion.country}</p>
                        <p className="text-sm text-muted-foreground">{suggestion.airport}</p>
                      </div>
                      <Badge variant="outline">{suggestion.code}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {value.length > 2 && suggestions.length === 0 && !isLoading && (
              <div className="p-6 text-center">
                <Search className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};