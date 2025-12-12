import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileText, Calendar } from "lucide-react";
import { OVIQ4_SECTIONS } from "@/data/oviq4-checklist";

interface OVIDNonConformitiesProps {
  answers: Record<string, { answer: "yes" | "no" | "na" | null; observation: string; evidence: string[] }>;
  onGenerateActionPlan: (questionId: string) => void;
}

export const OVIDNonConformities: React.FC<OVIDNonConformitiesProps> = ({ answers, onGenerateActionPlan }) => {
  const nonConformities = Object.entries(answers)
    .filter(([_, value]) => value.answer === "no")
    .map(([questionId, value]) => {
      let question = null;
      for (const section of OVIQ4_SECTIONS) {
        question = section.questions.find(q => q.id === questionId);
        if (question) break;
      }
      return { questionId, ...value, question };
});

  if (nonConformities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma não conformidade registrada</h3>
          <p className="text-muted-foreground">Todas as questões respondidas estão conformes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Não Conformidades ({nonConformities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {nonConformities.map((nc) => (
              <div key={nc.questionId} className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">{nc.questionId}</Badge>
                      <Badge variant="outline">NC</Badge>
                    </div>
                    <p className="text-sm font-medium">{nc.question?.question || "Questão não encontrada"}</p>
                    {nc.observation && (
                      <p className="text-sm text-muted-foreground mt-2 italic">"{nc.observation}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleonGenerateActionPlan}>
                      <FileText className="w-4 h-4 mr-1" />
                      Plano
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Prazo
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
