import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Auditoria {
  id: string;
  nome_navio: string;
  contexto: string;
  relatorio: string;
  created_at: string;
}

export default function HistoricoAuditorias() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    carregarAuditorias();
  }, []);

  const carregarAuditorias = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auditoria/listar");
      
      if (!response.ok) {
        throw new Error("Erro ao carregar auditorias");
      }
      
      const data = await response.json();
      setAuditorias(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar o histórico de auditorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const auditoriasFiltradas = auditorias.filter((a) =>
    a.nome_navio.toLowerCase().includes(filtro.toLowerCase())
  );

  const exportarPDF = (auditoria: Auditoria) => {
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px;">Auditoria Técnica IMCA</h1>
        <p><strong>Navio:</strong> ${auditoria.nome_navio}</p>
        <p><strong>Data:</strong> ${new Date(auditoria.created_at).toLocaleString("pt-BR")}</p>
        <div style="margin-top: 20px; white-space: pre-wrap;">${auditoria.relatorio}</div>
      </div>
    `;
    
    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: `Auditoria_${auditoria.nome_navio}_${new Date(auditoria.created_at).toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
    
    toast({
      title: "PDF exportado",
      description: "O relatório foi exportado com sucesso!",
    });
  };

  const reabrirEditor = (auditoria: Auditoria) => {
    navigate(`/admin/auditoria-imca?nome=${encodeURIComponent(auditoria.nome_navio)}&contexto=${encodeURIComponent(auditoria.contexto)}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Histórico de Auditorias IMCA</h1>
        <Button onClick={() => navigate("/admin/auditoria-imca")}>
          Nova Auditoria
        </Button>
      </div>

      <div>
        <Label>Filtrar por navio</Label>
        <Input
          placeholder="Nome do navio..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando auditorias...</p>
        </div>
      ) : auditoriasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {filtro
                ? "Nenhuma auditoria encontrada com esse filtro."
                : "Nenhuma auditoria cadastrada ainda."}
            </p>
            {!filtro && (
              <Button
                className="mt-4"
                onClick={() => navigate("/admin/auditoria-imca")}
              >
                Criar primeira auditoria
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        auditoriasFiltradas.map((auditoria) => (
          <Card key={auditoria.id} className="mt-4">
            <CardContent className="space-y-2 pt-6">
              <h2 className="text-lg font-semibold">{auditoria.nome_navio}</h2>
              <p className="text-sm text-gray-500">
                {new Date(auditoria.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <Textarea
                readOnly
                value={auditoria.relatorio}
                className="w-full h-[300px] font-mono text-sm"
              />

              <div className="flex gap-2 pt-2">
                <Button onClick={() => exportarPDF(auditoria)}>
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reabrirEditor(auditoria)}
                >
                  Reabrir no Editor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
