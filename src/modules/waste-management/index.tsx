import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Recycle, LayoutDashboard, Droplets, Trash2, FileText, Brain } from "lucide-react";
import { Suspense, lazy } from "react";

// Lazy load dashboard to avoid hook issues
const WasteDashboard = lazy(() => import("./components/WasteDashboard"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const WasteManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-teal-500/10 via-green-500/10 to-emerald-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-green-600 text-white">
              <Recycle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Gestão de Resíduos
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  MARPOL
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Conformidade ambiental MARPOL, Oil Record Book e Garbage Record Book
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tanks" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Tanques</span>
            </TabsTrigger>
            <TabsTrigger value="garbage" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Resíduos</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Record Books</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={<LoadingFallback />}>
              <WasteDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="tanks">
            <div className="text-center py-12 text-muted-foreground">
              Gestão detalhada de tanques - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="garbage">
            <div className="text-center py-12 text-muted-foreground">
              Controle de resíduos sólidos - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="records">
            <div className="text-center py-12 text-muted-foreground">
              Oil Record Book e Garbage Record Book - Em desenvolvimento
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              Relatórios MARPOL e certificados - Em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WasteManagement;
