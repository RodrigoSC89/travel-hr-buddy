/**
 * Documentation Hub - Central de Documentação
 * Nauti One v4.0
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Search, Star, Eye, ThumbsUp, FileText,
  Code, HelpCircle, Lightbulb, ChevronRight, ExternalLink
} from "lucide-react";

// Import documentation module
import { 
  documentationHub, 
  type DocArticle, 
  type DocCategory 
} from "@/lib/documentation/documentation-hub";

const DocumentationHub = () => {
  const [activeTab, setActiveTab] = useState<DocCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  
  const sections = documentationHub.getSections();
  const searchResults = searchQuery ? documentationHub.search(searchQuery) : [];
  
  const getCategoryIcon = (category: DocCategory) => {
    switch (category) {
      case 'getting_started': return <Lightbulb className="h-5 w-5" />;
      case 'user_guide': return <BookOpen className="h-5 w-5" />;
      case 'admin_guide': return <FileText className="h-5 w-5" />;
      case 'developer_guide': return <Code className="h-5 w-5" />;
      case 'api_reference': return <Code className="h-5 w-5" />;
      case 'troubleshooting': return <HelpCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredArticles = activeTab === 'all' 
    ? sections.flatMap(s => s.articles) 
    : sections.find(s => s.articles[0]?.category === activeTab)?.articles || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Documentation Hub
          </h1>
          <p className="text-muted-foreground">Central de Documentação & Knowledge Base</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar na documentação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} resultados encontrados
              </p>
              {searchResults.slice(0, 5).map((result) => (
                <div 
                  key={result.article.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(result.article.category)}
                      <div>
                        <p className="font-medium">{result.article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.highlights[0]?.snippet}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{(result.score * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Guias de início rápido e configuração inicial
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              API Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documentação completa da API REST
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              User Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manual do usuário completo
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-orange-500" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Soluções para problemas comuns
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocCategory | 'all')}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">📚 Todos</TabsTrigger>
          <TabsTrigger value="getting_started">🚀 Getting Started</TabsTrigger>
          <TabsTrigger value="user_guide">📖 User Guide</TabsTrigger>
          <TabsTrigger value="api_reference">💻 API</TabsTrigger>
          <TabsTrigger value="troubleshooting">❓ Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.slice(0, 12).map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {getCategoryIcon(article.category)}
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.content.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.helpful_votes}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost">
                      Ler <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Seções da Documentação</CardTitle>
          <CardDescription>
            {sections.length} seções com {sections.reduce((sum, s) => sum + s.articles.length, 0)} artigos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <div 
                key={section.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {section.articles.length} artigos
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationHub;
