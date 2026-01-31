/**
 * City Search with Autocomplete - Windy Style
 * PATCH WINDY-1.0
 */

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Heart, History, Loader2, Navigation, X } from "lucide-react";
import type { WeatherLocation } from "./types";
import { logger } from '@/lib/logger';

interface CitySearchProps {
  onSelectLocation: (location: WeatherLocation) => void;
  favorites?: WeatherLocation[];
  recentSearches?: WeatherLocation[];
  onToggleFavorite?: (location: WeatherLocation) => void;
  className?: string;
}

// Brazilian cities for suggestions
const POPULAR_CITIES: WeatherLocation[] = [
  { id: "santos", name: "Santos, SP", lat: -23.9608, lon: -46.3335 },
  { id: "rio", name: "Rio de Janeiro, RJ", lat: -22.9068, lon: -43.1729 },
  { id: "sp", name: "São Paulo, SP", lat: -23.5505, lon: -46.6333 },
  { id: "macae", name: "Macaé, RJ", lat: -22.3708, lon: -41.7869 },
  { id: "vitoria", name: "Vitória, ES", lat: -20.3155, lon: -40.3128 },
  { id: "salvador", name: "Salvador, BA", lat: -12.9714, lon: -38.5014 },
  { id: "recife", name: "Recife, PE", lat: -8.0476, lon: -34.8770 },
  { id: "fortaleza", name: "Fortaleza, CE", lat: -3.7319, lon: -38.5267 },
  { id: "floripa", name: "Florianópolis, SC", lat: -27.5954, lon: -48.5480 },
  { id: "porto", name: "Porto Alegre, RS", lat: -30.0346, lon: -51.2177 },
  { id: "manaus", name: "Manaus, AM", lat: -3.1190, lon: -60.0217 },
  { id: "belem", name: "Belém, PA", lat: -1.4558, lon: -48.4902 },
];

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectLocation,
  favorites = [],
  recentSearches = [],
  onToggleFavorite,
  className
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<WeatherLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter cities based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Get user's geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: WeatherLocation = {
          id: 'current',
          name: 'Minha Localização',
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        onSelectLocation(location);
        setIsLocating(false);
        setIsOpen(false);
      },
      (error) => {
        logger.error('Geolocation error:', error);
        setIsLocating(false);
      }
    );
  };

  const handleSelect = (location: WeatherLocation) => {
    onSelectLocation(location);
    setQuery("");
    setIsOpen(false);
  };

  const isFavorite = (location: WeatherLocation) => 
    favorites.some(f => f.id === location.id);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar cidade..."
            className="pl-10 bg-slate-800/80 border-white/20 text-white placeholder:text-white/40"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-white/50 hover:text-white"
              onClick={() => setQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Geolocation Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleGeolocation}
          disabled={isLocating}
          className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden z-50 shadow-xl">
          <ScrollArea className="max-h-[400px]">
            {/* Favorites Section */}
            {favorites.length > 0 && !query && (
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2 text-xs text-white/50">
                  <Heart className="h-3 w-3" />
                  <span>Favoritos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorites.slice(0, 5).map(fav => (
                    <Badge
                      key={fav.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-white/10 text-white border-red-400/50"
                      onClick={() => handleSelect(fav)}
                    >
                      <Heart className="h-3 w-3 mr-1 fill-red-400 text-red-400" />
                      {fav.name.split(',')[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2 text-xs text-white/50">
                  <History className="h-3 w-3" />
                  <span>Buscas recentes</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelect(loc)}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-white/10 text-left"
                    >
                      <MapPin className="h-4 w-4 text-white/50" />
                      <span className="text-white text-sm">{loc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results or Popular Cities */}
            <div className="p-3">
              {query ? (
                <>
                  <div className="flex items-center gap-2 mb-2 text-xs text-white/50">
                    <Search className="h-3 w-3" />
                    <span>Resultados</span>
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map(city => (
                        <button
                          key={city.id}
                          onClick={() => handleSelect(city)}
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-white/50" />
                            <span className="text-white text-sm">{city.name}</span>
                          </div>
                          {onToggleFavorite && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(city);
                              }}
                            >
                              <Heart className={cn(
                                "h-3 w-3",
                                isFavorite(city) ? "fill-red-400 text-red-400" : "text-white/50"
                              )} />
                            </Button>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-sm text-center py-4">
                      Nenhuma cidade encontrada
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2 text-xs text-white/50">
                    <MapPin className="h-3 w-3" />
                    <span>Cidades populares</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {POPULAR_CITIES.slice(0, 8).map(city => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className="flex items-center gap-2 p-2 rounded hover:bg-white/10 text-left"
                      >
                        <MapPin className="h-3 w-3 text-white/50" />
                        <span className="text-white text-sm truncate">{city.name.split(',')[0]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Close trigger */}
          <div 
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CitySearch;
