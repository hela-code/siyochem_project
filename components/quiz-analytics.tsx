"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import DataStore, { Quiz, QuizAttempt } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuizAnalytics() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = () => {
    if (user?.role === "teacher") {
      const teacherQuizzes = DataStore.getQuizzesByTeacher(user.id);
      setQuizzes(teacherQuizzes);
      if (teacherQuizzes.length > 0) {
        selectQuiz(teacherQuizzes[0]);
      }
    }
  };

  const selectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    const quizAttempts = DataStore.getQuizAttempts(quiz.id);
    setAttempts(quizAttempts);
    const quizAnalytics = DataStore.getQuizAnalytics(quiz.id);
    setAnalytics(quizAnalytics);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 py-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quiz Analytics Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">Track student performance and question difficulty</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 py-12">
          <CardContent className="text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-lg font-semibold text-foreground">No quizzes created yet</p>
            <p className="text-muted-foreground">Create quizzes to start tracking student performance</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quiz Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Select Quiz</label>
            <select
              value={selectedQuiz?.id || ""}
              onChange={(e) => {
                const quiz = quizzes.find((q) => q.id === e.target.value);
                if (quiz) selectQuiz(quiz);
              }}
              className="w-full rounded-lg border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 bg-card text-foreground font-medium"
            >
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {selectedQuiz && analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {analytics.totalAttempts}
                    </p>
                    <p className="text-sm text-muted-foreground font-semibold mt-2">Total Attempts</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {analytics.averageScore.toFixed(1)}/{selectedQuiz.questions.length}
                    </p>
                    <p className="text-sm text-muted-foreground font-semibold mt-2">Average Score</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-secondary">
                      {Math.round(
                        (analytics.averageScore / selectedQuiz.questions.length) * 100
                      )}%
                    </p>
                    <p className="text-sm text-muted-foreground font-semibold mt-2">Success Rate</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-chart-4/20 to-chart-4/5 border-chart-4/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-chart-4">
                      {Math.floor(analytics.averageTimeSpent / 60)}:
                      {String(Math.floor(analytics.averageTimeSpent % 60)).padStart(2, "0")}
                    </p>
                    <p className="text-sm text-muted-foreground font-semibold mt-2">Avg Time Spent</p>
                  </CardContent>
                </Card>
              </div>

              {/* Question Analytics */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Question Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Detailed performance metrics for each question</p>
                </div>

                {analytics.questionAnalytics.length === 0 ? (
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 py-8">
                    <CardContent className="text-center">
                      <p className="text-2xl opacity-50">📈</p>
                      <p className="text-muted-foreground">No student responses yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {analytics.questionAnalytics.map((qa: any, index: number) => (
                      <Card key={qa.questionId} className="border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80">
                        <CardHeader className="pb-4 border-b border-primary/10">
                          <CardTitle className="text-lg font-bold text-foreground">
                            Question {index + 1}: {qa.questionText}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {qa.totalResponses} total responses
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 rounded-lg p-4 border border-chart-1/20">
                              <p className="text-xs font-semibold text-muted-foreground uppercase">Correct</p>
                              <p className="text-3xl font-bold text-chart-1 mt-2">
                                {qa.correctCount}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {qa.correctPercentage.toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg p-4 border border-destructive/20">
                              <p className="text-xs font-semibold text-muted-foreground uppercase">Incorrect</p>
                              <p className="text-3xl font-bold text-destructive mt-2">
                                {qa.incorrectCount}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(100 - qa.correctPercentage).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Enhanced Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-foreground">Success Rate</span>
                              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {qa.correctPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-chart-1 to-accent h-3 rounded-full transition-all duration-500"
                                style={{ width: `${qa.correctPercentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                            <p className="text-sm font-medium text-foreground">⏱️ Average Time</p>
                            <p className="text-2xl font-bold text-primary mt-1">{Math.floor(qa.averageTimeSpent)}s</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Attempts */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Student Attempts
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Performance records for all quiz takers</p>
                </div>

                {attempts.length === 0 ? (
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 py-8">
                    <CardContent className="text-center">
                      <p className="text-2xl opacity-50">👥</p>
                      <p className="text-muted-foreground">No student attempts yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-primary/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                          <tr className="text-left text-xs font-bold text-foreground uppercase tracking-wider">
                            <th className="pb-4 px-6 pt-4">Student</th>
                            <th className="pb-4 px-6 pt-4">Score</th>
                            <th className="pb-4 px-6 pt-4">Percentage</th>
                            <th className="pb-4 px-6 pt-4">Time Spent</th>
                            <th className="pb-4 px-6 pt-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {attempts.map((attempt, idx) => {
                            const student = DataStore.getUserById(attempt.studentId);
                            const percentage = Math.round(
                              (attempt.score / attempt.totalQuestions) * 100
                            );
                            const isExcellent = percentage >= 80;
                            const isGood = percentage >= 60;
                            return (
                              <tr
                                key={attempt.id}
                                className={`border-b border-primary/10 transition-all duration-300 ${
                                  idx % 2 === 0 ? "bg-card/50" : "bg-card"
                                } hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10`}
                              >
                                <td className="py-4 px-6 font-semibold text-foreground">{student?.name || "Unknown"}</td>
                                <td className="py-4 px-6 font-bold text-primary">
                                  {attempt.score}/{attempt.totalQuestions}
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                      isExcellent
                                        ? "bg-gradient-to-r from-chart-1 to-chart-1/80 text-primary-foreground"
                                        : isGood
                                        ? "bg-gradient-to-r from-chart-2 to-chart-2/80 text-primary-foreground"
                                        : "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground"
                                    }`}
                                  >
                                    {percentage}%
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-muted-foreground font-medium">
                                  {Math.floor(attempt.timeSpent / 60)}:
                                  {String(attempt.timeSpent % 60).padStart(2, "0")}
                                </td>
                                <td className="py-4 px-6 text-muted-foreground">
                                  {new Date(attempt.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
