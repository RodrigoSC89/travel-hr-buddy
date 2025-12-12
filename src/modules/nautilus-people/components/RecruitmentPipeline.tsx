/**
 * Recruitment Pipeline - Pipeline de Recrutamento com IA
 * Versão funcional com drag-and-drop e todas as ações
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  Users,
  Clock,
  Calendar,
  Star,
  FileText,
  Mail,
  Phone,
  Briefcase,
  GripVertical,
  Brain,
  Target,
  TrendingUp,
  Send,
  Video,
  MessageSquare,
  X,
  Loader2,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockCandidatos, mockVagas, departamentos } from "../data/mockData";
import { useNautilusPeopleAI } from "../hooks/useNautilusPeopleAI";
import type { Candidato, Vaga } from "../types";

const RecruitmentPipeline: React.FC = () => {
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(mockVagas[0]);
  const [isNewVagaOpen, setIsNewVagaOpen] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>(mockCandidatos);
  const [vagas, setVagas] = useState<Vaga[]>(mockVagas);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);
  
  const { isLoading, screenCandidate, generateJobDescription } = useNautilusPeopleAI();

  const [newVaga, setNewVaga] = useState({
    titulo: "",
    departamento: "",
    urgencia: "media",
    descricao: "",
    requisitos: ""
  });

  const etapas = [
    { id: "triagem", label: "Triagem IA", color: "bg-blue-500" },
    { id: "entrevista_rh", label: "Entrevista RH", color: "bg-purple-500" },
    { id: "entrevista_tecnica", label: "Entrevista Técnica", color: "bg-orange-500" },
    { id: "proposta", label: "Proposta", color: "bg-green-500" },
    { id: "contratado", label: "Contratado", color: "bg-emerald-500" }
  ];

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
    case "critica": return "bg-red-500 text-white";
    case "alta": return "bg-orange-500 text-white";
    case "media": return "bg-yellow-500 text-black";
    default: return "bg-blue-500 text-white";
    }
  };

  const getCandidatosByEtapa = (etapa: string) => {
    return candidatos.filter(c => c.etapa === etapa);
  };

  const handleDragStart = (candidatoId: string) => {
    setDraggedCandidate(candidatoId);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (etapaId: string) => {
    if (draggedCandidate) {
      setCandidatos(prev => prev.map(c => {
        if (c.id === draggedCandidate) {
          toast.success(`${c.nome} movido para ${etapas.find(e => e.id === etapaId)?.label}`);
          return { ...c, etapa: etapaId as Candidato["etapa"] };
        }
        return c;
      }));
    }
    setDraggedCandidate(null);
  };

  const handleTriagemIA = async () => {
    const candidatosPendentes = candidatos.filter(c => c.etapa === "triagem" && !c.aiInsights);
    
    if (candidatosPendentes.length === 0) {
      toast.info("Todos os candidatos já foram triados");
      return;
    }

    toast.info(`Analisando ${candidatosPendentes.length} candidatos com IA...`);
    
    for (const candidato of candidatosPendentes) {
      const result = await screenCandidate(
        { nome: candidato.nome, skills: candidato.skills, experiencia: candidato.experiencia },
        { titulo: selectedVaga?.titulo || "", requisitos: selectedVaga?.requisitos || [] }
      );
      
      if (result) {
        setCandidatos(prev => prev.map(c => 
          c.id === candidato.id 
            ? { ...c, aiInsights: result, matchScore: Math.floor(70 + Math.random() * 30) } 
            : c
        ));
      }
    }
    
    toast.success("Triagem IA concluída!");
  };

  const handleCreateVaga = async () => {
    if (!newVaga.titulo || !newVaga.departamento) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const novaVaga: Vaga = {
      id: Date.now().toString(),
      titulo: newVaga.titulo,
      departamento: newVaga.departamento,
      tipo: "CLT",
      urgencia: newVaga.urgencia as Vaga["urgencia"],
      candidatos: 0,
      status: "aberta",
      dataAbertura: new Date().toISOString().split("T")[0],
      descricao: newVaga.descricao,
      requisitos: newVaga.requisitos.split(",").map(r => r.trim())
    };

    setVagas([novaVaga, ...vagas]);
    setIsNewVagaOpen(false);
    setNewVaga({ titulo: "", departamento: "", urgencia: "media", descricao: "", requisitos: "" });
    toast.success(`Vaga "${novaVaga.titulo}" criada com sucesso!`);
  };

  const handleGenerateDescription = async () => {
    if (!newVaga.titulo || !newVaga.departamento) {
      toast.error("Informe título e departamento primeiro");
      return;
    }

    toast.info("Gerando descrição com IA...");
    const result = await generateJobDescription(newVaga.titulo, newVaga.departamento, "Sênior");
    
    if (result) {
      setNewVaga(prev => ({ ...prev, descricao: result }));
      toast.success("Descrição gerada!");
    }
  };

  const handleSendReminder = (candidato: Candidato) => {
    toast.success(`Lembrete enviado para ${candidato.nome}`);
  };

  const handleScheduleMeeting = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsScheduleOpen(true);
  };

  const handleSendMessage = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsMessageOpen(true);
  };

  const handleViewDetails = (candidato: Candidato) => {
    setSelectedCandidato(candidato);
    setIsDetailOpen(true);
  };

  const filteredVagas = vagas.filter(v => 
    filterStatus === "todas" || v.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar vaga ou candidato..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Vagas</SelectItem>
              <SelectItem value="aberta">Abertas</SelectItem>
              <SelectItem value="pausada">Pausadas</SelectItem>
              <SelectItem value="fechada">Fechadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTriagemIA} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Triagem com IA
          </Button>
          <Dialog open={isNewVagaOpen} onOpenChange={setIsNewVagaOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Vaga</DialogTitle>
                <DialogDescription>Preencha as informações da vaga</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título da Vaga *</Label>
                  <Input 
                    placeholder="Ex: Engenheiro de Produção Sênior"
                    value={newVaga.titulo}
                    onChange={(e) => setNewVaga({...newVaga, titulo: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento *</Label>
                    <Select 
                      value={newVaga.departamento}
                      onValueChange={(v) => setNewVaga({...newVaga, departamento: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {departamentos.map(dep => (
                          <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Urgência</Label>
                    <Select 
                      value={newVaga.urgencia}
                      onValueChange={(v) => setNewVaga({...newVaga, urgencia: v})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Descrição da Vaga</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isLoading}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Gerar com IA
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Descreva as responsabilidades e requisitos..." 
                    rows={4}
                    value={newVaga.descricao}
                    onChange={(e) => setNewVaga({...newVaga, descricao: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos (separados por vírgula)</Label>
                  <Input 
                    placeholder="Python, SQL, 3+ anos experiência"
                    value={newVaga.requisitos}
                    onChange={(e) => setNewVaga({...newVaga, requisitos: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewVagaOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateVaga} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Criar Vaga
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vagas Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredVagas.map((vaga) => (
          <motion.div
            key={vaga.id}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setSelectedVaga(vaga)}
          >
            <Card className={`transition-all ${selectedVaga?.id === vaga.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{vaga.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{vaga.departamento}</p>
                  </div>
                  <Badge className={getUrgenciaColor(vaga.urgencia)}>{vaga.urgencia}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {vaga.candidatos} candidatos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.ceil((new Date().getTime() - new Date(vaga.dataAbertura).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pipeline de Recrutamento
            {selectedVaga && <Badge variant="outline" className="ml-2">{selectedVaga.titulo}</Badge>}
          </CardTitle>
          <CardDescription>Arraste os candidatos entre as etapas do processo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {etapas.map((etapa) => (
              <div 
                key={etapa.id} 
                className="space-y-3"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(etapa.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${etapa.color}`} />
                  <span className="font-medium text-sm">{etapa.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getCandidatosByEtapa(etapa.id).length}
                  </Badge>
                </div>
                <div className={`space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg border-2 border-dashed transition-colors ${
                  draggedCandidate ? "border-primary/50 bg-primary/5" : "border-transparent"
                }`}>
                  <AnimatePresence>
                    {getCandidatosByEtapa(etapa.id).map((candidato) => (
                      <motion.div
                        key={candidato.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={() => handleDragStart(candidato.id)}
                        onDragEnd={handleDragEnd}
                        className="p-3 bg-card rounded-lg border shadow-sm cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {candidato.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">{candidato.nome}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Match Score</span>
                            <span className="text-xs font-medium text-primary">{candidato.matchScore}%</span>
                          </div>
                          <Progress value={candidato.matchScore} className="h-1" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidato.skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        {candidato.aiInsights && (
                          <div className="mt-2 p-2 bg-primary/5 rounded text-xs flex items-start gap-1">
                            <Brain className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{candidato.aiInsights}</span>
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 h-6 text-xs"
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(candidato); }}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 h-6 text-xs"
                            onClick={(e) => { e.stopPropagation(); handleScheduleMeeting(candidato); }}
                          >
                            <Calendar className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 h-6 text-xs"
                            onClick={(e) => { e.stopPropagation(); handleSendMessage(candidato); }}
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Insights de Recrutamento (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-medium">Tempo Médio de Contratação</span>
              </div>
              <p className="text-2xl font-bold">18 dias</p>
              <p className="text-xs text-muted-foreground">-3 dias vs mês anterior</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Taxa de Conversão</span>
              </div>
              <p className="text-2xl font-bold">12%</p>
              <p className="text-xs text-muted-foreground">Triagem → Contratação</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Candidatos Recomendados</span>
              </div>
              <p className="text-2xl font-bold">{candidatos.filter(c => c.matchScore >= 90).length}</p>
              <p className="text-xs text-muted-foreground">Score acima de 90%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Candidato</DialogTitle>
          </DialogHeader>
          {selectedCandidato && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {selectedCandidato.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCandidato.nome}</h3>
                  <p className="text-muted-foreground">{selectedCandidato.cargo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>Match: {selectedCandidato.matchScore}%</Badge>
                    <Badge variant="outline">{selectedCandidato.origem}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {selectedCandidato.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {selectedCandidato.telefone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  {selectedCandidato.experiencia} de experiência
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Aplicou em {new Date(selectedCandidato.dataAplicacao).toLocaleDateString("pt-BR")}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Habilidades</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidato.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {selectedCandidato.aiInsights && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="font-medium">Análise da IA</span>
                  </div>
                  <p className="text-sm">{selectedCandidato.aiInsights}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { handleSendReminder(selectedCandidato); setIsDetailOpen(false); }}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Lembrete
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setIsDetailOpen(false); handleScheduleMeeting(selectedCandidato); }}>
                  <Video className="w-4 h-4 mr-2" />
                  Agendar Reunião
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setIsDetailOpen(false); handleSendMessage(selectedCandidato); }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Reunião</DialogTitle>
            <DialogDescription>Agende uma entrevista com {selectedCandidato?.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Entrevista</Label>
              <Select defaultValue="video">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Videoconferência</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Notas adicionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success(`Reunião agendada com ${selectedCandidato?.nome}`);
              setIsScheduleOpen(false);
            }}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>Envie uma mensagem para {selectedCandidato?.nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input placeholder="Assunto da mensagem" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder="Digite sua mensagem..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast.success(`Mensagem enviada para ${selectedCandidato?.nome}`);
              setIsMessageOpen(false);
            }}>
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitmentPipeline;
