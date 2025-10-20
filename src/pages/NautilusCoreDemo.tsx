import React, { useEffect } from "react";
import { BridgeLink } from "@/core/BridgeLink";
import { NautilusAI } from "@/ai/nautilus-core";
import { safeLazyImport } from "@/utils/safeLazyImport";

/**
 * Nautilus Core Demo - Demonstração dos componentes do Nautilus Core Alpha
 * Mostra SafeLazyImport, BridgeLink, ControlHub e NautilusAI em ação
 */
export default function NautilusCoreDemo() {
  useEffect(() => {
    // Simulate some events being emitted
    const timer = setTimeout(() => {
      BridgeLink.emit("nautilus:event", { 
        message: "🚀 Sistema Nautilus One inicializado"
      });
      
      setTimeout(() => {
        BridgeLink.emit("nautilus:event", { 
          message: "📊 Módulo MMI carregado com sucesso"
        });
      }, 1000);
      
      setTimeout(() => {
        BridgeLink.emit("nautilus:event", { 
          message: "🧠 DP Intelligence ativado"
        });
      }, 2000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleTestAI = async () => {
    const context = "Analisar eficiência dos processos de manutenção";
    const result = await NautilusAI.analyze(context);
    console.log("Resultado da IA:", result);
    
    BridgeLink.emit("nautilus:event", { 
      message: `🧩 IA: ${result}`
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">⚓ Nautilus Core Alpha - Demonstração</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de comunicação interna, carregamento seguro e IA embarcada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SafeLazyImport Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">🔄 SafeLazyImport</h2>
          <p className="text-sm text-muted-foreground">
            Carregamento dinâmico seguro para módulos com tratamento de erros automático.
          </p>
          <div className="mt-4 bg-muted p-3 rounded font-mono text-xs">
            <code>
              const Component = safeLazyImport(<br />
              &nbsp;&nbsp;() =&gt; import("./Module"),<br />
              &nbsp;&nbsp;"ModuleName"<br />
              );
            </code>
          </div>
        </div>

        {/* BridgeLink Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">📡 BridgeLink</h2>
          <p className="text-sm text-muted-foreground">
            Sistema de comunicação entre módulos via eventos CustomEvent.
          </p>
          <div className="mt-4 bg-muted p-3 rounded font-mono text-xs">
            <code>
              BridgeLink.emit("nautilus:event", data);<br />
              BridgeLink.on("nautilus:event", callback);
            </code>
          </div>
        </div>

        {/* NautilusAI Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">🧠 NautilusAI</h2>
          <p className="text-sm text-muted-foreground">
            IA embarcada (stub inicial) - Base para integração ONNX/GGML futura.
          </p>
          <div className="mt-4">
            <button
              onClick={handleTestAI}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Testar Análise da IA
            </button>
          </div>
        </div>

        {/* Vite Config Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">⚙️ Vite Config</h2>
          <p className="text-sm text-muted-foreground">
            Configuração otimizada para evitar falhas de import dinâmico.
          </p>
          <div className="mt-4 bg-muted p-3 rounded font-mono text-xs">
            <code>
              rollupOptions: &#123;<br />
              &nbsp;&nbsp;output: &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;manualChunks: undefined<br />
              &nbsp;&nbsp;&#125;<br />
              &#125;
            </code>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">📋 Status dos Componentes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-medium">SafeLazyImport</div>
            <div className="text-xs text-muted-foreground">Ativo</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-medium">BridgeLink</div>
            <div className="text-xs text-muted-foreground">Operacional</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-medium">ControlHub</div>
            <div className="text-xs text-muted-foreground">Monitorando</div>
          </div>
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <div className="text-sm font-medium">NautilusAI</div>
            <div className="text-xs text-muted-foreground">Simulando</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Nota:</strong> Para visualizar os eventos em tempo real, navegue até a página 
              <strong> Control Hub</strong> no menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
