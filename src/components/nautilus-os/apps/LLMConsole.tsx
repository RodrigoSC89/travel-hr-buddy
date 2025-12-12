import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nautilusRespond } from "@/lib/ai/nautilusLLM";
import { useToast } from "@/hooks/use-toast";

export const LLMConsole = memo(function() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await nautilusRespond({ prompt });
      setResponse(result.response);
      setPrompt("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao comunicar com a IA",
        variant: "destructive",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={handleChange}
          placeholder="Digite seu comando..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {response && (
        <div className="p-3 bg-background/50 rounded-lg border border-border/30 text-sm">
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
