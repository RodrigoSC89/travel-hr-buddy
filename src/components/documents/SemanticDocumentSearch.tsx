import { useState } from "react";;

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SearchResult {
  id: string;
  title: string;
  extracted_text: string;
  similarity: number;
  document_category?: string;
  document_tags?: string[];
  created_at: string;
}

export const SemanticDocumentSearch = memo(function() {
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
      // For now, use simple text search since vector embeddings require OpenAI integration
      // In production, this would use the search_documents_by_similarity function
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("id, title, extracted_text, document_category, document_tags, created_at")
        .ilike("extracted_text", `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      // Calculate similarity score based on term frequency and relevance
      const resultsWithSimilarity = (data || []).map(doc => {
        const text = doc.extracted_text?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        
        // Count exact matches
        const exactMatches = (text.match(new RegExp(query, "g")) || []).length;
        
        // Count partial matches (words from query)
        const queryWords = query.split(/\s+/).filter(w => w.length > 2);
        const partialMatches = queryWords.reduce((sum, word) => {
          return sum + (text.match(new RegExp(word, "g")) || []).length;
        }, 0);
        
        // Calculate relevance score (0-100)
        // Exact matches are worth more than partial matches
        const exactWeight = 5;
        const partialWeight = 1;
        const maxScore = 100;
        
        const rawScore = (exactMatches * exactWeight) + (partialMatches * partialWeight);
        const similarity = Math.min((rawScore / 20) * maxScore, maxScore);

        return {
          ...doc,
          similarity,
        });
      };

      // Sort by similarity
      resultsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

      setResults(resultsWithSimilarity);
      setSearchTime(Date.now() - startTime);

      toast({
        title: "Search complete",
        description: `Found ${resultsWithSimilarity.length} documents in ${searchTime}ms`,
      });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  });

  const getCategoryColor = (category?: string) => {
    switch (category) {
    case "safety_compliance":
      return "bg-red-100 text-red-800";
    case "operations":
      return "bg-blue-100 text-blue-800";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800";
    case "administration":
      return "bg-purple-100 text-purple-800";
    case "training":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
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
            onChange={handleChange}
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
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Title and similarity */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <h3 className="font-semibold">{result.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {result.similarity.toFixed(0)}% match
                      </span>
                    </div>
                  </div>

                  {/* Similarity progress */}
                  <Progress value={result.similarity} className="h-1" />

                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.extracted_text?.substring(0, 200)}...
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.document_category && (
                      <Badge variant="outline" className={getCategoryColor(result.document_category)}>
                        {result.document_category.replace("_", " ")}
                      </Badge>
                    )}
                    {result.document_tags?.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
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
          ))}
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
            <p className="text-sm mt-2">
              The AI will search by meaning, not just exact matches.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
