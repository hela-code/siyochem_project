"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import DataStore, { Quiz, Question } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function TeacherQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = () => {
    if (user?.role === "teacher") {
      const teacherQuizzes = DataStore.getQuizzesByTeacher(user.id);
      setQuizzes(teacherQuizzes);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.trim() || currentOptions.some((o) => !o.trim())) {
      alert("Please fill all fields");
      return;
    }

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: currentQuestion,
      options: currentOptions,
      correctOption,
      explanation,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCorrectOption(0);
    setExplanation("");
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateQuiz = () => {
    if (!user || !title.trim() || !description.trim() || questions.length === 0) {
      alert("Please fill all fields and add at least one question");
      return;
    }

    DataStore.createQuiz(
      user.id,
      title,
      description,
      questions,
      isTimed,
      isTimed ? timeLimit : undefined
    );

    loadQuizzes();
    setShowCreateQuiz(false);
    setTitle("");
    setDescription("");
    setQuestions([]);
    setIsTimed(false);
    setTimeLimit(300);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Quizzes</h2>
        <Button
          onClick={() => setShowCreateQuiz(!showCreateQuiz)}
          className="bg-primary hover:bg-primary/90"
        >
          {showCreateQuiz ? "Cancel" : "+ Create Quiz"}
        </Button>
      </div>

      {showCreateQuiz && (
        <Card className="border-primary/20 bg-accent/5">
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium">Quiz Title</label>
              <Input
                placeholder="e.g., Organic Chemistry Basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the quiz"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTimed}
                  onChange={(e) => setIsTimed(e.target.checked)}
                />
                <span className="font-medium">Timed Quiz</span>
              </label>
              {isTimed && (
                <div>
                  <label className="text-sm font-medium">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Questions Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-bold text-lg">Questions ({questions.length})</h3>

              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-muted/50 rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">
                      Q{index + 1}: {question.text}
                    </p>
                    <Button
                      onClick={() => handleRemoveQuestion(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    {question.options.map((opt, i) => (
                      <div
                        key={i}
                        className={
                          i === question.correctOption
                            ? "text-green-700 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {i + 1}. {opt}
                        {i === question.correctOption && " ✓"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add New Question */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Add Question</h4>

                <div>
                  <label className="text-sm font-medium">Question Text</label>
                  <Textarea
                    placeholder="Enter the question"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Options</label>
                  <div className="space-y-2 mt-2">
                    {currentOptions.map((option, index) => (
                      <Input
                        key={index}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentOptions];
                          newOptions[index] = e.target.value;
                          setCurrentOptions(newOptions);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Correct Option</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-border px-3 py-2 mt-1"
                  >
                    {currentOptions.map((_, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Explanation (Optional)</label>
                  <Textarea
                    placeholder="Why is this the correct answer?"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleAddQuestion}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Add Question
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateQuiz}
                disabled={questions.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Create Quiz
              </Button>
              <Button
                onClick={() => setShowCreateQuiz(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Your Quizzes</h3>

        {quizzes.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No quizzes created yet. Create your first quiz to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => {
              const attempts = DataStore.getQuizAttempts(quiz.id);

              return (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
                        {quiz.questions.length} Questions
                      </div>
                      <div className="bg-secondary/10 px-3 py-1 rounded-full text-sm">
                        {attempts.length} Attempts
                      </div>
                      {quiz.isTimed && (
                        <div className="bg-accent/10 px-3 py-1 rounded-full text-sm">
                          {quiz.timeLimit}s Time Limit
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        // This will navigate to analytics in the main app
                        window.location.href = `?quiz=${quiz.id}`;
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
