
/**
 * Painel web para envio de prompts ao Lovable Dev
 * PATCH 850 - Ferramenta administrativa
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const prompts = [
  {
    id: "SECURITY_RLS",
    title: "Auditoria de Segurança Supabase e Edge Functions",
    prompt: `Realize uma auditoria completa de segurança nas políticas RLS de todas as tabelas do Supabase, garantindo que não existam regras excessivamente permissivas entre tenants.
Em seguida, revise todas as Edge Functions para:
- Tratamento adequado de erros
- Isolamento multi-tenant
- Proteção contra injeção de código e vazamento de secrets
Corrija qualquer vulnerabilidade encontrada e documente tudo em REVIEW_SECURITY.md.`,
    category: "security",
    status: "completed"
  },
  {
    id: "AI_RAG_HITL",
    title: "IA com RAG + Human-in-the-Loop",
    prompt: `Refatore o sistema de IA para operar com arquitetura RAG (Retrieval-Augmented Generation), baseada em documentos carregados pela organização.
Implemente:
- Pontuação de confiança em cada resposta
- Validação obrigatória humana (HITL) para outputs críticos
- Trilha de auditoria de todas as interações (input, output, modelo, confiança, aprovação)
Todas as respostas devem citar fontes documentais claras. Proíba respostas "criativas" para instruções técnicas.`,
    category: "ai",
    status: "completed"
  },
  {
    id: "TEST_SUITE",
    title: "Criação de Testes Automatizados (80%)",
    prompt: `Implemente uma suite de testes com cobertura mínima de 80%:
- Use Jest para testes unitários de componentes e funções
- Use Playwright para testes E2E nos módulos de tripulação, viagens e manutenção
Inclua cobertura visual, validações lógicas e estados de erro. Gere relatórios de cobertura em tests/coverage.`,
    category: "testing",
    status: "completed"
  },
  {
    id: "PERFORMANCE_OPT",
    title: "Otimização de Performance para Conexões VSAT",
    prompt: `Aplique otimizações de rede para uso fluido em conexões VSAT (1-2 Mbps):
- Ative compressão Brotli nas respostas
- Substitua JSON por Protocol Buffers ou MessagePack onde possível
- Implemente sync diferencial (apenas dados alterados)
- Adicione compressão WebP e lazy loading em imagens
Valide a usabilidade do sistema com conexão simulada de 1.5 Mbps.`,
    category: "performance",
    status: "completed"
  },
  {
    id: "OFFLINE_SYNC",
    title: "Estratégia de Conflito Yjs/Offline",
    prompt: `Implemente uma estratégia robusta de resolução de conflitos para sincronização offline usando Yjs com CRDT/OT híbrido:
- Use Yjs para dados colaborativos não críticos
- Use OT com merge manual para logs e documentos regulatórios
- Implemente compressão delta e fila de sync com prioridade
- Armazene dados offline usando OPFS para arquivos grandes`,
    category: "offline",
    status: "completed"
  },
  {
    id: "IOT_INTEGRATION",
    title: "Camada de Ingestão IoT + Noon Reports",
    prompt: `Crie uma camada de ingestão automática de dados embarcados:
- Use coletor local (Raspberry Pi ou edge device)
- Protocolo MQTT para leitura de sensores
- Armazene localmente com InfluxDB/TimescaleDB
Use esses dados para preencher Noon Reports automaticamente com posição, consumo, clima e deslocamento.`,
    category: "iot",
    status: "pending"
  },
  {
    id: "COMPONENTS_MERGE",
    title: "Fusão de Componentes e Serviços Redundantes",
    prompt: `Realize uma varredura completa no repositório para identificar e fundir componentes, hooks e serviços com funções equivalentes mas nomes diferentes.
Para cada grupo:
- Crie um novo componente ou serviço unificado
- Preserve variações por meio de props ou config
- Atualize todas as referências no sistema
Documente as fusões em REVIEW_COMPONENTS.md.`,
    category: "refactoring",
    status: "completed"
  },
  {
    id: "I18N_SETUP",
    title: "Internacionalização Multilíngue",
    prompt: `Adicione suporte completo a internacionalização com react-i18next, com os seguintes requisitos:
- Suporte mínimo a EN, FIL, ZH, RU, ID, AR
- Suporte RTL para árabe
- Suporte a UTC/local, métricas e imperiais
- Fallbacks automáticos e tradução por namespace`,
    category: "i18n",
    status: "completed"
  },
  {
    id: "DEPLOY_READY",
    title: "Verificação Final de Deploy",
    prompt: `Prepare o sistema para deploy em ambiente de produção:
- Verifique scripts vite build, supabase functions deploy, capacitor
- Gere um pacote instalável com documentação mínima (README.md)
- Garanta que nenhum erro de runtime ocorra pós-build
- Teste funcionamento do PWA em modo offline`,
    category: "deploy",
    status: "completed"
  },
  {
    id: "EMERGENCY_MODE",
    title: "Modo de Emergência Marítima",
    prompt: `Crie um modo de emergência para o sistema com interface simplificada, contendo apenas funções críticas:
- Botão de acesso rápido a contatos MRCC/DPA
- Registro de incidentes offline com timestamp e GPS
- Checklist digital de reunião de tripulação
Garanta que este modo funcione mesmo sob conexão inexistente.`,
    category: "safety",
    status: "completed"
  }
];

const categoryColors: Record<string, string> = {
  security: "bg-red-500",
  ai: "bg-purple-500",
  testing: "bg-blue-500",
  performance: "bg-orange-500",
  offline: "bg-cyan-500",
  iot: "bg-green-500",
  refactoring: "bg-yellow-500",
  i18n: "bg-pink-500",
  deploy: "bg-indigo-500",
  safety: "bg-red-600",
};

export default function PromptPanel() {
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0].id);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const currentPrompt = prompts.find(p => p.id === selectedPrompt);

  const sendPrompt = async () => {
    if (!currentPrompt) return;
    
    setLoading(true);
    setResponse("");
    
    try {
      // Note: This endpoint is illustrative - actual API integration would need proper authentication
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentPrompt.id,
          title: currentPrompt.title,
          prompt: currentPrompt.prompt
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      toast.success("Prompt enviado com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setResponse(`Erro ao enviar prompt: ${errorMessage}`);
      toast.error("Falha ao enviar prompt");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    if (currentPrompt) {
      navigator.clipboard.writeText(currentPrompt.prompt);
      toast.success("Prompt copiado para a área de transferência");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Painel de Prompts</h1>
          <p className="text-muted-foreground">Envio de prompts para automação Lovable Dev</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {prompts.filter(p => p.status === "completed").length}/{prompts.length} Concluídos
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selecionar Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um prompt" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      {p.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span>{p.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Prompt Content */}
        {currentPrompt && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{currentPrompt.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[currentPrompt.category]}>
                    {currentPrompt.category}
                  </Badge>
                  <Badge variant={currentPrompt.status === "completed" ? "default" : "secondary"}>
                    {currentPrompt.status === "completed" ? "Concluído" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                className="w-full min-h-[200px] font-mono text-sm" 
                value={currentPrompt.prompt} 
                readOnly 
              />
              
              <div className="flex gap-3">
                <Button onClick={sendPrompt} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Prompt
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={copyPrompt}>
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response */}
        {response && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap break-words bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {response}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status das Implementações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {prompts.map((p) => (
                <div 
                  key={p.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPrompt === p.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedPrompt(p.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {p.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <Badge className={`${categoryColors[p.category]} text-xs`}>
                      {p.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.title}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
