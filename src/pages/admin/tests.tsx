import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { TestTube } from "lucide-react";

export default function TestDashboard() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/coverage/lcov-report/index.html")
      .then((res) => res.text())
      .then((html) => {
        const match = html.match(/<span class='strong'>(\d+)%<\/span>/);
        if (match) {
          setLogs([`Cobertura total atual: ${match[1]}%`]);
        }
      })
      .catch(() => {
        setLogs(["Relatório de cobertura não disponível. Execute 'npm run test:coverage' para gerar."]);
      });
  }, []);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={TestTube}
          title="Painel de Testes Automatizados"
          description="Visualize a cobertura de testes e relatórios de execução"
          gradient="blue"
        />

        <Card>
          <CardHeader>
            <CardTitle>Logs de Cobertura</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-48">
              {logs.map((log, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {log}
                </p>
              ))}
            </ScrollArea>
            <Separator className="my-4" />
            <a
              className="text-blue-600 hover:underline text-sm"
              href="/coverage/index.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              📊 Ver relatório de cobertura HTML completo
            </a>
          </CardContent>
        </Card>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
