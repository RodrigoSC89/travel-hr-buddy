import { WifiOff, RefreshCw, CheckCircle, Database, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">📡 Modo Offline</CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            Você está atualmente sem conexão com a internet. Algumas funcionalidades podem estar
            indisponíveis.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-slate-400 mb-6">
              Por favor, verifique sua conexão com a internet e tente novamente.
            </p>

            <Button
              onClick={handleReload}
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </Button>
          </div>

          <div className="border-t border-slate-700 pt-6 mt-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Funcionalidades Offline Disponíveis:
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-300">
                <Database className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Dados em Cache Local</p>
                  <p className="text-sm text-slate-400">
                    Acesse informações previamente carregadas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <RefreshCcw className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Sincronização Automática</p>
                  <p className="text-sm text-slate-400">
                    Suas alterações serão sincronizadas quando você voltar online
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Funcionalidades Básicas</p>
                  <p className="text-sm text-slate-400">
                    Navegue pelo conteúdo já carregado e visualize dados salvos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              💡 <strong className="text-slate-300">Dica:</strong> O Nautilus One funciona como um
              PWA (Progressive Web App). Você pode instalá-lo em seu dispositivo para ter acesso
              rápido mesmo quando offline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
