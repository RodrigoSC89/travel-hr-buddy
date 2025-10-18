import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Award, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizData {
  quiz_type: string;
  norm_reference: string;
  clause_reference?: string;
  difficulty_level: string;
  questions: QuizQuestion[];
}

interface QuizTakerProps {
  quizData: QuizData;
  onComplete?: (score: number, passed: boolean) => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quizData, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const question = quizData.questions[currentQuestion];
  const totalQuestions = quizData.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[question.id]) {
      toast.error("Por favor, selecione uma resposta");
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const passed = score >= 80;

    try {
      // Save quiz result to database
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      const { error } = await supabase.from("quiz_results").insert({
        crew_id: user.user.id,
        organization_id: profile?.organization_id,
        quiz_type: quizData.quiz_type,
        norm_reference: quizData.norm_reference,
        clause_reference: quizData.clause_reference,
        quiz_data: quizData,
        answers: answers,
        score: score,
        passed: passed,
        time_taken_seconds: timeTaken,
      });

      if (error) throw error;

      setShowResults(true);

      if (passed) {
        toast.success("Parabéns! Você foi aprovado!");
      } else {
        toast.error("Você não atingiu a pontuação mínima (80%)");
      }

      if (onComplete) {
        onComplete(score, passed);
      }
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast.error("Erro ao salvar resultado");
    }
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 80;

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Award className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Parabéns! Você passou!" : "Não foi dessa vez"}
          </CardTitle>
          <CardDescription>
            Sua pontuação: {score}% (Mínimo: 80%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {quizData.questions.map((q) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <Card key={q.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                  <CardHeader>
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-base">{q.question}</CardTitle>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <strong>Sua resposta:</strong> {userAnswer || "Não respondida"}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600">
                              <strong>Resposta correta:</strong> {q.correct_answer}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {passed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-green-800">
                🎓 Certificado de conclusão será emitido em breve!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Questão {currentQuestion + 1} de {totalQuestions}
          </Badge>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {quizData.norm_reference}
          </Badge>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="text-lg">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={answers[question.id] || ""}
          onValueChange={(value) => handleAnswer(question.id, value)}
        >
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={letter} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          <Button onClick={handleNext}>
            {currentQuestion < totalQuestions - 1 ? "Próxima" : "Finalizar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTaker;
