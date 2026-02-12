/**
 * Beta Feedback Form - Interactive Survey Page
 * Collects beta tester feedback and saves to Supabase
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/utils/production-logger";
import { User, Star, Bug, Lightbulb, Heart, ChevronRight, ChevronLeft, Send, CheckCircle } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  company: z.string().optional(),
  role: z.string().optional(),
  vessel_type: z.string().optional(),
  years_experience: z.number().optional(),
  overall_rating: z.number().min(1).max(10),
  would_recommend: z.string(),
  top_features: z.array(z.string()).optional(),
  time_saver_feature: z.string().optional(),
  best_ai_feature: z.string().optional(),
  most_frustrating: z.string().optional(),
  feature_not_working: z.string().optional(),
  would_stop_using: z.string().optional(),
  bugs_encountered: z.array(z.string()).optional(),
  error_frequency: z.string().optional(),
  missing_features: z.array(z.string()).optional(),
  top_feature_request: z.string().optional(),
  onboarding_rating: z.number().min(1).max(10),
  interface_rating: z.number().min(1).max(10),
  mobile_experience: z.string().optional(),
  hours_per_week: z.string().optional(),
  modules_used: z.array(z.string()).optional(),
  would_pay: z.string().optional(),
  fair_price: z.string().optional(),
  fix_before_launch: z.string().optional(),
  reason_to_use: z.string().optional(),
  other_comments: z.string().optional(),
  willing_testimonial: z.boolean().optional(),
  testimonial_text: z.string().optional(),
  can_contact: z.boolean().optional(),
  contact_method: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const MODULES = [
  "Fleet Command",
  "AI Command Center",
  "PEOTRAM Compliance",
  "PEO-DP Audits",
  "Operations Command",
  "Crew Management",
  "Document Management",
  "Analytics Dashboard",
  "SGSO Integration",
  "Voice Assistant",
  "Maritime Maps",
  "Maintenance Planning",
];

const STEPS = [
  { id: 1, title: "Sobre Você", icon: User },
  { id: 2, title: "Experiência", icon: Star },
  { id: 3, title: "Problemas", icon: Bug },
  { id: 4, title: "Sugestões", icon: Lightbulb },
  { id: 5, title: "Finalização", icon: Heart },
];

export default function BetaFeedback() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overall_rating: 7,
      onboarding_rating: 7,
      interface_rating: 7,
      would_recommend: "probably",
      top_features: [],
      modules_used: [],
      bugs_encountered: [],
      missing_features: [],
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- beta_feedback not in generated types
      const { error } = await (supabase.from as Function)("beta_feedback").insert({
        ...data,
        modules_used: selectedModules,
      });

      if (error) throw error;

      toast.success("Feedback enviado com sucesso! Obrigado por participar do beta.");
      setIsSubmitted(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error submitting feedback:", { error: errorMessage });
      toast.error("Erro ao enviar feedback: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Obrigado pelo seu feedback!</h1>
            <p className="text-muted-foreground mb-6">
              Sua opinião é extremamente valiosa para nós. Usaremos seus comentários para melhorar o Nautilus One.
            </p>
            <Button onClick={() => navigate("/")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Beta Feedback</h1>
          <p className="text-muted-foreground">Ajude-nos a melhorar o Nautilus One</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-green-100 text-green-600"
                      : "bg-muted"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && "Conte-nos um pouco sobre você"}
                {currentStep === 2 && "Como foi sua experiência com o Nautilus One?"}
                {currentStep === 3 && "Encontrou algum problema?"}
                {currentStep === 4 && "O que podemos melhorar?"}
                {currentStep === 5 && "Últimas perguntas"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: About You */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input {...form.register("name")} placeholder="Seu nome" />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input {...form.register("company")} placeholder="Nome da empresa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Input {...form.register("role")} placeholder="Seu cargo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vessel_type">Tipo de Embarcação</Label>
                      <Input {...form.register("vessel_type")} placeholder="Ex: AHTS, PSV, FPSO" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Anos de Experiência: {form.watch("years_experience") || 0}</Label>
                    <Slider
                      value={[form.watch("years_experience") || 0]}
                      onValueChange={([value]) => form.setValue("years_experience", value)}
                      max={40}
                      step={1}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Experience */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>Avaliação Geral: {form.watch("overall_rating")}/10</Label>
                      <Slider
                        value={[form.watch("overall_rating")]}
                        onValueChange={([value]) => form.setValue("overall_rating", value)}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Você recomendaria o Nautilus One?</Label>
                      <RadioGroup
                        value={form.watch("would_recommend")}
                        onValueChange={(value) => form.setValue("would_recommend", value)}
                        className="mt-2 space-y-2"
                      >
                        {[
                          { value: "yes_definitely", label: "Sim, definitivamente" },
                          { value: "probably", label: "Provavelmente" },
                          { value: "not_sure", label: "Não tenho certeza" },
                          { value: "probably_not", label: "Provavelmente não" },
                          { value: "no_definitely_not", label: "Não" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Onboarding: {form.watch("onboarding_rating")}/10</Label>
                        <Slider
                          value={[form.watch("onboarding_rating")]}
                          onValueChange={([value]) => form.setValue("onboarding_rating", value)}
                          min={1}
                          max={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Interface: {form.watch("interface_rating")}/10</Label>
                        <Slider
                          value={[form.watch("interface_rating")]}
                          onValueChange={([value]) => form.setValue("interface_rating", value)}
                          min={1}
                          max={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Módulos utilizados</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MODULES.map((module) => (
                          <div key={module} className="flex items-center space-x-2">
                            <Checkbox
                              id={module}
                              checked={selectedModules.includes(module)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedModules([...selectedModules, module]);
                                } else {
                                  setSelectedModules(selectedModules.filter((m) => m !== module));
                                }
                              }}
                            />
                            <Label htmlFor={module} className="text-sm">{module}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Problems */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>O que foi MAIS frustrante?</Label>
                      <Textarea
                        {...form.register("most_frustrating")}
                        placeholder="Descreva sua maior frustração..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Qual funcionalidade não funcionou como esperado?</Label>
                      <Textarea
                        {...form.register("feature_not_working")}
                        placeholder="Descreva o problema..."
                      />
                    </div>

                    <div>
                      <Label>Com que frequência você encontrou erros?</Label>
                      <RadioGroup
                        value={form.watch("error_frequency") || "rarely"}
                        onValueChange={(value) => form.setValue("error_frequency", value)}
                        className="mt-2 space-y-2"
                      >
                        {[
                          { value: "never", label: "Nunca" },
                          { value: "rarely", label: "Raramente (1-2 vezes no total)" },
                          { value: "occasionally", label: "Ocasionalmente (1-2 vezes/semana)" },
                          { value: "frequently", label: "Frequentemente (diariamente)" },
                          { value: "constantly", label: "Constantemente" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`freq-${option.value}`} />
                            <Label htmlFor={`freq-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Suggestions */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Qual funcionalidade está FALTANDO?</Label>
                      <Textarea
                        {...form.register("top_feature_request")}
                        placeholder="Se pudesse adicionar UMA funcionalidade, qual seria?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>O que devemos corrigir ANTES do lançamento?</Label>
                      <Textarea
                        {...form.register("fix_before_launch")}
                        placeholder="O que é crítico corrigir?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Qual o principal motivo para usar o Nautilus?</Label>
                      <Textarea
                        {...form.register("reason_to_use")}
                        placeholder="O que mais te atrai no sistema?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Outros comentários</Label>
                      <Textarea
                        {...form.register("other_comments")}
                        placeholder="Algo mais que gostaria de compartilhar?"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 5: Finalization */}
              {currentStep === 5 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label>Você pagaria pelo Nautilus One após o beta?</Label>
                      <RadioGroup
                        value={form.watch("would_pay") || "need_pricing"}
                        onValueChange={(value) => form.setValue("would_pay", value)}
                        className="mt-2 space-y-2"
                      >
                        {[
                          { value: "yes_definitely", label: "Sim, definitivamente" },
                          { value: "probably_yes", label: "Provavelmente sim" },
                          { value: "need_pricing", label: "Preciso ver o preço" },
                          { value: "probably_not", label: "Provavelmente não" },
                          { value: "no", label: "Não" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`pay-${option.value}`} />
                            <Label htmlFor={`pay-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="willing_testimonial"
                        checked={form.watch("willing_testimonial")}
                        onCheckedChange={(checked) => form.setValue("willing_testimonial", !!checked)}
                      />
                      <Label htmlFor="willing_testimonial">
                        Gostaria de fornecer um depoimento para nosso site?
                      </Label>
                    </div>

                    {form.watch("willing_testimonial") && (
                      <div className="space-y-2">
                        <Label>Seu depoimento</Label>
                        <Textarea
                          {...form.register("testimonial_text")}
                          placeholder="Escreva seu depoimento (1-2 frases)..."
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_contact"
                        checked={form.watch("can_contact")}
                        onCheckedChange={(checked) => form.setValue("can_contact", !!checked)}
                      />
                      <Label htmlFor="can_contact">
                        Podemos entrar em contato para follow-up?
                      </Label>
                    </div>

                    {form.watch("can_contact") && (
                      <div className="space-y-2">
                        <Label>Método de contato preferido</Label>
                        <Input
                          {...form.register("contact_method")}
                          placeholder="Email ou telefone"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
