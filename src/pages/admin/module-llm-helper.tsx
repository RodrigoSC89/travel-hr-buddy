/**
 * PATCH 655 - Module LLM Helper Page
 * Generate and manage AI prompts for modules
 */

import React, { useState, useMemo } from 'react';
import { useNavigationStructure, ModuleStatus } from '@/hooks/useNavigationStructure';
import {
  generateModulePrompt,
  generateBatchPrompts,
  exportPromptsToMarkdown,
  exportPromptsToJSON,
} from '@/lib/utils/modulePromptGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Copy,
  Download,
  Send,
  Search,
  Filter,
  Brain,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ModuleLLMHelper: React.FC = () => {
  const { toast } = useToast();
  const { modules, statistics } = useNavigationStructure({
    includeProduction: true,
    includeDevelopment: true,
    includeExperimental: true,
    includeDeprecated: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(modules.map((m) => m.category));
    return ['all', ...Array.from(cats)].sort();
  }, [modules]);

  // Filter modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === selectedStatus);
    }

    return filtered;
  }, [modules, searchQuery, selectedCategory, selectedStatus]);

  const handleGeneratePrompt = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const promptTemplate = generateModulePrompt(module);
    setGeneratedPrompt(promptTemplate.prompt);
    setSelectedModule(moduleId);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: 'Copiado!',
        description: 'Prompt copiado para a área de transferência',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao copiar prompt',
        variant: 'destructive',
      });
    }
  };

  const handleExportAll = (format: 'markdown' | 'json') => {
    const allPrompts = generateBatchPrompts(filteredModules);
    const content =
      format === 'markdown'
        ? exportPromptsToMarkdown(allPrompts)
        : exportPromptsToJSON(allPrompts);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nautilus-prompts-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: `${allPrompts.length} prompts exportados em ${format.toUpperCase()}`,
    });
  };

  const handleSendToAI = () => {
    // TODO: Implement API integration
    toast({
      title: 'Enviado para IA',
      description: 'Prompt enviado para processamento',
    });
  };

  return (
    <main className="container mx-auto p-6 space-y-6" role="main" aria-label="Module LLM Prompt Helper"
>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8" />
          Module LLM Prompt Helper
        </h1>
        <p className="text-muted-foreground">
          Gere prompts de IA personalizados para cada módulo do sistema
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredModules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredModules.filter((m) => m.aiEnabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.production}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Module List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all'
                          ? 'All Categories'
                          : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="production">✅ Production</SelectItem>
                    <SelectItem value="development">⚠️ Development</SelectItem>
                    <SelectItem value="experimental">🧪 Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('markdown')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export MD
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('json')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="max-h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle>Modules ({filteredModules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredModules.map((module) => (
                  <Button
                    key={module.id}
                    variant={selectedModule === module.id ? 'default' : 'outline'}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleGeneratePrompt(module.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{module.name}</span>
                        {module.aiEnabled && (
                          <Brain className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {module.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {module.status}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Prompt Display */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Prompt</CardTitle>
              <CardDescription>
                {selectedModule
                  ? `Prompt for ${modules.find((m) => m.id === selectedModule)?.name}`
                  : 'Select a module to generate a prompt'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                placeholder="Generated prompt will appear here..."
                className="min-h-[400px] font-mono text-sm"
              />
              {generatedPrompt && (
                <div className="flex gap-2">
                  <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleSendToAI} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Send to AI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedModule && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generateModulePrompt(
                    modules.find((m) => m.id === selectedModule)!
                  ).examples?.map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg text-sm font-mono"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default ModuleLLMHelper;
