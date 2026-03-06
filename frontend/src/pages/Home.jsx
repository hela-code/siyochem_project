import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FlaskConical, 
  BookOpen, 
  Brain, 
  Users, 
  TrendingUp, 
  Award,
  Atom,
  Beaker,
  Microscope,
  TestTube,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Home = () => {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: BookOpen,
      title: 'Discussion Topics',
      description: 'Create and participate in chemistry discussions with fellow students',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'MCQ Quizzes',
      description: 'Test your knowledge with comprehensive quizzes and instant feedback',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Social Learning',
      description: 'Connect with A/L chemistry students and teachers across Sri Lanka',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Track your performance and improve with detailed analytics',
      color: 'from-red-500 to-red-600'
    }
  ]

  const stats = [
    { number: '500+', label: 'Active Students' },
    { number: '50+', label: 'Expert Teachers' },
    { number: '1000+', label: 'Discussion Topics' },
    { number: '95%', label: 'Success Rate' }
  ]

  const chemistryTopics = [
    { name: 'Organic Chemistry', icon: Beaker, color: 'bg-green-500' },
    { name: 'Inorganic Chemistry', icon: Atom, color: 'bg-blue-500' },
    { name: 'Physical Chemistry', icon: TestTube, color: 'bg-purple-500' },
    { name: 'Analytical Chemistry', icon: Microscope, color: 'bg-red-500' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 molecular-bg opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Master Chemistry with
                <span className="text-gradient"> Chem Hub</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                The ultimate social learning platform for A/L chemistry students in Sri Lanka. 
                Connect, learn, and excel together with interactive discussions, quizzes, and real-time analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register" className="btn-primary text-center">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </Link>
                    <Link to="/topics" className="btn-secondary text-center">
                      Explore Topics
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn-primary text-center">
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </Link>
                    <Link to="/quizzes" className="btn-secondary text-center">
                      Take a Quiz
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-80 h-80 mx-auto relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full opacity-30 blur-2xl"></div>
                  <div className="absolute inset-16 glass-card rounded-full flex items-center justify-center">
                    <FlaskConical className="w-24 h-24 text-primary-400" />
                  </div>
                </motion.div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Atom className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Microscope className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 glass-morphism">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Excel in Chemistry
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform provides comprehensive tools and resources designed specifically for A/L chemistry students.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-xl card-hover cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Chemistry Topics Section */}
      <section className="py-20 glass-morphism">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Chemistry Coverage
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Master all areas of chemistry with our specialized discussion topics and quizzes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {chemistryTopics.map((topic, index) => {
              const Icon = topic.icon
              return (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-6 rounded-xl text-center card-hover cursor-pointer"
                >
                  <div className={`w-20 h-20 ${topic.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Comprehensive coverage of {topic.name.toLowerCase()} concepts and problems.
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 rounded-2xl text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Excel in Chemistry?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of A/L chemistry students who are already learning, sharing, and succeeding together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Expert teachers</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Interactive learning</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <Link to="/register" className="btn-primary inline-flex items-center">
                Start Learning Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-primary inline-flex items-center">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
