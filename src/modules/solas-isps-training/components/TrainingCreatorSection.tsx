import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles, BookOpen, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TrainingCreatorSection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({ topic: "", normReference: "", category: "", duration: "" });
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerate = async () => {
    if (!formData.topic) { toast.error("Informe o tópico do treinamento"); return; }
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`## Treinamento: ${formData.topic}\n\n### Objetivos\n- Compreender os requisitos de ${formData.normReference || "SOLAS"}\n- Aplicar procedimentos corretos\n- Identificar não-conformidades\n\n### Conteúdo\n1. Introdução aos requisitos\n2. Procedimentos operacionais\n3. Casos práticos\n4. Avaliação\n\n### Quiz\n1. Qual a frequência obrigatória?\n2. Quem é o responsável?\n3. Como documentar?`);
      setIsGenerating(false);
      toast.success("Treinamento gerado com sucesso!");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500"><Brain className="h-10 w-10 text-white" /></div>
          <div><h2 className="text-2xl font-bold flex items-center gap-2">Criador de Treinamentos com IA<Sparkles className="h-5 w-5 text-yellow-500" /></h2><p className="text-muted-foreground">Gere módulos de treinamento personalizados usando inteligência artificial</p></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Configurar Treinamento</CardTitle><CardDescription>Defina os parâmetros para geração</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Tópico do Treinamento *</Label><Input placeholder="Ex: Procedimentos de Abandono" value={formData.topic} onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Norma de Referência</Label><Select value={formData.normReference} onValueChange={v => setFormData(p => ({ ...p, normReference: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="SOLAS">SOLAS</SelectItem><SelectItem value="ISM Code">ISM Code</SelectItem><SelectItem value="ISPS Code">ISPS Code</SelectItem><SelectItem value="STCW">STCW</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Categoria</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="safety">Segurança</SelectItem><SelectItem value="emergency">Emergência</SelectItem><SelectItem value="security">Security</SelectItem><SelectItem value="operations">Operações</SelectItem></SelectContent></Select></div>
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-500 to-blue-500">{isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando...</> : <><Brain className="h-4 w-4 mr-2" />Gerar com IA</>}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Conteúdo Gerado</CardTitle></CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg max-h-80 overflow-y-auto"><pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre></div>
                <div className="flex gap-2"><Button className="flex-1"><Save className="h-4 w-4 mr-2" />Salvar Treinamento</Button><Button variant="outline">Editar</Button></div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground"><Brain className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Configure os parâmetros e clique em "Gerar com IA"</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
