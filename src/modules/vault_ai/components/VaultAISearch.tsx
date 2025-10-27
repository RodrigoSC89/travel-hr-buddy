// PATCH 283: Vault AI Search Component with Vector Search
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, FileText, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  document_type?: string;
  category?: string;
  similarity: number;
  chunk_content?: string;
  chunk_index?: number;
}

interface VaultSearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  llm_response?: string;
  search_duration_ms: number;
  results_count: number;
  search_type: string;
}

export const VaultAISearch: React.FC = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [useLLM, setUseLLM] = useState(false);
  const [searchChunks, setSearchChunks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<VaultSearchResponse | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vault-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            match_threshold: 0.7,
            match_count: 10,
            use_llm: useLLM,
            search_chunks: searchChunks,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
      }

      const data: VaultSearchResponse = await response.json();
      setSearchResponse(data);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.results_count} results in ${data.search_duration_ms.toFixed(0)}ms`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search vault",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return "bg-green-600";
    if (similarity >= 0.8) return "bg-green-500";
    if (similarity >= 0.7) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Vault AI Search</h1>
          <p className="text-sm text-muted-foreground">Semantic document search powered by vector embeddings</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Documents
          </CardTitle>
          <CardDescription>Use natural language to find relevant documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Search Query</Label>
            <Input
              id="query"
              placeholder="e.g., safety procedures for emergency situations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-llm"
                checked={useLLM}
                onCheckedChange={setUseLLM}
              />
              <Label htmlFor="use-llm" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate AI Response
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="search-chunks"
                checked={searchChunks}
                onCheckedChange={setSearchChunks}
              />
              <Label htmlFor="search-chunks" className="cursor-pointer">
                Search Document Chunks
              </Label>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Searching..." : "Search Vault"}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResponse && (
        <div className="space-y-4">
          {/* Search Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Search completed in <strong>{searchResponse.search_duration_ms.toFixed(0)}ms</strong>
                  </span>
                </div>
                <Badge variant="secondary">
                  {searchResponse.results_count} results ({searchResponse.search_type})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* LLM Response */}
          {searchResponse.llm_response && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="h-5 w-5" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">
                  {searchResponse.llm_response}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          <div className="space-y-3">
            {searchResponse.results.map((result, idx) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <CardTitle className="text-lg">
                          {result.title || `Document ${result.id.substring(0, 8)}`}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.document_type && (
                          <Badge variant="outline" className="capitalize">
                            {result.document_type}
                          </Badge>
                        )}
                        {result.category && (
                          <Badge variant="secondary" className="capitalize">
                            {result.category}
                          </Badge>
                        )}
                        {result.chunk_index !== undefined && (
                          <Badge variant="outline">
                            Chunk {result.chunk_index + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`${getSimilarityColor(result.similarity)} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                      >
                        {(result.similarity * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Similarity</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {result.chunk_content || result.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchResponse.results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No results found for your query</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default VaultAISearch;
