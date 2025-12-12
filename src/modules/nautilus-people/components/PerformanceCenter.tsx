/**
import { useState } from "react";;
 * Performance Center - Avaliações, OKRs, Feedback e 9-Box
 * Versão funcional completa
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Target,
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Plus,
  Send,
  ThumbsUp,
  Sparkles,
  Loader2,
  Download,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { mockAvaliacoes, mockOKRs, mockNineBox, mockColaboradores } from "../data/mockData";
import { useNautilusPeopleAI } from "../hooks/useNautilusPeopleAI";
import type { Avaliacao, OKR } from "../types";

const PerformanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("avaliacoes");
  const [selectedCiclo, setSelectedCiclo] = useState("q4-2025");
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(mockAvaliacoes);
  const [okrs, setOkrs] = useState<OKR[]>(mockOKRs);
  const [isNewOKROpen, setIsNewOKROpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTarget, setFeedbackTarget] = useState("");
  const [feedbackType, setFeedbackType] = useState<"reconhecimento" | "construtivo">("reconhecimento");
  
  const { isLoading, generateOKR, analyzePerformance } = useNautilusPeopleAI();

  const [newOKR, setNewOKR] = useState({
    objetivo: "",
    keyResults: "",
    responsavel: "",
    prazo: ""
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "concluida":
      return <Badge className="bg-green-500">Concluída</Badge>;
    case "em_andamento":
      return <Badge className="bg-blue-500">Em Andamento</Badge>;
    case "pendente":
      return <Badge variant="secondary">Pendente</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return "text-green-500";
    if (nota >= 3.5) return "text-blue-500";
    if (nota >= 2.5) return "text-yellow-500";
    return "text-red-500";
  };

  const handleStartAvaliacao = async (avaliacao: Avaliacao) => {
    toast.info(`Iniciando avaliação de ${avaliacao.colaborador}...`);
    
    const result = await analyzePerformance(
      { nome: avaliacao.colaborador, cargo: avaliacao.cargo },
      avaliacao.metas,
      []
    );
    
    if (result) {
      setAvaliacoes(prev => prev.map(a => 
        a.id === avaliacao.id 
          ? { ...a, status: "em_andamento" as const }
          : a
      ));
      toast.success("Avaliação iniciada com análise de IA!");
    }
  };

  const handleContinueAvaliacao = (avaliacao: Avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setIsDetailOpen(true);
  };

  const handleCreateOKR = async () => {
    if (!newOKR.objetivo || !newOKR.responsavel) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const novoOKR: OKR = {
      id: Date.now().toString(),
      objetivo: newOKR.objetivo,
      keyResults: newOKR.keyResults.split("\n").filter(kr => kr.trim()).map((kr, idx) => ({
        id: `kr-${idx}`,
        titulo: kr.trim(),
        meta: 100,
        atual: 0,
        unidade: "%"
      })),
      responsavel: newOKR.responsavel,
      prazo: newOKR.prazo || "31/12/2025",
      progresso: 0,
      status: "ativo"
    };

    setOkrs([novoOKR, ...okrs]);
    setIsNewOKROpen(false);
    setNewOKR({ objetivo: "", keyResults: "", responsavel: "", prazo: "" });
    toast.success("OKR criado com sucesso!");
  };

  const handleGenerateOKRWithAI = async () => {
    toast.info("Gerando OKR com IA...");
    const result = await generateOKR("Melhorar eficiência operacional", "Operações", "Q1 2026");
    
    if (result) {
      try {
        const parsed = JSON.parse(result);
        setNewOKR({
          objetivo: parsed.objective || "",
          keyResults: parsed.keyResults?.map((kr: { title: string }) => kr.title).join("\n") || "",
          responsavel: parsed.owner || "",
          prazo: parsed.quarter || ""
        });
        toast.success("OKR gerado pela IA!");
      } catch {
        setNewOKR(prev => ({ ...prev, objetivo: result }));
        toast.success("Sugestão de objetivo gerada!");
      }
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackText || !feedbackTarget) {
      toast.error("Preencha todos os campos");
      return;
    }

    toast.success(`Feedback ${feedbackType} enviado para ${feedbackTarget}!`);
    setFeedbackText("");
    setFeedbackTarget("");
    setIsFeedbackOpen(false);
  };

  const handleExportNineBox = () => {
    const csvContent = "Colaborador,Performance,Potencial,Classificação\n" +
      mockNineBox.map(n => `${n.colaborador},${n.performance},${n.potential},${n.label}`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nine_box_matrix.csv";
    link.click();
    
    toast.success("Matriz 9-Box exportada!");
  };

  const nineBoxGrid = [
    { row: 0, col: 0, label: "Enigma", performance: "low", potential: "high", color: "bg-yellow-500/20" },
    { row: 0, col: 1, label: "Potencial Crescente", performance: "medium", potential: "high", color: "bg-blue-500/20" },
    { row: 0, col: 2, label: "Estrela", performance: "high", potential: "high", color: "bg-green-500/20" },
    { row: 1, col: 0, label: "Questionável", performance: "low", potential: "medium", color: "bg-orange-500/20" },
    { row: 1, col: 1, label: "Profissional Chave", performance: "medium", potential: "medium", color: "bg-purple-500/20" },
    { row: 1, col: 2, label: "Alto Performer", performance: "high", potential: "medium", color: "bg-teal-500/20" },
    { row: 2, col: 0, label: "Em Risco", performance: "low", potential: "low", color: "bg-red-500/20" },
    { row: 2, col: 1, label: "Eficiente", performance: "medium", potential: "low", color: "bg-gray-500/20" },
    { row: 2, col: 2, label: "Especialista", performance: "high", potential: "low", color: "bg-indigo-500/20" },
  ];

  const getCollaboratorsInBox = (performance: string, potential: string) => {
    return mockNineBox.filter(n => n.performance === performance && n.potential === potential);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">4.3</p>
                <p className="text-sm text-muted-foreground">Média Geral</p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">76%</p>
                <p className="text-sm text-muted-foreground">Metas Atingidas</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">142</p>
                <p className="text-sm text-muted-foreground">Feedbacks Dados</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{avaliacoes.filter(a => a.status === "pendente").length}</p>
                <p className="text-sm text-muted-foreground">Avaliações Pendentes</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border p-1">
          <TabsTrigger value="avaliacoes" className="gap-2">
            <Star className="w-4 h-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="okrs" className="gap-2">
            <Target className="w-4 h-4" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback Contínuo
          </TabsTrigger>
          <TabsTrigger value="nine-box" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            9-Box
          </TabsTrigger>
        </TabsList>

        {/* Avaliações Tab */}
        <TabsContent value="avaliacoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedCiclo} onValueChange={setSelectedCiclo}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q4-2025">Q4 2025</SelectItem>
                <SelectItem value="q3-2025">Q3 2025</SelectItem>
                <SelectItem value="q2-2025">Q2 2025</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => toast.info("Funcionalidade de nova avaliação")}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>

          <div className="space-y-4">
            {avaliacoes.map((avaliacao, index) => (
              <motion.div
                key={avaliacao.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {avaliacao.colaborador.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{avaliacao.colaborador}</h3>
                          <p className="text-sm text-muted-foreground">{avaliacao.cargo} • {avaliacao.departamento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(avaliacao.status)}
                        {avaliacao.nota > 0 && (
                          <p className={`text-2xl font-bold mt-1 ${getNotaColor(avaliacao.nota)}`}>
                            {avaliacao.nota.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    {avaliacao.status !== "pendente" && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Auto-avaliação</p>
                          <p className="text-lg font-semibold">{avaliacao.autoAvaliacao.toFixed(1)}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Gestor</p>
                          <p className="text-lg font-semibold">{avaliacao.avaliacaoGestor.toFixed(1)}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">360°</p>
                          <p className="text-lg font-semibold">{avaliacao.feedback360.toFixed(1)}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Metas do Ciclo</p>
                      {avaliacao.metas.map((meta) => (
                        <div key={meta.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{meta.titulo}</span>
                            <span>{meta.progresso}%</span>
                          </div>
                          <Progress value={meta.progresso} className="h-1.5" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleContinueAvaliacao(avaliacao)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => avaliacao.status === "pendente" ? handleStartAvaliacao(avaliacao) : handleContinueAvaliacao(avaliacao)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : avaliacao.status === "pendente" ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Iniciar Avaliação
                          </>
                        ) : (
                          "Continuar"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* OKRs Tab */}
        <TabsContent value="okrs" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog open={isNewOKROpen} onOpenChange={setIsNewOKROpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo OKR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo OKR</DialogTitle>
                  <DialogDescription>Defina objetivos e resultados-chave</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Objetivo *</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateOKRWithAI} disabled={isLoading}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Gerar com IA
                      </Button>
                    </div>
                    <Input 
                      placeholder="Ex: Aumentar eficiência operacional"
                      value={newOKR.objetivo}
                      onChange={(e) => setNewOKR({...newOKR, objetivo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Key Results (um por linha)</Label>
                    <Textarea 
                      placeholder="Reduzir tempo de parada em 20%&#10;Aumentar OEE para 85%"
                      rows={4}
                      value={newOKR.keyResults}
                      onChange={(e) => setNewOKR({...newOKR, keyResults: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Responsável *</Label>
                      <Select 
                        value={newOKR.responsavel}
                        onValueChange={(v) => setNewOKR({...newOKR, responsavel: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {mockColaboradores.map(c => (
                            <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo</Label>
                      <Input 
                        type="date"
                        value={newOKR.prazo}
                        onChange={(e) => setNewOKR({...newOKR, prazo: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewOKROpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateOKR} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Criar OKR
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {okrs.map((okr) => (
              <Card key={okr.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{okr.objetivo}</CardTitle>
                      <CardDescription>
                        {okr.responsavel} • Prazo: {okr.prazo}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{okr.progresso}%</p>
                      <Progress value={okr.progresso} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {okr.keyResults.map((kr) => (
                    <div key={kr.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{kr.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          Meta: {kr.meta}{kr.unidade} | Atual: {kr.atual}{kr.unidade}
                        </p>
                      </div>
                      <div className="w-32">
                        <Progress value={(kr.atual / kr.meta) * 100} className="h-2" />
                      </div>
                      <span className="ml-2 text-sm font-medium w-12 text-right">
                        {Math.round((kr.atual / kr.meta) * 100)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Enviar Feedback
              </CardTitle>
              <CardDescription>Dê feedback construtivo para seus colegas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={feedbackTarget} onValueChange={setFeedbackTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {mockColaboradores.map(c => (
                    <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Digite seu feedback..." 
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant={feedbackType === "reconhecimento" ? "default" : "outline"} 
                  className="flex-1"
                  onClick={() => setFeedbackType("reconhecimento")}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Reconhecimento
                </Button>
                <Button 
                  variant={feedbackType === "construtivo" ? "default" : "outline"} 
                  className="flex-1"
                  onClick={() => setFeedbackType("construtivo")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Construtivo
                </Button>
              </div>
              <Button className="w-full" onClick={handleSendFeedback}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Feedback
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { de: "Carlos Silva", para: "Ana Martins", tipo: "reconhecimento", texto: "Excelente trabalho na apresentação do projeto!" },
                { de: "Maria Lima", para: "João Pedro", tipo: "construtivo", texto: "Sugestão para melhorar a comunicação nas reuniões." },
                { de: "Roberto Santos", para: "Carlos Silva", tipo: "reconhecimento", texto: "Liderança exemplar no projeto de segurança." }
              ].map((feedback, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {feedback.de.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{feedback.de} → {feedback.para}</p>
                      <p className="text-xs text-muted-foreground">há 2 horas</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {feedback.tipo === "reconhecimento" ? "👍 Reconhecimento" : "💬 Construtivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.texto}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9-Box Tab */}
        <TabsContent value="nine-box">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Matriz 9-Box</CardTitle>
                <CardDescription>Análise de potencial vs performance</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportNineBox}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 max-w-3xl mx-auto">
                {/* Labels de Potencial (esquerda) */}
                <div className="col-span-3 flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-20">Alto Potencial</span>
                  <div className="flex-1" />
                </div>
                
                {nineBoxGrid.map((cell) => {
                  const collaborators = getCollaboratorsInBox(cell.performance, cell.potential);
                  return (
                    <div
                      key={`${cell.row}-${cell.col}`}
                      className={`aspect-square p-2 rounded-lg border ${cell.color} flex flex-col`}
                    >
                      <span className="text-xs font-medium mb-1">{cell.label}</span>
                      <div className="flex-1 flex flex-wrap gap-1 content-start">
                        {collaborators.map(c => (
                          <Avatar key={c.colaboradorId} className="w-8 h-8" title={c.colaborador}>
                            <AvatarFallback className="text-[10px] bg-background">
                              {c.colaborador.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {collaborators.length} pessoas
                      </Badge>
                    </div>
                  );
                })}
                
                {/* Labels de Performance (baixo) */}
                <div className="col-span-3 flex justify-around mt-2">
                  <span className="text-xs text-muted-foreground">Baixa Performance</span>
                  <span className="text-xs text-muted-foreground">Média Performance</span>
                  <span className="text-xs text-muted-foreground">Alta Performance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação</DialogTitle>
          </DialogHeader>
          {selectedAvaliacao && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {selectedAvaliacao.colaborador.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAvaliacao.colaborador}</h3>
                  <p className="text-muted-foreground">{selectedAvaliacao.cargo}</p>
                  <p className="text-sm text-muted-foreground">{selectedAvaliacao.departamento} • {selectedAvaliacao.ciclo}</p>
                </div>
                <div className="ml-auto text-right">
                  {getStatusBadge(selectedAvaliacao.status)}
                  {selectedAvaliacao.nota > 0 && (
                    <p className={`text-3xl font-bold ${getNotaColor(selectedAvaliacao.nota)}`}>
                      {selectedAvaliacao.nota.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Auto-avaliação</p>
                    <p className="text-2xl font-bold">{selectedAvaliacao.autoAvaliacao.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Avaliação Gestor</p>
                    <p className="text-2xl font-bold">{selectedAvaliacao.avaliacaoGestor.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Feedback 360°</p>
                    <p className="text-2xl font-bold">{selectedAvaliacao.feedback360.toFixed(1)}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-3">Metas do Ciclo</h4>
                <div className="space-y-3">
                  {selectedAvaliacao.metas.map((meta) => (
                    <div key={meta.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{meta.titulo}</span>
                        <span className="text-sm">{meta.progresso}%</span>
                      </div>
                      <Progress value={meta.progresso} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Peso: {meta.peso}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceCenter;
