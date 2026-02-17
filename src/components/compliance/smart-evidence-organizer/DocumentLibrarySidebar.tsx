/**
 * Document Library Sidebar v2 - Browse & link documents with category filter
 */
import React, { useState, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Library, Plus, Filter } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents-crud";
import { cn } from "@/lib/utils";

interface Props {
  onLinkDocument: (itemId: string, documentTitle: string, documentPath?: string) => void;
  activeItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
}

const CATEGORIES = [
  { value: "all", label: "Todas" },
  { value: "certificate", label: "Certificados" },
  { value: "procedure", label: "Procedimentos" },
  { value: "manual", label: "Manuais" },
  { value: "report", label: "Relatórios" },
  { value: "training", label: "Treinamentos" },
  { value: "inspection", label: "Inspeções" },
  { value: "contract", label: "Contratos" },
];

export const DocumentLibrarySidebar = memo(({ onLinkDocument, activeItemId, onSelectItem }: Props) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: documents = [], isLoading } = useDocuments({ search: search || undefined, limit: 50 });

  const filteredDocs = useMemo(() => {
    if (category === "all") return documents;
    return documents.filter(doc =>
      (doc.category || "").toLowerCase().includes(category.toLowerCase()) ||
      (doc.file_type || "").toLowerCase().includes(category.toLowerCase())
    );
  }, [documents, category]);

  const handleLinkClick = useCallback((doc: any) => {
    if (!activeItemId) return;
    onLinkDocument(activeItemId, doc.file_name || doc.title, doc.storage_path);
    onSelectItem(null);
  }, [activeItemId, onLinkDocument, onSelectItem]);

  return (
    <Card className="h-full border-l-2 border-l-primary/20">
      <CardHeader className="py-3 px-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Library className="h-4 w-4 text-primary" />
          Biblioteca de Documentos
          <Badge variant="outline" className="text-[10px] ml-auto">{filteredDocs.length}</Badge>
        </CardTitle>
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar documento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-7 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {activeItemId ? (
          <p className="text-xs text-primary bg-primary/5 p-2 rounded mb-2">
            ✅ Clique em um documento para vincular como evidência
          </p>
        ) : (
          <p className="text-xs text-muted-foreground p-2 mb-2">
            Selecione "Vincular" em um item para conectar um documento
          </p>
        )}
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-1 pr-1">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleLinkClick(doc)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md text-xs transition-colors",
                  activeItemId
                    ? "cursor-pointer hover:bg-primary/10 border border-transparent hover:border-primary/30"
                    : "opacity-70",
                )}
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{doc.file_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {doc.category || doc.file_type} • {doc.ocr_status}
                  </p>
                </div>
                {activeItemId && (
                  <Plus className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
            ))}
            {filteredDocs.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground text-center py-6">
                {search || category !== "all" ? "Nenhum documento encontrado" : "Biblioteca vazia"}
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

DocumentLibrarySidebar.displayName = "DocumentLibrarySidebar";
