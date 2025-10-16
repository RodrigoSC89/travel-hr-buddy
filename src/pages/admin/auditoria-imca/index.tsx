import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AuditoriaIMCA() {
  const [nomeNavio, setNomeNavio] = useState("");
  const [contexto, setContexto] = useState("");
  const [relatorio, setRelatorio] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Load data from query params if reopening from history
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nome = params.get("nome");
    const ctx = params.get("contexto");
    
    if (nome) setNomeNavio(nome);
    if (ctx) setContexto(ctx);
  }, [location]);

  const gerarRelatorio = async () => {
    if (!nomeNavio || !contexto) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do navio e o contexto.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate AI generation (replace with actual API call)
      const prompt = `Gerar relatório de auditoria técnica IMCA para o navio ${nomeNavio} com o seguinte contexto: ${contexto}`;
      
      // This is a placeholder - you would call your AI service here
      const mockReport = `# Relatório de Auditoria Técnica IMCA

## Navio: ${nomeNavio}

## Contexto da Auditoria
${contexto}

## Resultados da Auditoria

### 1. Conformidade com Normas IMCA
- Status: Em conformidade
- Certificações verificadas
- Documentação completa

### 2. Segurança Operacional
- Sistemas de segurança funcionando adequadamente
- Treinamento da tripulação atualizado
- Procedimentos de emergência implementados

### 3. Equipamentos e Manutenção
- Equipamentos em bom estado
- Registros de manutenção adequados
- Próximas inspeções programadas

### 4. Recomendações
- Continuar programa de manutenção preventiva
- Realizar treinamento adicional em procedimentos específicos
- Atualizar documentação técnica

### 5. Conclusão
A embarcação está em conformidade com os requisitos IMCA e apta para operação.

Data: ${new Date().toLocaleDateString("pt-BR")}
Auditor: Sistema Automatizado`;

      setRelatorio(mockReport);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório foi gerado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const salvarRelatorio = async () => {
    if (!nomeNavio || !contexto || !relatorio) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, gere um relatório antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auditoria/salvar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_navio: nomeNavio,
          contexto,
          relatorio,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar relatório");
      }

      toast({
        title: "Relatório salvo",
        description: "O relatório foi salvo com sucesso!",
      });

      // Clear form
      setNomeNavio("");
      setContexto("");
      setRelatorio("");
      
      // Navigate to history
      navigate("/admin/auditoria-imca/historico");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o relatório.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Auditoria Técnica IMCA</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/auditoria-imca/historico")}
        >
          Ver Histórico
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Nova Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome-navio">Nome do Navio *</Label>
            <Input
              id="nome-navio"
              placeholder="Ex: MV Ocean Explorer"
              value={nomeNavio}
              onChange={(e) => setNomeNavio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contexto">Contexto da Auditoria *</Label>
            <Textarea
              id="contexto"
              placeholder="Descreva o contexto, tipo de operação, checklist específico, etc..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={5}
            />
          </div>

          <Button
            onClick={gerarRelatorio}
            disabled={generating}
            className="w-full"
          >
            {generating ? "Gerando..." : "Gerar Relatório com IA"}
          </Button>

          {relatorio && (
            <div>
              <Label htmlFor="relatorio">Relatório Gerado</Label>
              <Textarea
                id="relatorio"
                value={relatorio}
                onChange={(e) => setRelatorio(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={salvarRelatorio}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Salvando..." : "Salvar Relatório"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
