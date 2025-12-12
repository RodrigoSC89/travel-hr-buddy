import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Upload,
  FileVideo,
  FileText,
  AlertTriangle,
  Calendar,
  Plus,
  Settings
} from "lucide-react";

interface TrialTest {
  id: string;
  category: string;
  name: string;
  description: string;
  imcaReference: string;
  isRequired: boolean;
  frequency: string;
  lastExecuted?: Date;
  result?: "pass" | "fail" | "pending";
  evidence?: string[];
  notes?: string;
}

const ANNUAL_TRIAL_TESTS: TrialTest[] = [
  {
    id: "DPT-001",
    category: "Positioning",
    name: "Position Reference System Test",
    description: "Verificar operação de todos os sistemas de referência de posição individualmente e em combinação",
    imcaReference: "IMCA M190 - 4.1",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-002",
    category: "Positioning",
    name: "GPS/DGPS Accuracy Test",
    description: "Teste de precisão do sistema GPS/DGPS em condições operacionais",
    imcaReference: "IMCA M190 - 4.2",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-003",
    category: "Positioning",
    name: "Acoustic System Test",
    description: "Verificação de sistema acústico HPR/USBL se instalado",
    imcaReference: "IMCA M190 - 4.3",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-004",
    category: "Power",
    name: "Generator Blackout Recovery",
    description: "Teste de recuperação de blackout com reinício automático de geradores",
    imcaReference: "IMCA M190 - 5.1",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-005",
    category: "Power",
    name: "Power Management System Test",
    description: "Verificação do sistema de gerenciamento de potência sob condições de carga",
    imcaReference: "IMCA M190 - 5.2",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-006",
    category: "Power",
    name: "UPS/Battery Backup Test",
    description: "Teste de autonomia e switchover dos sistemas UPS",
    imcaReference: "IMCA M190 - 5.3",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-007",
    category: "Thruster",
    name: "Thruster Response Test",
    description: "Verificação de tempo de resposta e força de cada thruster",
    imcaReference: "IMCA M190 - 6.1",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-008",
    category: "Thruster",
    name: "Thruster Failure Isolation",
    description: "Teste de isolamento de falha de thruster sem afetar outros sistemas",
    imcaReference: "IMCA M190 - 6.2",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-009",
    category: "Control",
    name: "DP Controller Switchover",
    description: "Teste de transferência entre controladores DP redundantes",
    imcaReference: "IMCA M190 - 7.1",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-010",
    category: "Control",
    name: "Sensor Failure Simulation",
    description: "Simulação de falhas de sensores e verificação de alarmes",
    imcaReference: "IMCA M190 - 7.2",
    isRequired: true,
    frequency: "Annual"
  },
  {
    id: "DPT-011",
    category: "FMEA",
    name: "WCFDI Verification",
    description: "Verificação do Worst Case Failure Design Intent conforme FMEA",
    imcaReference: "IMCA M166",
    isRequired: true,
    frequency: "5 Years"
  },
  {
    id: "DPT-012",
    category: "FMEA",
    name: "FMEA Proving Trial",
    description: "Teste de comprovação do FMEA com validação de redundâncias",
    imcaReference: "IMCA M166 - Appendix",
    isRequired: true,
    frequency: "5 Years"
  }
];

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
}

export const IMCAAuditTrials = memo(function({ selectedDPClass }: Props) {
  const { toast } = useToast();
  const [tests, setTests] = useState<TrialTest[]>(ANNUAL_TRIAL_TESTS);
  const [selectedTest, setSelectedTest] = useState<TrialTest | null>(null);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);

  const [executionData, setExecutionData] = useState({
    result: "pending" as "pass" | "fail" | "pending",
    notes: "",
    evidenceFiles: [] as string[]
  });

  const passedTests = tests.filter(t => t.result === "pass").length;
  const failedTests = tests.filter(t => t.result === "fail").length;
  const pendingTests = tests.filter(t => !t.result || t.result === "pending").length;
  const progressPercent = Math.round((passedTests / tests.length) * 100);

  const handleExecuteTest = () => {
    if (!selectedTest) return;

    const updatedTests = tests.map(t => 
      t.id === selectedTest.id 
        ? { 
          ...t, 
          result: executionData.result,
          notes: executionData.notes,
          lastExecuted: new Date()
        }
        : t
    );

    setTests(updatedTests);
    setIsExecuteOpen(false);
    setSelectedTest(null);
    setExecutionData({ result: "pending", notes: "", evidenceFiles: [] });

    toast({
      title: executionData.result === "pass" ? "Teste Aprovado" : "Teste Registrado",
      description: `${selectedTest.name} - Resultado: ${executionData.result === "pass" ? "PASSOU" : executionData.result === "fail" ? "FALHOU" : "PENDENTE"}`
    });
  };

  const getResultIcon = (result?: string) => {
    switch (result) {
    case "pass": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "fail": return <XCircle className="h-5 w-5 text-red-600" />;
    default: return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const groupedTests = tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, TrialTest[]>);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-3xl font-bold text-primary">{progressPercent}%</p>
              </div>
              <PlayCircle className="h-8 w-8 text-primary/50" />
            </div>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-green-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reprovados</p>
                <p className="text-3xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">{pendingTests}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests by Category */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6 pr-4">
          {Object.entries(groupedTests).map(([category, categoryTests]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {category} Tests
                </CardTitle>
                <CardDescription>
                  {categoryTests.filter(t => t.result === "pass").length} de {categoryTests.length} aprovados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryTests.map(test => (
                    <div 
                      key={test.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        test.result === "pass" ? "bg-green-500/5 border-green-500/30" :
                          test.result === "fail" ? "bg-red-500/5 border-red-500/30" :
                            "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getResultIcon(test.result)}
                            <Badge variant="outline" className="font-mono text-xs">{test.id}</Badge>
                            <span className="font-medium">{test.name}</span>
                            {test.isRequired && (
                              <Badge variant="destructive" className="text-[10px]">Obrigatório</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {test.imcaReference}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {test.frequency}
                            </span>
                            {test.lastExecuted && (
                              <span>
                                Executado: {test.lastExecuted.toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant={test.result === "pass" ? "outline" : "default"}
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setIsExecuteOpen(true);
                          }}
                        >
                          {test.result ? "Rever" : "Executar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Execute Test Dialog */}
      <Dialog open={isExecuteOpen} onOpenChange={setIsExecuteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Registrar Execução de Teste
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedTest.id}</Badge>
                  <Badge>{selectedTest.category}</Badge>
                </div>
                <p className="text-sm">{selectedTest.description}</p>
                <p className="text-xs text-muted-foreground">
                  Referência: {selectedTest.imcaReference}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Resultado do Teste</Label>
                <Select 
                  value={executionData.result}
                  onValueChange={v => setExecutionData({ ...executionData, result: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Aprovado (PASS)
                      </span>
                    </SelectItem>
                    <SelectItem value="fail">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Reprovado (FAIL)
                      </span>
                    </SelectItem>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Pendente
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações e Evidências</Label>
                <Textarea
                  value={executionData.notes}
                  onChange={e => setExecutionData({ ...executionData, notes: e.target.value })}
                  placeholder="Descreva os resultados do teste, condições, parâmetros medidos..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivos de Evidência</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste arquivos ou clique para upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vídeos, logs, prints de tela, relatórios
                  </p>
                </div>
              </div>

              {executionData.result === "fail" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Teste Reprovado</p>
                    <p className="text-muted-foreground">
                      Uma não conformidade será gerada automaticamente e um plano de ação será solicitado.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecuteTest}>
              Registrar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
