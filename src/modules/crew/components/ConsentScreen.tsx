/**
 * Consent Screen Component - Patch 150.1
 * Privacy consent and opt-out interface for crew members
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { saveConsent, saveOptOut, getConsentTimestamp, hasOptedOut } from "../ethics-guard";
import { useToast } from "@/hooks/use-toast";

interface ConsentScreenProps {
  userId: string;
  userName: string;
  onConsentGiven: () => void;
  onOptOut: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  userId,
  userName,
  onConsentGiven,
  onOptOut,
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const { toast } = useToast();

  const handleGiveConsent = () => {
    if (!hasReadTerms || !hasAgreed) {
      toast({
        title: "Ação Necessária",
        description: "Por favor, leia e aceite os termos para continuar",
        variant: "destructive",
      });
      return;
    }

    saveConsent(userId, true);
    toast({
      title: "Consentimento Registrado",
      description: "Seus dados serão protegidos e anonimizados",
    });
    onConsentGiven();
  };

  const handleOptOut = () => {
    saveOptOut(userId, true);
    toast({
      title: "Opt-Out Registrado",
      description: "Você não participará do programa de bem-estar",
    });
    onOptOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl">Proteção de Dados e Privacidade</CardTitle>
              <CardDescription className="text-slate-400">
                Programa de Bem-Estar da Tripulação
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Tripulante</p>
            <p className="text-white font-medium">{userName}</p>
          </div>

          {/* Privacy Features */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-400" />
              Como Protegemos Seus Dados
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Anonimização Automática</p>
                  <p className="text-sm text-slate-400">
                    Seu nome é automaticamente anonimizado ao salvar check-ins de humor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Criptografia de Dados</p>
                  <p className="text-sm text-slate-400">
                    Notas e comentários são protegidos com criptografia antes do envio
                  </p>
                  <p className="text-xs text-orange-400 mt-1">
                    ⚠️ DEMO: Implementação de produção usará AES256
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Acesso Restrito</p>
                  <p className="text-sm text-slate-400">
                    Apenas profissionais autorizados podem acessar dados identificáveis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Direito ao Esquecimento</p>
                  <p className="text-sm text-slate-400">
                    Você pode solicitar a exclusão completa de seus dados a qualquer momento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-3">
              <Checkbox
                id="read-terms"
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="read-terms" className="text-sm text-slate-300 cursor-pointer">
                Li e compreendi como meus dados serão protegidos e utilizados no programa de bem-estar
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agree-terms"
                checked={hasAgreed}
                onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                className="mt-1"
                disabled={!hasReadTerms}
              />
              <label htmlFor="agree-terms" className="text-sm text-slate-300 cursor-pointer">
                Concordo em participar do programa de bem-estar e autorizo o processamento anonimizado de meus dados
              </label>
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-950 border-blue-800">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-100">Participação Voluntária</AlertTitle>
            <AlertDescription className="text-blue-200">
              Sua participação é completamente voluntária. Você pode optar por não participar ou revogar seu consentimento a qualquer momento sem qualquer prejuízo.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            onClick={handleGiveConsent}
            disabled={!hasReadTerms || !hasAgreed}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Aceitar e Continuar
          </Button>
          
          <Button
            onClick={handleOptOut}
            variant="outline"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            size="lg"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Não Participar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

/**
 * Opt-Out Settings Component
 * Allows users to manage their privacy preferences
 */
interface OptOutSettingsProps {
  userId: string;
  userName: string;
  onOptOutChange: (optedOut: boolean) => void;
}

export const OptOutSettings: React.FC<OptOutSettingsProps> = ({
  userId,
  userName,
  onOptOutChange,
}) => {
  const [isOptedOut, setIsOptedOut] = useState(hasOptedOut(userId));
  const { toast } = useToast();

  const handleToggleOptOut = () => {
    const newOptOutState = !isOptedOut;
    saveOptOut(userId, newOptOutState);
    setIsOptedOut(newOptOutState);
    
    toast({
      title: newOptOutState ? "Opt-Out Ativado" : "Opt-Out Desativado",
      description: newOptOutState 
        ? "Você não participará mais do programa"
        : "Você voltou a participar do programa",
    });

    onOptOutChange(newOptOutState);
  };

  const consentDate = getConsentTimestamp(userId);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configurações de Privacidade
        </CardTitle>
        <CardDescription className="text-slate-400">
          Gerencie suas preferências de participação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Status de Participação</span>
            <Badge variant={isOptedOut ? "destructive" : "default"}>
              {isOptedOut ? "Não Participando" : "Participando"}
            </Badge>
          </div>
          {consentDate && (
            <p className="text-xs text-slate-400">
              Consentimento dado em: {new Date(consentDate).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        <Button
          onClick={handleToggleOptOut}
          variant={isOptedOut ? "default" : "destructive"}
          className="w-full"
        >
          {isOptedOut ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Voltar a Participar
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Parar de Participar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
