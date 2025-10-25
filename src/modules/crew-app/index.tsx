import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckSquare,
  FileText,
  User,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSync } from "./hooks/useSync";
import { SyncStatus } from "./components/SyncStatus";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp?: Date;
}

interface Checklist {
  id: string;
  title: string;
  category: string;
  items: ChecklistItem[];
  completedAt?: Date;
}

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  synced: boolean;
}

interface Attendance {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  timestamp: Date;
  status: "present" | "absent" | "late";
  synced: boolean;
}

const CrewApp = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const { toast } = useToast();

  // Use the sync hook
  const {
    pendingCount,
    isSyncing,
    lastSyncTime,
    saveLocally,
    syncToSupabase,
    clearPending,
  } = useSync({ autoSync: true, syncInterval: 30000 });

  // Load data from localStorage on mount
  useEffect(() => {
    loadLocalData();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão Restaurada",
        description: "Sincronizando dados...",
      });
      syncToSupabase(); // Use hook's sync function
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem Conexão",
        description: "Trabalhando em modo offline",
        variant: "default",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast, syncToSupabase]);

  // Initialize checklists
  useEffect(() => {
    if (checklists.length === 0) {
      const defaultChecklists: Checklist[] = [
        {
          id: "safety-daily",
          title: "Checklist de Segurança Diária",
          category: "Segurança",
          items: [
            { id: "1", text: "Verificar equipamentos de combate a incêndio", completed: false },
            { id: "2", text: "Testar alarmes de emergência", completed: false },
            { id: "3", text: "Inspecionar coletes salva-vidas", completed: false },
            { id: "4", text: "Verificar kit de primeiros socorros", completed: false },
            { id: "5", text: "Confirmar rotas de evacuação desobstruídas", completed: false },
          ],
        },
        {
          id: "pre-departure",
          title: "Checklist Pré-Partida",
          category: "Operacional",
          items: [
            { id: "1", text: "Verificar combustível", completed: false },
            { id: "2", text: "Testar comunicações", completed: false },
            { id: "3", text: "Confirmar tripulação completa", completed: false },
            { id: "4", text: "Verificar condições meteorológicas", completed: false },
            { id: "5", text: "Revisar plano de navegação", completed: false },
          ],
        },
        {
          id: "shift-change",
          title: "Checklist de Troca de Turno",
          category: "Operacional",
          items: [
            { id: "1", text: "Briefing de situação atual", completed: false },
            { id: "2", text: "Transferência de responsabilidades", completed: false },
            { id: "3", text: "Relatar incidentes do turno", completed: false },
            { id: "4", text: "Verificar pendências", completed: false },
          ],
        },
      ];
      setChecklists(defaultChecklists);
      saveLocalData("checklists", defaultChecklists);
    }
  }, [checklists.length]);

  const loadLocalData = () => {
    try {
      const savedChecklists = localStorage.getItem("crew_checklists");
      const savedReports = localStorage.getItem("crew_reports");
      const savedAttendance = localStorage.getItem("crew_attendance");

      if (savedChecklists) setChecklists(JSON.parse(savedChecklists));
      if (savedReports) setReports(JSON.parse(savedReports));
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    } catch (error) {
      console.error("Error loading local data:", error);
    }
  };

  const saveLocalData = (key: string, data: any) => {
    try {
      localStorage.setItem(`crew_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving local data:", error);
    }
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              completed: !item.completed,
              timestamp: !item.completed ? new Date() : undefined,
            };
          }
          return item;
        });
        
        const allCompleted = updatedItems.every(item => item.completed);
        return {
          ...checklist,
          items: updatedItems,
          completedAt: allCompleted ? new Date() : undefined,
        };
      }
      return checklist;
    });

    setChecklists(updatedChecklists);
    saveLocalData("checklists", updatedChecklists);
  };

  const resetChecklist = (checklistId: string) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => ({
            ...item,
            completed: false,
            timestamp: undefined,
          })),
          completedAt: undefined,
        };
      }
      return checklist;
    });

    setChecklists(updatedChecklists);
    saveLocalData("checklists", updatedChecklists);
    
    toast({
      title: "Checklist Resetada",
      description: "Pronta para nova verificação",
    });
  };

  const submitReport = async (type: string, title: string, description: string) => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date(),
      synced: false,
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveLocalData("reports", updatedReports);

    // Save to sync queue
    await saveLocally(newReport, "report");

    toast({
      title: "Relatório Salvo",
      description: isOnline ? "Sincronizando..." : "Será sincronizado quando conectar",
    });
  };

  const registerAttendance = async () => {
    const newAttendance: Attendance = {
      id: `attendance-${Date.now()}`,
      crewMemberId: "current-user-id",
      crewMemberName: "Tripulante Atual",
      timestamp: new Date(),
      status: "present",
      synced: false,
    };

    const updatedAttendance = [newAttendance, ...attendance];
    setAttendance(updatedAttendance);
    saveLocalData("attendance", updatedAttendance);

    // Save to sync queue
    await saveLocally(newAttendance, "attendance");

    toast({
      title: "Presença Registrada",
      description: new Date().toLocaleString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Full-screen Mobile-First Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">Tripulante App</h1>
                <p className="text-sm text-blue-100">Modo Offline-First</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge className="gap-2 bg-green-600 hover:bg-green-600">
                  <Wifi className="h-4 w-4" />
                  Online
                </Badge>
              ) : (
                <Badge className="gap-2 bg-orange-600 hover:bg-orange-600">
                  <WifiOff className="h-4 w-4" />
                  Offline
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary">
                  {pendingCount} pendente(s)
                </Badge>
              )}
            </div>
          </div>

          {!isOnline && (
            <div className="bg-orange-900/50 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Trabalhando offline. Dados serão sincronizados quando conectar.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="checklists" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="attendance">Presença</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>

          {/* Sync Tab - NEW */}
          <TabsContent value="sync" className="space-y-4">
            <SyncStatus
              pendingCount={pendingCount}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              isOnline={isOnline}
              onSync={syncToSupabase}
              onClear={clearPending}
            />
          </TabsContent>

          {/* Checklists Tab */}
          <TabsContent value="checklists" className="space-y-4">
            {checklists.map((checklist) => {
              const progress = checklist.items.filter(i => i.completed).length;
              const total = checklist.items.length;
              const percentage = (progress / total) * 100;

              return (
                <Card key={checklist.id} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{checklist.title}</CardTitle>
                        <p className="text-sm text-slate-400">{checklist.category}</p>
                      </div>
                      <Badge variant={percentage === 100 ? "default" : "secondary"}>
                        {progress}/{total}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {checklist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(checklist.id, item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm",
                            item.completed ? "line-through text-slate-500" : "text-white"
                          )}>
                            {item.text}
                          </p>
                          {item.completed && item.timestamp && (
                            <p className="text-xs text-slate-500 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        {item.completed && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                    
                    {percentage === 100 ? (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="lg"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluído
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => resetChecklist(checklist.id)}
                          className="border-slate-700"
                        >
                          Resetar
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center pt-2">
                        Complete todos os itens para finalizar
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Novo Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportForm onSubmit={submitReport} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Relatórios Salvos</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhum relatório salvo
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-lg bg-slate-800 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4" />
                            <p className="font-semibold text-white">{report.title}</p>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{report.description}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={report.synced ? "default" : "secondary"}>
                          {report.synced ? "Sincronizado" : "Pendente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Registrar Presença</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">
                  Registre sua presença para o turno atual
                </p>
                <Button
                  onClick={registerAttendance}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Estou Presente
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhum registro de presença
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 rounded-lg bg-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-white font-medium">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            Status: {record.status === "present" ? "Presente" : "Ausente"}
                          </p>
                        </div>
                        <Badge variant={record.synced ? "default" : "secondary"}>
                          {record.synced ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Report Form Component
const ReportForm = ({ onSubmit }: { onSubmit: (type: string, title: string, description: string) => void }) => {
  const [type, setType] = useState("incident");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title || !description) return;
    onSubmit(type, title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
        >
          <option value="incident">Incidente</option>
          <option value="maintenance">Manutenção</option>
          <option value="observation">Observação</option>
          <option value="other">Outro</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-2 block">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Vazamento no sistema hidráulico"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-2 block">Descrição</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o problema ou observação..."
          rows={4}
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!title || !description}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        Salvar Relatório
      </Button>
    </div>
  );
};

export default CrewApp;
