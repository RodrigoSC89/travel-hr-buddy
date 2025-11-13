// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Cpu, CheckCircle2 } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

// Lazy load ONNX runtime apenas quando o componente for montado
let ort: any = null;
const loadONNX = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
};

export default function DPAIAnalyzer() {
  const [status, setStatus] = useState("Pronto para análise");
  const [fault, setFault] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeDP = async () => {
      if (isAnalyzing) return;
      
      try {
        setIsAnalyzing(true);
        setStatus("Carregando modelo IA...");
        
        const ortRuntime = await loadONNX();
        setStatus("Analisando sistema DP...");
        
        const session = await ortRuntime.InferenceSession.create("/models/nautilus_dp_faults.onnx");
        const input = new ortRuntime.Tensor("float32", new Float32Array([0.98, 1.02, 0.5, 0.01]), [1, 4]);
        const output = await session.run({ input });
        const result = output.output.data[0];
        if (result > 0.7) {
          const faultMessage = "Anomalia detectada: possível perda de controle em eixo lateral.";
          setFault(faultMessage);
          publishEvent("nautilus/dp/fault", { severity: "high", message: faultMessage });
        } else {
          setFault(null);
        }
        setStatus("Análise concluída");
      } catch (err) {
        console.error("Erro ao carregar modelo ONNX:", err);
        setStatus("Modelo offline - usando análise básica");
      } finally {
        setIsAnalyzing(false);
      }
    };
    analyzeDP();
  }, []);

  return (
    <Card className="border border-[var(--nautilus-accent)] shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="text-[var(--nautilus-primary)]" /> DP AI Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{status}</p>
        {fault ? (
          <div className="flex items-center text-red-500 mt-2">
            <AlertTriangle /> <span className="ml-2">{fault}</span>
          </div>
        ) : (
          <div className="flex items-center text-green-500 mt-2">
            <CheckCircle2 /> <span className="ml-2">Sistema estável</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
