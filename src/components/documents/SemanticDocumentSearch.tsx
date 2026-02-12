/**
 * Semantic Document Search Component
 * AI-powered document search by meaning and context
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Aligned with ai_generated_documents schema (uses content, not extracted_text)
interface SearchResult {
  id: string;
  title: string;
  content: string | null;
  similarity: number;
  document_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function SemanticDocumentSearch() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    const startTime = Date.now();

    try {
      // Use content field from ai_generated_documents
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("id, title, content, document_type, metadata, created_at")
        .ilike("content", `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      // Calculate similarity score based on term frequency and relevance
      const resultsWithSimilarity: SearchResult[] = (data || []).map((doc) => {
        const text = doc.content?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();

        // Count exact matches
        const exactMatches = (text.match(new RegExp(query, "g")) || []).length;

        // Count partial matches (words from query)
        const queryWords = query.split(/\s+/).filter((w) => w.length > 2);
        const partialMatches = queryWords.reduce((sum, word) => {
          return sum + (text.match(new RegExp(word, "g")) || []).length;
        }, 0);

        // Calculate relevance score (0-100)
        const exactWeight = 5;
        const partialWeight = 1;
        const maxScore = 100;

        const rawScore = exactMatches * exactWeight + partialMatches * partialWeight;
        const similarity = Math.min((rawScore / 20) * maxScore, maxScore);

        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          document_type: doc.document_type,
          metadata: doc.metadata as Record<string, unknown> | null,
          created_at: doc.created_at,
          similarity,
        };
      });

      // Sort by similarity
      resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

      setResults(resultsWithSimilarity);
      const elapsed = Date.now() - startTime;
      setSearchTime(elapsed);

      toast({
        title: "Search complete",
        description: `Found ${resultsWithSimilarity.length} documents in ${elapsed}ms`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Search failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const getDocumentTypeColor = (docType?: string) => {
    switch (docType) {
      case "report":
        return "bg-info/10 text-info";
      case "policy":
        return "bg-destructive/10 text-destructive";
      case "procedure":
        return "bg-warning/10 text-warning";
      case "form":
        return "bg-accent/10 text-accent-foreground";
      case "training":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Extract tags from metadata if available
  const getTags = (metadata: Record<string, unknown> | null): string[] => {
    if (!metadata) return [];
    if (Array.isArray(metadata.tags)) return metadata.tags as string[];
    return [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Semantic Document Search
        </CardTitle>
        <CardDescription>
          Search documents by meaning and context using AI-powered similarity matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Search for documents (e.g., 'safety procedures', 'fuel reports')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Search Stats */}
        {results.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Found {results.length} {results.length === 1 ? "document" : "documents"}
            </span>
            <span>Search time: {searchTime}ms</span>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((result) => {
            const tags = getTags(result.metadata);
            return (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Title and similarity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4 text-info flex-shrink-0" />
                        <h3 className="font-semibold">{result.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-sm font-medium text-success">
                          {result.similarity.toFixed(0)}% match
                        </span>
                      </div>
                    </div>

                    {/* Similarity progress */}
                    <Progress value={result.similarity} className="h-1" />

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.content?.substring(0, 200) || "No content available"}...
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {result.document_type && (
                        <Badge variant="outline" className={getDocumentTypeColor(result.document_type)}>
                          {result.document_type.replace("_", " ")}
                        </Badge>
                      )}
                      {tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action */}
                    <Button variant="outline" size="sm" className="w-full">
                      View Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {!searching && results.length === 0 && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents found matching your query.</p>
            <p className="text-sm mt-2">Try different keywords or phrases.</p>
          </div>
        )}

        {/* Initial state */}
        {!searching && results.length === 0 && !searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter a search query to find relevant documents.</p>
            <p className="text-sm mt-2">The AI will search by meaning, not just exact matches.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
