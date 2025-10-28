import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { searchDocuments } from "../services/vectorSearch";
import { Search, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  document_type?: string;
  category?: string;
  tags?: string[];
  similarity: number;
  created_at: string;
}

export function VaultVectorSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    matchThreshold: 0.7,
    documentType: "",
    category: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
      logger.info("Executing vector search", { query, filters });

      const searchResults = await searchDocuments(query, {
        matchThreshold: filters.matchThreshold,
        documentType: filters.documentType || undefined,
        category: filters.category || undefined,
        limit: 10,
      });

      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast.info("No results found. Try adjusting your search or filters.");
      } else {
        toast.success(`Found ${searchResults.length} results`);
      }
    } catch (error) {
      logger.error("Search failed", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return "bg-green-500";
    if (similarity >= 0.8) return "bg-blue-500";
    if (similarity >= 0.7) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vault AI - Semantic Search</h1>
        <p className="text-muted-foreground">
          AI-powered document search with semantic understanding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
          <CardDescription>
            Use natural language to find relevant documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="query">Search Query</Label>
              <div className="flex gap-2">
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., safety procedures for offshore operations"
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="threshold">Match Threshold</Label>
                <Select
                  value={filters.matchThreshold.toString()}
                  onValueChange={(value) =>
                    setFilters({ ...filters, matchThreshold: parseFloat(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.6">0.6 (More results)</SelectItem>
                    <SelectItem value="0.7">0.7 (Balanced)</SelectItem>
                    <SelectItem value="0.8">0.8 (More precise)</SelectItem>
                    <SelectItem value="0.9">0.9 (Most precise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={filters.documentType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, documentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Search Results ({results.length})
          </h2>
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {result.content.substring(0, 200)}
                        {result.content.length > 200 && "..."}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getSimilarityColor(result.similarity)} text-white`}
                    >
                      {Math.round(result.similarity * 100)}% match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {result.document_type && (
                    <Badge variant="outline">
                      Type: {result.document_type}
                    </Badge>
                  )}
                  {result.category && (
                    <Badge variant="outline">
                      Category: {result.category}
                    </Badge>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <>
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </>
                  )}
                  <span className="ml-auto">
                    {new Date(result.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No results found. Try adjusting your search query or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VaultVectorSearch;
