import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { 
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Brain,
  Loader2,
  AlertCircle,
  Download,
  RotateCcw,
  Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  userAnswer?: string;
}

interface QuizConfig {
  standard: string;
  difficulty: string;
}

const STANDARDS = ["SGSO", "IMCA", "ISO", "ANP", "ISM Code", "ISPS Code"];
const DIFFICULTIES = ["Basic", "Intermediate", "Advanced"];
const QUESTIONS_PER_QUIZ = 10;
const PASSING_SCORE = 7; // 70%

export default function QuizPage() {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ standard: "", difficulty: "" });
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = quizStarted ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const passed = score >= PASSING_SCORE;

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);

      // Try to fetch from templates first
      const { data: templates, error } = await supabase
        .from("quiz_templates")
        .select("*")
        .eq("standard", quizConfig.standard)
        .eq("difficulty", quizConfig.difficulty)
        .eq("is_active", true)
        .limit(QUESTIONS_PER_QUIZ);

      if (error) throw error;

      if (templates && templates.length >= QUESTIONS_PER_QUIZ) {
        // Use template questions
        const quizQuestions: Question[] = templates.map(t => ({
          question: t.question,
          options: t.options as string[],
          correct_answer: t.correct_answer,
          explanation: t.explanation
        }));
        setQuestions(quizQuestions);
      } else {
        // Generate fallback questions
        const fallbackQuestions = generateFallbackQuestions(
          quizConfig.standard,
          quizConfig.difficulty
        );
        setQuestions(fallbackQuestions);
      }

      setQuizStarted(true);
      setStartTime(new Date());
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      // Use fallback questions on error
      const fallbackQuestions = generateFallbackQuestions(
        quizConfig.standard,
        quizConfig.difficulty
      );
      setQuestions(fallbackQuestions);
      setQuizStarted(true);
      setStartTime(new Date());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackQuestions = (standard: string, difficulty: string): Question[] => {
    // Simplified fallback question generation
    const baseQuestions: Question[] = [
      {
        question: `What is the primary focus of ${standard}?`,
        options: [
          "Safety and compliance management",
          "Cost reduction",
          "Marketing strategies",
          "Administrative tasks"
        ],
        correct_answer: "Safety and compliance management",
        explanation: `${standard} focuses primarily on safety and compliance in maritime operations.`
      },
      {
        question: `${standard} applies to which industry?`,
        options: [
          "Maritime and offshore",
          "Agriculture",
          "Retail",
          "Entertainment"
        ],
        correct_answer: "Maritime and offshore",
        explanation: `${standard} is specifically designed for maritime and offshore operations.`
      },
      {
        question: `Who must comply with ${standard} standards?`,
        options: [
          "All relevant personnel and vessels",
          "Only management",
          "Only external auditors",
          "Only government agencies"
        ],
        correct_answer: "All relevant personnel and vessels",
        explanation: `Compliance with ${standard} is required for all relevant personnel and vessels.`
      }
    ];

    // Generate 10 questions (simplified)
    const allQuestions: Question[] = [];
    for (let i = 0; i < QUESTIONS_PER_QUIZ; i++) {
      const baseQ = baseQuestions[i % baseQuestions.length];
      allQuestions.push({
        ...baseQ,
        question: `${baseQ.question} (Question ${i + 1})`
      });
    }

    return allQuestions;
  };

  const handleAnswerSelect = () => {
    if (!selectedAnswer || !currentQuestion) return;

    // Record answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].userAnswer = selectedAnswer;
    setQuestions(updatedQuestions);

    // Check if correct
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
    } else {
      completeQuiz(updatedQuestions);
    }
  };

  const completeQuiz = async (finalQuestions: Question[]) => {
    setQuizCompleted(true);
    const endTime = new Date();
    const durationSeconds = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      // Save quiz result
      const { data: result, error } = await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          organization_id: profile?.organization_id,
          standard: quizConfig.standard,
          difficulty: quizConfig.difficulty,
          questions: finalQuestions,
          score,
          total_questions: questions.length,
          passed: score >= PASSING_SCORE,
          started_at: startTime?.toISOString(),
          duration_seconds: durationSeconds,
          ai_generated: false
        })
        .select()
        .single();

      if (error) throw error;

      // Generate certificate if passed
      if (score >= PASSING_SCORE && result) {
        const { data: certData } = await supabase.rpc("generate_certificate_id", {
          p_result_id: result.id
        });
        
        if (certData) {
          setCertificateId(certData);
        }
      }
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setStartTime(null);
    setCertificateId(null);
    setQuizConfig({ standard: "", difficulty: "" });
  };

  // Configuration screen
  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>AI-Powered Maritime Compliance Quiz</CardTitle>
                <CardDescription>
                  Test your knowledge and earn certificates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="standard">Select Standard</Label>
                <Select
                  value={quizConfig.standard}
                  onValueChange={(value) => setQuizConfig({ ...quizConfig, standard: value })}
                >
                  <SelectTrigger id="standard">
                    <SelectValue placeholder="Choose a standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARDS.map(std => (
                      <SelectItem key={std} value={std}>{std}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Select Difficulty</Label>
                <Select
                  value={quizConfig.difficulty}
                  onValueChange={(value) => setQuizConfig({ ...quizConfig, difficulty: value })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Choose difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Target className="h-4 w-4" />
              <AlertTitle>Quiz Information</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>{QUESTIONS_PER_QUIZ} questions</li>
                  <li>Passing score: {PASSING_SCORE}/{QUESTIONS_PER_QUIZ} (70%)</li>
                  <li>Certificate awarded upon passing</li>
                  <li>Questions are randomly selected</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              size="lg"
              onClick={fetchQuizQuestions}
              disabled={!quizConfig.standard || !quizConfig.difficulty || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (quizCompleted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="text-center">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              )}
              <CardTitle className="text-3xl">
                {passed ? "Congratulations!" : "Quiz Complete"}
              </CardTitle>
              <CardDescription>
                {passed 
                  ? "You have passed the quiz and earned a certificate!"
                  : "Keep practicing to improve your score"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground">
                {Math.round((score / questions.length) * 100)}% Correct
              </p>
            </div>

            <Separator />

            {passed && certificateId && (
              <Alert className="bg-green-50 border-green-200">
                <Award className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Certificate Earned</AlertTitle>
                <AlertDescription className="text-green-800">
                  Certificate ID: <code className="font-mono">{certificateId}</code>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Review Your Answers:</h3>
              {questions.map((q, idx) => {
                const isCorrect = q.userAnswer === q.correct_answer;
                return (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">Question {idx + 1}: {q.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {q.userAnswer}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {q.correct_answer}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button onClick={restartQuiz} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Quiz
              </Button>
              {passed && certificateId && (
                <Button variant="default" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{quizConfig.standard}</Badge>
              <Badge variant="secondary">{quizConfig.difficulty}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Question {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {currentQuestion?.question}
            </h3>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {currentQuestion?.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleAnswerSelect}
            disabled={!selectedAnswer}
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
