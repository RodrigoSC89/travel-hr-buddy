import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QuizTaker from "@/components/quiz/QuizTaker";

const QuizPage = () => {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [formData, setFormData] = useState({
    quiz_type: "IMCA",
    norm_reference: "IMCA M117",
    clause_reference: "",
    difficulty_level: "intermediate",
    num_questions: 5,
  });

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const response = await supabase.functions.invoke("generate-quiz", {
        body: formData,
      });

      if (response.error) throw response.error;

      if (response.data?.success) {
        setQuizData(response.data.quiz);
        toast.success("Quiz gerado com sucesso!");
      } else {
        throw new Error(response.data?.error || "Erro ao gerar quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Erro ao gerar quiz com IA");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (passed) {
      toast.success(`Parabéns! Você obteve ${score}% e passou no quiz!`);
    } else {
      toast.error(`Você obteve ${score}%. Tente novamente!`);
    }
    // Reset quiz data to allow generating a new quiz
    setTimeout(() => {
      setQuizData(null);
    }, 5000);
  };

  if (quizData) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <QuizTaker quizData={quizData} onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Quiz de Avaliação de Conformidade
        </h1>
        <p className="text-muted-foreground mt-2">
          Gere quizzes personalizados com IA para avaliar conhecimento em normas e regulamentações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Quiz</CardTitle>
          <CardDescription>
            Configure os parâmetros do quiz e gere perguntas com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiz_type">Tipo de Quiz</Label>
              <Select
                value={formData.quiz_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, quiz_type: value }))
                }
              >
                <SelectTrigger id="quiz_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SGSO">SGSO</SelectItem>
                  <SelectItem value="IMCA">IMCA</SelectItem>
                  <SelectItem value="ISO">ISO</SelectItem>
                  <SelectItem value="ANP">ANP</SelectItem>
                  <SelectItem value="ISM">ISM Code</SelectItem>
                  <SelectItem value="ISPS">ISPS Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="norm_reference">Norma/Referência</Label>
              <Input
                id="norm_reference"
                value={formData.norm_reference}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, norm_reference: e.target.value }))
                }
                placeholder="Ex: IMCA M117, ISO 9001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clause_reference">Cláusula (Opcional)</Label>
              <Input
                id="clause_reference"
                value={formData.clause_reference}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clause_reference: e.target.value }))
                }
                placeholder="Ex: 4.2.1, Anexo II"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level">Nível de Dificuldade</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, difficulty_level: value }))
                }
              >
                <SelectTrigger id="difficulty_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_questions">Número de Perguntas</Label>
              <Select
                value={formData.num_questions.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, num_questions: parseInt(value) }))
                }
              >
                <SelectTrigger id="num_questions">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 perguntas</SelectItem>
                  <SelectItem value="5">5 perguntas</SelectItem>
                  <SelectItem value="10">10 perguntas</SelectItem>
                  <SelectItem value="15">15 perguntas</SelectItem>
                  <SelectItem value="20">20 perguntas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuiz}
            disabled={loading || !formData.norm_reference}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando quiz com IA...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Gerar Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre os Quizzes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Os quizzes são gerados automaticamente por IA com base nas normas especificadas
          </p>
          <p>• A pontuação mínima para aprovação é de 80%</p>
          <p>• Certificados são emitidos automaticamente para quizzes aprovados</p>
          <p>• Todas as respostas incluem explicações técnicas detalhadas</p>
          <p>• Os resultados são salvos e podem ser consultados no seu histórico</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;
