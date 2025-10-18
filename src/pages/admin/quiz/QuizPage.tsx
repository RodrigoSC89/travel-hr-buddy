import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Award, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface QuizState {
  standard: string;
  difficulty: string;
  questions: Question[];
  currentQuestion: number;
  answers: number[];
  startTime: Date;
  completed: boolean;
  score: number;
  passed: boolean;
}

const STANDARDS = ['SGSO', 'IMCA', 'ISO', 'ANP', 'ISM Code', 'ISPS Code'];
const DIFFICULTIES = ['Basic', 'Intermediate', 'Advanced'];
const PASSING_SCORE = 70;

export default function QuizPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [selectedStandard, setSelectedStandard] = useState('SGSO');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Basic');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const startQuiz = async () => {
    try {
      setGenerating(true);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Você precisa estar autenticado para fazer o quiz.',
        });
        return;
      }

      // Call edge function to generate quiz
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          standard: selectedStandard,
          difficulty: selectedDifficulty,
          questionCount: 10,
          language: 'pt-BR',
        },
      });

      if (error) throw error;

      if (data?.success && data.questions) {
        setQuizState({
          standard: selectedStandard,
          difficulty: selectedDifficulty,
          questions: data.questions,
          currentQuestion: 0,
          answers: [],
          startTime: new Date(),
          completed: false,
          score: 0,
          passed: false,
        });

        toast({
          title: 'Quiz Iniciado',
          description: `${data.questions.length} questões sobre ${selectedStandard}`,
        });
      }
    } catch (err: any) {
      console.error('Error starting quiz:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível iniciar o quiz. Tente novamente.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const answerQuestion = () => {
    if (selectedAnswer === null || !quizState) return;

    const newAnswers = [...quizState.answers, selectedAnswer];
    const nextQuestion = quizState.currentQuestion + 1;

    if (nextQuestion >= quizState.questions.length) {
      // Quiz completed - calculate score
      completeQuiz(newAnswers);
    } else {
      setQuizState({
        ...quizState,
        currentQuestion: nextQuestion,
        answers: newAnswers,
      });
      setSelectedAnswer(null);
    }
  };

  const completeQuiz = async (finalAnswers: number[]) => {
    if (!quizState) return;

    try {
      setLoading(true);

      // Calculate score
      const correctAnswers = quizState.questions.filter(
        (q, idx) => q.correctAnswer === finalAnswers[idx]
      ).length;
      const score = Math.round((correctAnswers / quizState.questions.length) * 100);
      const passed = score >= PASSING_SCORE;

      // Get user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('Organization not found');

      // Save quiz result
      const { error: saveError } = await supabase.from('quiz_results').insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        standard: quizState.standard,
        difficulty: quizState.difficulty,
        questions: quizState.questions,
        answers: finalAnswers,
        score,
        passed,
        started_at: quizState.startTime.toISOString(),
        time_taken_minutes: Math.round(
          (new Date().getTime() - quizState.startTime.getTime()) / 60000
        ),
      });

      if (saveError) throw saveError;

      setQuizState({
        ...quizState,
        answers: finalAnswers,
        completed: true,
        score,
        passed,
      });

      toast({
        title: passed ? 'Parabéns!' : 'Quiz Concluído',
        description: passed
          ? `Você passou com ${score}%!`
          : `Pontuação: ${score}%. É necessário ${PASSING_SCORE}% para passar.`,
        variant: passed ? 'default' : 'destructive',
      });
    } catch (err: any) {
      console.error('Error completing quiz:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar resultados do quiz.',
      });
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setQuizState(null);
    setSelectedAnswer(null);
  };

  // Quiz setup screen
  if (!quizState) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-600" />
              Quiz de Certificação
            </CardTitle>
            <CardDescription>
              Teste seus conhecimentos em normas e padrões marítimos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Padrão/Norma</label>
                <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARDS.map((standard) => (
                      <SelectItem key={standard} value={standard}>
                        {standard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Nível de Dificuldade</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>10 questões de múltipla escolha</li>
                  <li>Pontuação mínima para aprovação: {PASSING_SCORE}%</li>
                  <li>O quiz é gerado automaticamente com IA</li>
                  <li>Seus resultados serão salvos após a conclusão</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={startQuiz}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Quiz...
                </>
              ) : (
                'Iniciar Quiz'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz completed screen
  if (quizState.completed) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {quizState.passed ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Aprovado!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  Não Aprovado
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {quizState.score}%
              </div>
              <p className="text-muted-foreground">
                {quizState.questions.filter(
                  (q, idx) => q.correctAnswer === quizState.answers[idx]
                ).length}{' '}
                de {quizState.questions.length} questões corretas
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Revisão das Questões</h3>
              {quizState.questions.map((question, idx) => {
                const isCorrect = question.correctAnswer === quizState.answers[idx];
                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sua resposta: {question.options[quizState.answers[idx]]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700 mt-1">
                            Resposta correta: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button onClick={restartQuiz} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Quiz
              </Button>
              {quizState.passed && (
                <Button className="flex-1">
                  <Award className="h-4 w-4 mr-2" />
                  Gerar Certificado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  const currentQ = quizState.questions[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>
              Questão {quizState.currentQuestion + 1} de {quizState.questions.length}
            </CardTitle>
            <span className="text-sm text-muted-foreground">{currentQ.category}</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full text-left p-4 border rounded-lg transition ${
                    selectedAnswer === idx
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === idx
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === idx && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={answerQuestion}
            disabled={selectedAnswer === null || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : quizState.currentQuestion === quizState.questions.length - 1 ? (
              'Finalizar Quiz'
            ) : (
              'Próxima Questão'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
