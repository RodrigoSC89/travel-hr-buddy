import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Home, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * Documentation Viewer Component
 * Displays technical documentation for modules
 */
export default function DocsViewer() {
  const { moduleName } = useParams<{ moduleName?: string }>();
  const [content, setContent] = useState<string>('');
  const [moduleList, setModuleList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModuleList();
  }, []);

  useEffect(() => {
    if (moduleName) {
      loadModuleDoc(moduleName);
    } else {
      loadIndexDoc();
    }
  }, [moduleName]);

  const loadModuleList = async () => {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll use a static list
      const modules = [
        'analytics',
        'compliance',
        'connectivity',
        'control',
        'crew',
        'document-hub',
        'drone-commander',
        'emergency',
        'features',
        'hr',
        'incident-reports',
        'intelligence',
        'logistics',
        'mission-control',
        'mission-engine',
        'navigation-copilot',
        'ocean-sonar',
        'operations',
        'satcom',
        'sensors-hub'
      ];
      setModuleList(modules);
    } catch (err) {
      console.error('Error loading module list:', err);
    }
  };

  const loadIndexDoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/dev/docs/INDEX.md');
      if (!response.ok) {
        throw new Error('Failed to load documentation index');
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
      setContent('# Documentation Not Available\n\nPlease run `npm run generate:docs` to generate documentation.');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleDoc = async (module: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/dev/docs/${module}.md`);
      if (!response.ok) {
        throw new Error(`Failed to load documentation for ${module}`);
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documentation');
      setContent(`# Documentation Not Available\n\nDocumentation for the **${module}** module is not available.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/docs">
                  <Button
                    variant={!moduleName ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                
                <div className="pt-4 pb-2">
                  <p className="text-sm font-semibold text-muted-foreground px-2">
                    Modules
                  </p>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {moduleList.map((module) => (
                      <Link key={module} to={`/docs/${module}`}>
                        <Button
                          variant={moduleName === module ? 'default' : 'ghost'}
                          className="w-full justify-start text-sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {module}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading documentation...</p>
                </div>
              ) : error ? (
                <div className="text-destructive p-4 border border-destructive rounded-md">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
