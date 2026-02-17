/**
 * Reset Password Page
 * Handles password update after recovery email link
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import nautiLogo from "@/assets/nauti-one-logo.png";

const schema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery token
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        toast.error("Erro ao atualizar senha", { description: error.message });
      } else {
        setSuccess(true);
        toast.success("Senha atualizada com sucesso!");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch {
      toast.error("Erro inesperado", { description: "Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #040a18 0%, #0a1628 40%, #061224 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <img src={nautiLogo} alt="Nauti One" className="w-16 h-16" width={64} height={64} />
        </div>

        <Card className="border-white/10 bg-[hsla(220,40%,8%,0.95)] backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-white">
              {success ? "Senha Atualizada!" : "Redefinir Senha"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                <CheckCircle className="h-16 w-16 text-success" />
                <p className="text-white/70 text-sm">Redirecionando para o sistema...</p>
              </motion.div>
            ) : !isRecovery ? (
              <div className="text-center py-6">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-white/60 text-sm">
                  Este link expirou ou é inválido. Solicite uma nova recuperação de senha na página de login.
                </p>
                <Button className="mt-4" onClick={() => navigate("/auth")}>
                  Ir para Login
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white/80">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white/80">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30"
                      {...form.register("confirmPassword")}
                    />
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Atualizar Senha
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/10 text-white/70"
                  onClick={() => navigate("/auth")}
                >
                  Voltar para Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
