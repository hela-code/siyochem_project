"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthPage } from "@/components/auth-page";
import { Navbar } from "@/components/navbar";
import { SocialFeed } from "@/components/social-feed";
import { StudentQuiz } from "@/components/student-quiz";
import { TeacherQuizzes } from "@/components/teacher-quizzes";
import { QuizAnalytics } from "@/components/quiz-analytics";
import { UserProfile } from "@/components/user-profile";
import { MolecularBackground } from "@/components/molecular-bg";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("feed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <MolecularBackground />
        <div className="text-center space-y-4 relative z-10">
          <div className="text-6xl animate-bounce">🧪</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Chemistry A/L Hub
          </h1>
          <p className="text-muted-foreground font-medium">Preparing your learning environment...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "feed":
        return <SocialFeed />;
      case "quizzes":
        return user.role === "teacher" ? (
          <TeacherQuizzes />
        ) : (
          <StudentQuiz onBack={() => setCurrentPage("feed")} />
        );
      case "analytics":
        return user.role === "teacher" ? (
          <QuizAnalytics />
        ) : null;
      case "profile":
        return user.role === "student" ? (
          <UserProfile />
        ) : null;
      default:
        return <SocialFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MolecularBackground />
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {renderPage()}
      </main>
    </div>
  );
}
