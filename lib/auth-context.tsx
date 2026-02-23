"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import DataStore, { User } from "./store";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: "student" | "teacher") => boolean;
  register: (name: string, email: string, role: "student" | "teacher") => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = DataStore.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (email: string, role: "student" | "teacher") => {
    const loggedInUser = DataStore.loginUser(email, role);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const register = (
    name: string,
    email: string,
    role: "student" | "teacher"
  ) => {
    const newUser = DataStore.registerUser(name, email, role);
    if (newUser) {
      DataStore.setCurrentUser(newUser);
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    DataStore.setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
