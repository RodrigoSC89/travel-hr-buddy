import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Award, Clock, ArrowLeft } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizTakerProps {
  questions: QuizQuestion[];
  quizType: string;
  normReference?: string;
  onComplete: (score: number, answers: any[]) => Promise<any>;
  onBack: () => void;
}

export default function QuizTaker({ questions, quizType, normReference, onComplete, onBack }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [saving, setSaving] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const finishQuiz = async (finalAnswers: string[]) => {
    const endTime = Date.now();
    const timeInSeconds = Math.floor((endTime - startTime) / 1000);
    setTimeTaken(timeInSeconds);

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Save results
    setSaving(true);
    try {
      await onComplete(finalScore, finalAnswers.map((answer, index) => ({
        question_index: index,
        answer: answer
      })));
    } catch (err) {
      console.error('Error saving quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const passed = score >= 80;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              {passed ? (
                <Award className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-center text-2xl">
              {passed ? 'Parabéns! Você foi aprovado!' : 'Não aprovado'}
            </CardTitle>
            <CardDescription className="text-center">
              {quizType} {normReference ? `- ${normReference}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Card */}
            <Card className={passed ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-5xl font-bold">{score}%</p>
                    <p className="text-gray-500 mt-2">Pontuação Final</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Corretas</p>
                      <p className="font-semibold">
                        {answers.filter((a, i) => a === questions[i].correct_answer).length} / {questions.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tempo</p>
                      <p className="font-semibold">{formatTime(timeTaken)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Info */}
            {passed && (
              <Alert className="bg-green-50 border-green-200">
                <Award className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Certificado de conclusão emitido com validade de 1 ano.
                  {saving && ' Salvando resultados...'}
                </AlertDescription>
              </Alert>
            )}

            {/* Review Answers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Revisão de Respostas</h3>
              {questions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correct_answer;

                return (
                  <Card key={index} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-2 mb-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            {index + 1}. {q.question}
                          </p>
                          <div className="space-y-1 text-sm">
                            {q.options.map((option) => {
                              const letter = option.charAt(0);
                              const isUserAnswer = letter === userAnswer;
                              const isCorrectAnswer = letter === q.correct_answer;

                              return (
                                <div
                                  key={option}
                                  className={`p-2 rounded ${
                                    isCorrectAnswer
                                      ? 'bg-green-100 text-green-800 font-medium'
                                      : isUserAnswer
                                      ? 'bg-red-100 text-red-800'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {option}
                                  {isCorrectAnswer && ' ✓'}
                                  {isUserAnswer && !isCorrectAnswer && ' (Sua resposta)'}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                            <p className="font-medium text-blue-900 mb-1">Explicação:</p>
                            <p className="text-blue-800">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={onBack} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>
              Pergunta {currentQuestion + 1} de {questions.length}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatTime(Math.floor((Date.now() - startTime) / 1000))}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-2">
            {quizType} {normReference ? `- ${normReference}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <p className="text-lg font-medium leading-relaxed">{currentQ.question}</p>

            {/* Options */}
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const letter = option.charAt(0);
                  return (
                    <div
                      key={option}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAnswer === letter
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAnswerSelect(letter)}
                    >
                      <RadioGroupItem value={letter} id={`option-${letter}`} />
                      <Label
                        htmlFor={`option-${letter}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex-1"
            >
              {currentQuestion === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima'}
            </Button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentQuestion
                    ? 'bg-blue-600'
                    : answers[index]
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
