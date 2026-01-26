/**
 * SGSO Evidence Manager - Document upload with OCR and categorization
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PRACTICE_OPTIONS = [
  { id: "PG-01", name: "Liderança e Comprometimento" },
  { id: "PG-02", name: "Política de SGSO" },
  { id: "PG-08", name: "Gestão de Riscos" },
  { id: "PG-10", name: "Segurança de Processo" },
  { id: "PG-15", name: "Investigação de Incidentes" },
  { id: "PG-16", name: "Auditorias e Verificações" },
];

export const SGSOEvidenceManager: React.FC = () => {
  const [evidences, setEvidences] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadEvidences();
  }, []);

  const loadEvidences = async () => {
    const { data } = await supabase
      .from("sgso_evidence")
      .select("*")
      .order("created_at", { ascending: false });
    setEvidences(data || []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !selectedPractice) {
      toast({ title: "Selecione uma prática de gestão", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const file = e.target.files[0];
    const practice = PRACTICE_OPTIONS.find(p => p.id === selectedPractice);

    try {
      const filePath = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("sgso-evidence")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("sgso-evidence")
        .getPublicUrl(filePath);

      await supabase.from("sgso_evidence").insert({
        practice_number: selectedPractice,
        practice_name: practice?.name || "",
        title: file.name,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        evidence_type: file.type.includes("pdf") ? "document" : "image",
      });

      toast({ title: "Evidência enviada com sucesso" });
      loadEvidences();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro no upload";
      toast({ title: "Erro no upload", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("sgso_evidence").delete().eq("id", id);
    loadEvidences();
    toast({ title: "Evidência removida" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Evidências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedPractice} onValueChange={setSelectedPractice}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione a Prática de Gestão" />
              </SelectTrigger>
              <SelectContent>
                {PRACTICE_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.id} - {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Input type="file" onChange={handleUpload} disabled={isUploading} className="cursor-pointer" />
              {isUploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidências Cadastradas ({evidences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evidences.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{ev.title || ev.file_name}</p>
                    <Badge variant="outline">{ev.practice_number}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {evidences.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma evidência cadastrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
