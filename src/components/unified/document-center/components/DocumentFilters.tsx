/**
import { useState, useCallback } from "react";;
 * Document Filters Component
 * 
 * Provides filtering interface for documents
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDocumentCenter } from "../hooks";
import type { DocumentType, DocumentStatus } from "../types";

interface DocumentFiltersProps {
  className?: string;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({ className }) => {
  const { filter, setFilter, clearFilter, config } = useDocumentCenter();

  const [localSearchTerm, setLocalSearchTerm] = React.useState(filter.searchTerm || "");

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    setFilter({ searchTerm: value });
  };

  const handleTypeFilter = (types: DocumentType[]) => {
    setFilter({ types });
  };

  const handleStatusFilter = (statuses: DocumentStatus[]) => {
    setFilter({ statuses });
  };

  const handleCategoryFilter = (categories: string[]) => {
    setFilter({ categories });
  };

  const activeFiltersCount = (
    (filter.types?.length || 0) +
    (filter.statuses?.length || 0) +
    (filter.categories?.length || 0) +
    (filter.searchTerm ? 1 : 0)
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={localSearchTerm}
            onChange={handleChange}
            className="pl-9 pr-9"
          />
          {localSearchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handlehandleSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilter}
                    className="h-auto p-0 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Type Filter */}
              {config.availableTypes && config.availableTypes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Document Type</Label>
                  <Select
                    value={filter.types?.[0] || "all"}
                    onValueChange={(value) =>
                      value === "all" ? handleTypeFilter([]) : handleTypeFilter([value as DocumentType])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {config.availableTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {config.availableStatuses && config.availableStatuses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={filter.statuses?.[0] || "all"}
                    onValueChange={(value) =>
                      value === "all" ? handleStatusFilter([]) : handleStatusFilter([value as DocumentStatus])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {config.availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              {config.availableCategories && config.availableCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={filter.categories?.[0] || "all"}
                    onValueChange={(value) =>
                      value === "all" ? handleCategoryFilter([]) : handleCategoryFilter([value])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {config.availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filter.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {filter.searchTerm}
              <button onClick={() => handlehandleSearch} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filter.types?.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              Type: {type}
              <button onClick={() => handlehandleTypeFilter} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filter.statuses?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {status}
              <button onClick={() => handlehandleStatusFilter} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filter.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              Category: {category}
              <button onClick={() => handlehandleCategoryFilter} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});
