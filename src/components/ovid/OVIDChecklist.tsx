import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, XCircle, MinusCircle, ClipboardCheck } from "lucide-react";
import { OVIQ4_SECTIONS } from "@/data/oviq4-checklist";

interface OVIDChecklistProps {
  vesselType: string;
  answers: Record<string, { answer: "yes" | "no" | "na" | null; observation: string; evidence: string[] }>;
  onAnswerChange: (questionId: string, answer: "yes" | "no" | "na", observation?: string) => void;
  inspectionStarted: boolean;
}

export const OVIDChecklist: React.FC<OVIDChecklistProps> = ({
  vesselType,
  answers,
  onAnswerChange,
  inspectionStarted,
}) => {
  if (!inspectionStarted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma inspeção em andamento</h3>
          <p className="text-muted-foreground">Inicie uma nova inspeção para acessar o checklist OVIQ4</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          OVIQ4 Checklist - {vesselType}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Accordion type="multiple" className="space-y-2">
            {OVIQ4_SECTIONS.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{section.id}</Badge>
                    <span className="font-medium">{section.name}</span>
                    <Badge variant="secondary" className="ml-2">{section.questions.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {section.questions.map((question) => {
                      const answer = answers[question.id]?.answer;
                      return (
                        <div key={question.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{question.id}</Badge>
                                {question.priority === "high" && <Badge variant="destructive" className="text-xs">Alta</Badge>}
                              </div>
                              <p className="text-sm font-medium">{question.question}</p>
                              <p className="text-xs text-muted-foreground mt-1">{question.guidance}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={answer === "yes" ? "default" : "outline"}
                                className={answer === "yes" ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={() => handleonAnswerChange}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={answer === "no" ? "default" : "outline"}
                                className={answer === "no" ? "bg-red-600 hover:bg-red-700" : ""}
                                onClick={() => handleonAnswerChange}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={answer === "na" ? "default" : "outline"}
                                className={answer === "na" ? "bg-gray-600 hover:bg-gray-700" : ""}
                                onClick={() => handleonAnswerChange}
                              >
                                <MinusCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {answer === "no" && (
                            <Textarea
                              placeholder="Observação obrigatória para resposta 'Não'..."
                              value={answers[question.id]?.observation || ""}
                              onChange={handleChange}
                              className="text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
