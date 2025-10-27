import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, FileText, Tag, Filter } from 'lucide-react';
import { vectorSearch, VectorSearchResult } from '../services/vectorSearch';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export function VaultVectorSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VectorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        vectorSearch.getCategories(),
        vectorSearch.getTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await vectorSearch.searchDocuments(query, {
        matchThreshold: 0.7,
        matchCount: 10,
        documentType: documentType || undefined,
        category: selectedCategory || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      setResults(searchResults);
      
      // Log the search
      await vectorSearch.logSearch(query, searchResults.length);

      if (searchResults.length === 0) {
        toast({
          title: 'No results',
          description: 'No documents found matching your query',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to search documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-500';
    if (similarity >= 0.8) return 'bg-blue-500';
    if (similarity >= 0.7) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity >= 0.9) return 'Excellent Match';
    if (similarity >= 0.8) return 'Good Match';
    if (similarity >= 0.7) return 'Fair Match';
    return 'Weak Match';
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Document Search</CardTitle>
          <CardDescription>
            Search documents using AI-powered semantic matching with similarity scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for documents, concepts, or topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="specification">Specification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDocumentType('');
                    setSelectedCategory('');
                    setSelectedTags([]);
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Filter by Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
            </h3>
          </div>

          {results.map((result, index) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Similarity Score */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress 
                        value={result.similarity * 100} 
                        className="h-2"
                      />
                    </div>
                    <Badge className={getSimilarityColor(result.similarity)}>
                      {(result.similarity * 100).toFixed(0)}% - {getSimilarityText(result.similarity)}
                    </Badge>
                  </div>

                  {/* Document Info */}
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{result.title}</h4>
                        <Badge variant="outline">{result.document_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.content}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {result.category && (
                          <Badge variant="secondary">{result.category}</Badge>
                        )}
                        {result.tags?.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {result.file_url && (
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => window.open(result.file_url, '_blank')}
                          >
                            View Document
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
