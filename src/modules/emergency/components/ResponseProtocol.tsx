import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  critical: boolean;
}

interface ResponseProtocolProps {
  emergencyType: string;
  steps: ProtocolStep[];
  onStepComplete: (stepId: string) => void;
}

export function ResponseProtocol({ emergencyType, steps, onStepComplete }: ResponseProtocolProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Protocolo de Resposta</span>
          <Badge variant="outline">{emergencyType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                step.completed ? "bg-accent/30" : "bg-background"
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : step.critical ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">
                    {index + 1}. {step.title}
                  </h4>
                  {step.critical && (
                    <Badge variant="destructive" className="text-xs">
                      Crítico
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                {!step.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStepComplete(step.id)}
                  >
                    Marcar como Concluído
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
