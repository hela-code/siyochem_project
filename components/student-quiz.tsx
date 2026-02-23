"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import DataStore, { Quiz, StudentAnswer, QuizAttempt } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StudentQuizProps {
  onBack?: () => void;
}

export function StudentQuiz({ onBack }: StudentQuizProps) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [timeSpent, setTimeSpent] = useState<Map<string, number>>(new Map());
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const allQuizzes = DataStore.getAllQuizzes();
    setQuizzes(allQuizzes);
  }, []);

  useEffect(() => {
    if (selectedQuiz && selectedQuiz.isTimed && selectedQuiz.timeLimit) {
      setQuizStartTime(new Date());
      setTimeRemaining(selectedQuiz.timeLimit);
    }
  }, [selectedQuiz]);

  useEffect(() => {
    if (quizStartTime && selectedQuiz?.isTimed) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizStartTime.getTime()) / 1000);
        const remaining = Math.max(0, (selectedQuiz.timeLimit || 0) - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0 && !isTimeUp) {
          setIsTimeUp(true);
          handleSubmitQuiz();
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [quizStartTime, selectedQuiz, isTimeUp]);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers(new Map());
    setTimeSpent(new Map());
    setShowResults(false);
    setQuizResults(null);
    setIsTimeUp(false);
    setQuestionStartTime(new Date());
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(String(currentQuestion), parseInt(value));
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!selectedQuiz) return;

    // Record time spent on current question
    if (questionStartTime) {
      const timeOnQuestion = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
      const newTimeSpent = new Map(timeSpent);
      newTimeSpent.set(String(currentQuestion), timeOnQuestion);
      setTimeSpent(newTimeSpent);
    }

    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(new Date());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      if (questionStartTime) {
        const timeOnQuestion = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
        const newTimeSpent = new Map(timeSpent);
        newTimeSpent.set(String(currentQuestion), timeOnQuestion);
        setTimeSpent(newTimeSpent);
      }

      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(new Date());
    }
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz || !user) return;

    // Record final question time
    if (questionStartTime) {
      const timeOnQuestion = Math.floor((Date.now() - questionStartTime.getTime()) / 1000);
      const newTimeSpent = new Map(timeSpent);
      newTimeSpent.set(String(currentQuestion), timeOnQuestion);
      setTimeSpent(newTimeSpent);
    }

    // Calculate score and record answers
    let score = 0;
    const studentAnswers: StudentAnswer[] = [];
    const totalTime = Math.floor((Date.now() - (quizStartTime?.getTime() || Date.now())) / 1000);

    selectedQuiz.questions.forEach((question, index) => {
      const selectedAnswer = answers.get(String(index));
      const isCorrect = selectedAnswer === question.correctOption;
      if (isCorrect) score++;

      const answer: StudentAnswer = {
        id: `answer_${Date.now()}_${index}`,
        quizId: selectedQuiz.id,
        studentId: user.id,
        questionId: question.id,
        selectedOption: selectedAnswer ?? -1,
        isCorrect,
        timeSpent: timeSpent.get(String(index)) || 0,
      };

      DataStore.recordStudentAnswer(answer);
      studentAnswers.push(answer);
    });

    // Record quiz attempt
    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: selectedQuiz.id,
      studentId: user.id,
      score,
      totalQuestions: selectedQuiz.questions.length,
      timeSpent: totalTime,
      createdAt: new Date().toISOString(),
      answers: studentAnswers,
    };

    DataStore.recordQuizAttempt(attempt);
    setQuizResults(attempt);
    setShowResults(true);
  };

  if (!user) return null;

  if (showResults && quizResults) {
    const percentage = Math.round((quizResults.score / quizResults.totalQuestions) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <Card className={`border-2 shadow-xl bg-gradient-to-br ${
          isExcellent 
            ? "from-chart-1/20 to-chart-1/5 border-chart-1/40"
            : isGood
            ? "from-primary/20 to-primary/5 border-primary/40"
            : "from-destructive/20 to-destructive/5 border-destructive/40"
        }`}>
          <CardHeader className="text-center border-b border-primary/10 pb-6">
            <div className="text-6xl mb-4">
              {isExcellent ? "🎉" : isGood ? "👏" : "💪"}
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Quiz Complete!
            </CardTitle>
            <CardDescription className="text-lg text-foreground font-semibold">
              {selectedQuiz?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 text-center border border-primary/30 shadow-md">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {quizResults.score}/{quizResults.totalQuestions}
                </p>
                <p className="text-sm font-semibold text-muted-foreground mt-2">Correct</p>
              </div>
              <div className="bg-gradient-to-br from-chart-2/20 to-chart-2/5 rounded-xl p-6 text-center border border-chart-2/30 shadow-md">
                <p className="text-4xl font-bold text-chart-2">{percentage}%</p>
                <p className="text-sm font-semibold text-muted-foreground mt-2">Score</p>
              </div>
              <div className="bg-gradient-to-br from-chart-4/20 to-chart-4/5 rounded-xl p-6 text-center border border-chart-4/30 shadow-md">
                <p className="text-4xl font-bold text-chart-4">
                  {Math.floor(quizResults.timeSpent / 60)}:{String(quizResults.timeSpent % 60).padStart(2, "0")}
                </p>
                <p className="text-sm font-semibold text-muted-foreground mt-2">Time</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Answer Review
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {quizResults.answers.map((answer, idx) => {
                  const question = selectedQuiz?.questions[idx];
                  return (
                    <div
                      key={answer.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        answer.isCorrect
                          ? "bg-gradient-to-r from-chart-1/20 to-chart-1/5 border-chart-1/40"
                          : "bg-gradient-to-r from-destructive/20 to-destructive/5 border-destructive/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{answer.isCorrect ? "✓" : "✗"}</span>
                        <div className="flex-1">
                          <p className="font-bold text-foreground">Q{idx + 1}: {question?.text}</p>
                          <p className={`text-sm mt-2 font-semibold ${answer.isCorrect ? "text-chart-1" : "text-destructive"}`}>
                            Your answer: {question?.options[answer.selectedOption]}
                          </p>
                          {!answer.isCorrect && (
                            <>
                              <p className="text-sm text-chart-1 font-semibold mt-1">
                                Correct: {question?.options[question.correctOption]}
                              </p>
                              {question?.explanation && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-foreground/5 rounded border-l-2 border-primary/30">
                                  💡 {question.explanation}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-primary/10">
              <Button
                onClick={() => {
                  setSelectedQuiz(null);
                  setShowResults(false);
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg"
              >
                ↻ Try Another Quiz
              </Button>
              {onBack && (
                <Button
                  onClick={onBack}
                  className="flex-1 border border-primary/30 text-foreground hover:bg-primary/10"
                >
                  📰 Go to Feed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const selectedAnswer = answers.get(String(currentQuestion));
    const timeMinutes = timeRemaining ? Math.floor(timeRemaining / 60) : 0;
    const timeSeconds = timeRemaining ? timeRemaining % 60 : 0;
    const isLowTime = timeRemaining! < 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        {selectedQuiz.isTimed && (
          <div
            className={`text-center p-4 rounded-lg font-bold transition-all duration-300 border-2 ${
              isLowTime
                ? "bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive border-destructive/40 shadow-lg"
                : "bg-gradient-to-r from-primary/20 to-accent/10 text-primary border-primary/40"
            }`}
          >
            <p className="text-sm opacity-75">Time Remaining</p>
            <p className={`text-3xl font-mono ${isLowTime ? 'animate-pulse' : ''}`}>
              {timeMinutes}:{String(timeSeconds).padStart(2, "0")}
            </p>
          </div>
        )}

        <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-4 border-b border-primary/10">
            <div className="space-y-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              </CardTitle>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(((currentQuestion + 1) / selectedQuiz.questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10">
              <p className="text-xl font-semibold text-foreground leading-relaxed">{question.text}</p>
            </div>

            <RadioGroup value={String(selectedAnswer ?? -1)}>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      selectedAnswer === index
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 shadow-md"
                        : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <RadioGroupItem
                      value={String(index)}
                      id={`option-${index}`}
                      onClick={() => handleAnswerChange(String(index))}
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-medium text-foreground"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4 border-t border-primary/10">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="border border-primary/30 text-foreground hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </Button>

              {currentQuestion < selectedQuiz.questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg"
                >
                  Next Question →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  className="flex-1 bg-gradient-to-r from-chart-1 to-chart-2 text-primary-foreground font-semibold hover:shadow-lg"
                >
                  ✓ Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Available Quizzes
        </h2>
        <p className="text-muted-foreground mt-2">Test your chemistry knowledge with our curated quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 py-12">
          <CardContent className="text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-lg font-semibold text-foreground">No quizzes available yet</p>
            <p className="text-muted-foreground">Check back soon for new quizzes!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {quizzes.map((quiz) => {
            const teacher = DataStore.getUserById(quiz.teacherId);
            const attempts = DataStore.getStudentQuizAttempts(quiz.id, user.id);
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

            return (
              <Card 
                key={quiz.id} 
                className="hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-card/80 hover:glow-accent"
              >
                <CardHeader className="pb-4 border-b border-primary/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground">{quiz.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <span className="text-accent font-semibold">{teacher?.name}</span>
                        <span className="text-xs opacity-60">•</span>
                        <span className="text-xs">{quiz.questions.length} questions</span>
                        {quiz.isTimed && (
                          <>
                            <span className="text-xs opacity-60">•</span>
                            <span className="text-xs">⏱️ {quiz.timeLimit}s</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-2xl opacity-60">📝</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <p className="text-foreground leading-relaxed">{quiz.description}</p>

                  <div className="flex flex-wrap gap-3 items-center">
                    {bestScore !== null && (
                      <div className="bg-gradient-to-r from-chart-1/20 to-chart-1/10 px-4 py-2 rounded-full text-sm font-semibold border border-chart-1/30">
                        ⭐ Best: {bestScore}/{quiz.questions.length}
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 rounded-full text-sm font-semibold border border-primary/30">
                      📊 Attempts: {attempts.length}
                    </div>
                  </div>

                  <Button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-semibold h-11 shadow-md"
                  >
                    ▶️ Start Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
