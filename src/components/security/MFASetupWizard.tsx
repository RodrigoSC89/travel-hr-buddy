/**
 * MFA Setup Wizard Component
 * Phase 3: Enterprise Security - Multi-Factor Authentication Setup
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Shield,
  Smartphone,
  Key,
  Mail,
  Check,
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  Copy,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { mfaEngine, type MFAEnrollment, type MFAMethod } from "@/lib/security/mfa-engine";

interface MFASetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  requiredMethods?: MFAMethod[];
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: WizardStep[] = [
  {
    id: "select",
    title: "Selecionar Método",
    description: "Escolha seu método de autenticação preferido",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "setup",
    title: "Configurar",
    description: "Configure o método selecionado",
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: "verify",
    title: "Verificar",
    description: "Teste sua configuração",
    icon: <Check className="h-5 w-5" />,
  },
  {
    id: "backup",
    title: "Códigos de Backup",
    description: "Salve seus códigos de recuperação",
    icon: <Copy className="h-5 w-5" />,
  },
];

const MFA_METHODS = [
  {
    id: "totp" as MFAMethod,
    name: "Authenticator App",
    description: "Google Authenticator, Authy, Microsoft Authenticator",
    icon: <Smartphone className="h-6 w-6" />,
    recommended: true,
  },
  {
    id: "webauthn" as MFAMethod,
    name: "Chave de Segurança / Passkey",
    description: "YubiKey, Touch ID, Face ID, Windows Hello",
    icon: <Fingerprint className="h-6 w-6" />,
    recommended: true,
  },
  {
    id: "email" as MFAMethod,
    name: "Código por Email",
    description: "Receba um código no seu email",
    icon: <Mail className="h-6 w-6" />,
    recommended: false,
  },
];

export function MFASetupWizard({
  onComplete,
  onCancel,
  requiredMethods,
}: MFASetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [enrollment, setEnrollment] = useState<MFAEnrollment | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const enrollTOTP = async () => {
    setIsLoading(true);
    try {
      const result = await mfaEngine.enrollTOTP("Authenticator App");
      if (result) {
        setEnrollment(result);
      } else {
        toast.error("Erro ao configurar TOTP");
      }
    } catch (error) {
      toast.error("Erro ao gerar configuração TOTP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const enrollWebAuthn = async () => {
    setIsLoading(true);
    try {
      const result = await mfaEngine.enrollWebAuthn();
      if (result) {
        setIsVerified(true);
        setEnrollment(result);
        toast.success("Passkey registrada com sucesso!");
        // Generate backup codes
        const codes = await mfaEngine.generateBackupCodes();
        setBackupCodes(codes);
      } else {
        toast.error("Falha ao registrar passkey");
      }
    } catch (error) {
      toast.error("Erro ao configurar WebAuthn");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (verificationCode.length !== 6 || !enrollment) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }

    setIsLoading(true);
    try {
      const result = await mfaEngine.verifyTOTPEnrollment(enrollment.id, verificationCode);
      if (result.success) {
        setIsVerified(true);
        toast.success("Código verificado com sucesso!");
        // Generate backup codes
        const codes = await mfaEngine.generateBackupCodes();
        setBackupCodes(codes);
      } else {
        toast.error(result.error || "Código inválido. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao verificar código");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method: MFAMethod) => {
    setSelectedMethod(method);
    setCurrentStep(1);

    // Initialize setup based on method
    if (method === "totp") {
      enrollTOTP();
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
    toast.success("Códigos copiados para a área de transferência");
  };

  const handleFinish = async () => {
    if (!backupCodesCopied) {
      toast.warning("Por favor, copie os códigos de backup antes de continuar");
      return;
    }
    toast.success("MFA ativado com sucesso!");
    onComplete();
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case "select":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center mb-6">
              A autenticação multifator adiciona uma camada extra de segurança à sua conta.
            </p>
            <div className="grid gap-3">
              {MFA_METHODS.map((method) => {
                const isDisabled = requiredMethods && !requiredMethods.includes(method.id);
                return (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                    onClick={() => !isDisabled && handleMethodSelect(method.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors text-left w-full ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : "hover:bg-accent hover:border-primary cursor-pointer"
                    } ${selectedMethod === method.id ? "border-primary bg-primary/5" : ""}`}
                  >
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "setup":
        return (
          <div className="space-y-6">
            {selectedMethod === "totp" && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Escaneie o QR Code com seu aplicativo autenticador
                </p>
                {enrollment?.totp ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCodeSVG value={enrollment.totp.uri} size={200} level="H" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Ou digite manualmente o código:
                      </p>
                      <div className="flex items-center gap-2 justify-center">
                        <code className="px-3 py-2 bg-muted rounded font-mono text-sm">
                          {enrollment.totp.secret}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(enrollment.totp!.secret);
                            toast.success("Código copiado");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleNext} className="mt-4">
                      Próximo <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            {selectedMethod === "webauthn" && (
              <div className="text-center space-y-6">
                <div className="p-6 rounded-full bg-primary/10 w-fit mx-auto">
                  <Fingerprint className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Use sua impressão digital, Face ID ou chave de segurança física
                  </p>
                </div>
                {!isVerified ? (
                  <Button onClick={enrollWebAuthn} disabled={isLoading} size="lg">
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Fingerprint className="h-4 w-4 mr-2" />
                    )}
                    Registrar Passkey
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span>Passkey registrada com sucesso!</span>
                    </div>
                    <Button onClick={handleNext}>
                      Próximo <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === "email" && (
              <div className="text-center space-y-6">
                <div className="p-6 rounded-full bg-primary/10 w-fit mx-auto">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Um código será enviado para seu email cadastrado
                </p>
                <Button onClick={handleNext}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case "verify":
        return (
          <div className="space-y-6">
            {selectedMethod === "totp" && (
              <div className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
                <div className="flex justify-center">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono w-48"
                  />
                </div>
                {!isVerified ? (
                  <Button
                    onClick={verifyTOTP}
                    disabled={verificationCode.length !== 6 || isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Verificar
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span>Verificado com sucesso!</span>
                    </div>
                    <Button onClick={handleNext}>
                      Próximo <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(selectedMethod === "webauthn" || selectedMethod === "email") && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Configuração verificada!</span>
                </div>
                <Button onClick={handleNext}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="font-medium">Salve seus códigos de backup</p>
              <p className="text-sm text-muted-foreground">
                Estes códigos podem ser usados para acessar sua conta caso você perca seu
                dispositivo de autenticação. Cada código só pode ser usado uma vez.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.length > 0 ? (
                backupCodes.map((code, index) => (
                  <code key={index} className="font-mono text-sm text-center py-1">
                    {code}
                  </code>
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground">
                  Gerando códigos...
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={copyBackupCodes} 
                className="w-full"
                disabled={backupCodes.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                {backupCodesCopied ? "Copiado!" : "Copiar códigos"}
              </Button>
              <Button onClick={handleFinish} disabled={!backupCodesCopied} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Finalizar configuração
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            {STEPS[currentStep].icon}
          </div>
        </div>
        <CardTitle>{STEPS[currentStep].title}</CardTitle>
        <CardDescription>{STEPS[currentStep].description}</CardDescription>
        <Progress value={progress} className="mt-4" />
        <div className="flex justify-center gap-1 mt-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MFASetupWizard;
