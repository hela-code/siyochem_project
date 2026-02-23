"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavbarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export function Navbar({ currentPage = "feed", onPageChange }: NavbarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const pages =
    user.role === "teacher"
      ? [
          { id: "feed", label: "Feed" },
          { id: "quizzes", label: "Manage Quizzes" },
          { id: "analytics", label: "Analytics" },
        ]
      : [
          { id: "feed", label: "Feed" },
          { id: "quizzes", label: "Take Quiz" },
          { id: "profile", label: "My Profile" },
        ];

  return (
    <nav className="bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-xl glow-accent sticky top-0 z-50 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-2xl font-bold transform group-hover:rotate-12 transition-transform duration-300">🧪</div>
          <div className="flex flex-col">
            <span className="text-xl font-bold hidden sm:inline bg-gradient-to-r from-primary-foreground to-primary-foreground bg-clip-text">
              Chemistry A/L
            </span>
            <span className="text-xs hidden sm:inline font-semibold opacity-90">Hub</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex gap-0.5 bg-primary-foreground/10 rounded-lg p-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange?.(page.id)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                  currentPage === page.id
                    ? "bg-primary-foreground text-primary shadow-lg"
                    : "hover:bg-primary-foreground/20 text-primary-foreground"
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-primary-foreground/30 pl-6">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full font-semibold border border-primary-foreground/30">
              {user.role}
            </span>
          </div>

          <Button
            onClick={logout}
            className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-md glow-accent-hover transition-all duration-300"
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground to-transparent opacity-30" />
    </nav>
  );
}
