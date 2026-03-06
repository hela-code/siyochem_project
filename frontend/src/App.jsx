import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Topics from './pages/Topics'
import TopicDetail from './pages/TopicDetail'
import Quizzes from './pages/Quizzes'
import QuizDetail from './pages/QuizDetail'
import QuizAnalytics from './pages/QuizAnalytics'
import CreateQuiz from './pages/CreateQuiz'
import Profile from './pages/Profile'
import Search from './pages/Search'
import LoadingScreen from './components/ui/LoadingScreen'

function App() {
  const { isAuthenticated, user, loading } = useAuthStore()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:id" element={<TopicDetail />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:id" element={<QuizDetail />} />
          <Route path="/search" element={<Search />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile/:id" element={<Profile />} />
          
          {/* Teacher Only Routes */}
          <Route 
            path="/create-quiz" 
            element={isAuthenticated && user?.role === 'teacher' ? <CreateQuiz /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/quiz-analytics/:id" 
            element={isAuthenticated && user?.role === 'teacher' ? <QuizAnalytics /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
