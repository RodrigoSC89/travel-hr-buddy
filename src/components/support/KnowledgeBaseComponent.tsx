/**
 * Knowledge Base Component - PROMPT 10
 * Interface de base de conhecimento para suporte
 * PATCH: XSS Protection - Added createSafeHTML
 */

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ThumbsUp, ThumbsDown, ArrowLeft, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createSafeHTML } from "@/lib/utils/safe-html";
import { 
  knowledgeBase, 
  KB_CATEGORIES, 
  type KBArticle, 
  type KBCategory 
} from '@/lib/support/knowledge-base';

export function KnowledgeBaseComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Partial<KBArticle>[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Partial<KBArticle> | null>(null);
  const [searchResults, setSearchResults] = useState<Partial<KBArticle>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadArticlesByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const loadCategories = async () => {
    const cats = await knowledgeBase.getCategories();
    setCategories(cats);
  };

  const loadArticlesByCategory = async (categoryId: string) => {
    const arts = await knowledgeBase.getArticlesByCategory(categoryId);
    setArticles(arts);
  };

  const performSearch = async () => {
    setIsSearching(true);
    const results = await knowledgeBase.search(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleFeedback = async (articleId: string, helpful: boolean) => {
    await knowledgeBase.recordFeedback(articleId, helpful);
    toast({
      title: helpful ? 'Thank you!' : 'We\'ll improve this',
      description: helpful 
        ? 'Glad this article was helpful!' 
        : 'Thanks for your feedback. We\'ll work on improving this article.',
    });
  };

  const renderContent = () => {
    // Se está pesquisando
    if (searchQuery.length >= 2) {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Search Results</h3>
          {isSearching ? (
            <p className="text-muted-foreground">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {KB_CATEGORIES.find(c => c.id === article.category)?.name}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Se um artigo está selecionado
    if (selectedArticle) {
      return (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => setSelectedArticle(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <h1>{selectedArticle.title}</h1>
            
            <div className="flex gap-2 mb-4">
              {selectedArticle.tags?.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            
            {/* XSS Protected content rendering */}
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={createSafeHTML(selectedArticle.content || '')}
            />
          </article>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Was this article helpful?</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFeedback(selectedArticle.id!, true)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Yes
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFeedback(selectedArticle.id!, false)}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                No
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Se uma categoria está selecionada
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      return (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => {
              setSelectedCategory(null);
              setArticles([]);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Button>
          
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>{category?.icon}</span>
              {category?.name}
            </h3>
            <p className="text-sm text-muted-foreground">{category?.description}</p>
          </div>
          
          <div className="space-y-2">
            {articles.map(article => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedArticle(article)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{article.title}</h4>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {articles.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No articles in this category yet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // Vista padrão: categorias
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Browse by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(category => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <Badge variant="outline" className="mt-2">
                      {category.article_count} articles
                    </Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Help Center</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {renderContent()}
      </ScrollArea>
    </div>
  );
}

export default KnowledgeBaseComponent;
