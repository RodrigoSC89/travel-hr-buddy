import { useState } from "react";
import { querySimilarJobs } from "@/lib/ai/copilot/querySimilarJobs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface SimilarJobMetadata {
  job_id?: string;
  title: string;
  component_id: string;
  created_at: string;
  ai_suggestion?: string;
  similarity?: number;
}

interface SimilarExample {
  metadata: SimilarJobMetadata;
}

export default function SimilarExamples({ input }: { input: string }) {
  const [examples, setExamples] = useState<SimilarExample[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExamples = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await querySimilarJobs(input);
      setExamples(result || []);
    } catch (err) {
      console.error("Erro ao buscar exemplos:", err);
      setExamples([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={fetchExamples} disabled={loading || !input.trim()}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Buscando exemplos...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            🔍 Ver exemplos semelhantes
          </>
        )}
      </Button>

      {examples.length > 0 && (
        <div className="mt-4 grid gap-4">
          {examples.map((job, i) => (
            <Card key={i} className="p-4 shadow">
              <h3 className="font-semibold text-lg">🔧 {job.metadata.title}</h3>
              <p><strong>Componente:</strong> {job.metadata.component_id}</p>
              <p><strong>Data:</strong> {new Date(job.metadata.created_at).toLocaleDateString()}</p>
              {job.metadata.similarity !== undefined && (
                <p className="text-sm text-gray-600">
                  <strong>Similaridade:</strong> {(job.metadata.similarity * 100).toFixed(0)}%
                </p>
              )}
              <p className="mt-2"><strong>🧠 Sugestão IA:</strong><br />{job.metadata.ai_suggestion || "N/A"}</p>
              <Button className="mt-2" variant="outline">📋 Usar como base</Button>
            </Card>
          ))}
        </div>
      )}

      {!loading && examples.length === 0 && input.trim() && (
        <div className="mt-4 p-4 text-center text-gray-500">
          Clique no botão acima para buscar exemplos semelhantes
        </div>
      )}
    </div>
  );
}
