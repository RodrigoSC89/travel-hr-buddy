/**
 * PATCHES 571-575 - Multilingual AI & i18n System
 * Página de validação agrupada
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";
import Patch571Validation from "@/modules/ai-translator/validation/Patch571Validation";
import Patch572Validation from "@/modules/i18n-hooks/validation/Patch572Validation";
import Patch573Validation from "@/modules/multilingual-logs/validation/Patch573Validation";
import Patch574Validation from "@/modules/i18n-dashboard/validation/Patch574Validation";
import Patch575Validation from "@/modules/llm-multilingual/validation/Patch575Validation";

export default function Patches571to575() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Languages className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">PATCHES 571-575</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Multilingual AI & Internationalization System
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              v3.6
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">571</Badge>
              <span>AI Translator Core</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">572</Badge>
              <span>i18n Hooks UI</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">573</Badge>
              <span>Logs e Alertas Multilíngues</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">574</Badge>
              <span>Dashboard de Internacionalização</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">575</Badge>
              <span>LLM Multilíngue Fine-tuned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Patch571Validation />
        <Patch572Validation />
        <Patch573Validation />
        <Patch574Validation />
        <Patch575Validation />
      </div>
    </div>
  );
}
