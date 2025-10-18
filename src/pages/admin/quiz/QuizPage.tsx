import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Brain, FileQuestion } from 'lucide-react';
import QuizTaker from './QuizTaker';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export default function QuizPage() {
  const [quizType, setQuizType] = useState<string>('SGSO');
  const [normReference, setNormReference] = useState<string>('');
  const [clauseReference, setClauseReference] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('intermediate');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[] | null>(null);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);
    setGeneratedQuiz(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-quiz', {
        body: {
          quiz_type: quizType,
          norm_reference: normReference || undefined,
          clause_reference: clauseReference || undefined,
          difficulty_level: difficultyLevel,
          num_questions: numQuestions
        }
      });

      if (functionError) throw functionError;

      if (data && data.questions) {
        setGeneratedQuiz(data.questions);
      } else {
        throw new Error('Nenhuma pergunta gerada');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (score: number, answers: any[]) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const passed = score >= 80;

      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          crew_id: user.id,
          quiz_type: quizType,
          norm_reference: normReference || null,
          clause_reference: clauseReference || null,
          difficulty_level: difficultyLevel,
          questions: generatedQuiz,
          answers: answers,
          score: score,
          passed: passed,
        })
        .select()
        .single();

      if (error) throw error;

      // Issue certificate if passed
      if (passed && data) {
        await supabase.rpc('issue_quiz_certificate', {
          p_quiz_result_id: data.id
        });
      }

      return data;
    } catch (err) {
      console.error('Error saving quiz results:', err);
      throw err;
    }
  };

  if (generatedQuiz) {
    return (
      <QuizTaker
        questions={generatedQuiz}
        quizType={quizType}
        normReference={normReference}
        onComplete={handleQuizComplete}
        onBack={() => setGeneratedQuiz(null)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <CardTitle>Quiz de Conformidade IA</CardTitle>
          </div>
          <CardDescription>
            Gere quizzes personalizados com IA para avaliar conhecimento técnico da tripulação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Quiz Type */}
            <div className="space-y-2">
              <Label htmlFor="quiz-type">Tipo de Quiz *</Label>
              <Select value={quizType} onValueChange={setQuizType}>
                <SelectTrigger id="quiz-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SGSO">SGSO - Safety Management System</SelectItem>
                  <SelectItem value="IMCA">IMCA - International Marine Contractors</SelectItem>
                  <SelectItem value="ISO">ISO - Quality Management</SelectItem>
                  <SelectItem value="ANP">ANP - Agência Nacional do Petróleo</SelectItem>
                  <SelectItem value="ISM">ISM Code - International Safety Management</SelectItem>
                  <SelectItem value="ISPS">ISPS Code - International Ship & Port Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Norm Reference */}
            <div className="space-y-2">
              <Label htmlFor="norm-reference">Referência da Norma (opcional)</Label>
              <Input
                id="norm-reference"
                placeholder="Ex: IMCA M117, ISO 9001:2015"
                value={normReference}
                onChange={(e) => setNormReference(e.target.value)}
              />
            </div>

            {/* Clause Reference */}
            <div className="space-y-2">
              <Label htmlFor="clause-reference">Referência da Cláusula (opcional)</Label>
              <Input
                id="clause-reference"
                placeholder="Ex: 4.2.1, Section 10"
                value={clauseReference}
                onChange={(e) => setClauseReference(e.target.value)}
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="num-questions">Número de Perguntas</Label>
              <Input
                id="num-questions"
                type="number"
                min={3}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Quiz com IA...
              </>
            ) : (
              <>
                <FileQuestion className="mr-2 h-4 w-4" />
                Gerar Quiz
              </>
            )}
          </Button>

          {/* Info Box */}
          <Alert>
            <AlertDescription>
              <strong>Informação:</strong> O quiz gerado será baseado nos parâmetros selecionados.
              É necessário obter 80% ou mais para aprovação e emissão de certificado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
