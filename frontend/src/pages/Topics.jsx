import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Filter,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Clock,
  User
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Topics = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user, isAuthenticated } = useAuthStore()

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'Organic Chemistry', label: 'Organic Chemistry' },
    { value: 'Inorganic Chemistry', label: 'Inorganic Chemistry' },
    { value: 'Physical Chemistry', label: 'Physical Chemistry' },
    { value: 'Analytical Chemistry', label: 'Analytical Chemistry' },
    { value: 'Biochemistry', label: 'Biochemistry' },
    { value: 'Environmental Chemistry', label: 'Environmental Chemistry' }
  ]

  const mockTopics = [
    {
      id: 1,
      title: 'Understanding Chemical Bonding',
      description: 'Let\'s discuss the fundamentals of chemical bonding, including ionic, covalent, and metallic bonds. Share your questions and insights!',
      author: {
        name: 'Sarah Johnson',
        avatar: null
      },
      category: 'Physical Chemistry',
      tags: ['bonding', 'basics', 'fundamentals'],
      stats: {
        likes: 45,
        posts: 23,
        views: 156
      },
      isPinned: true,
      createdAt: '2 hours ago'
    },
    {
      id: 2,
      title: 'Organic Reaction Mechanisms Study Group',
      description: 'A dedicated space for A/L students to practice and discuss organic reaction mechanisms. Let\'s master SN1, SN2, E1, and E2 reactions together!',
      author: {
        name: 'Dr. Kumar',
        avatar: null
      },
      category: 'Organic Chemistry',
      tags: ['reactions', 'mechanisms', 'study-group'],
      stats: {
        likes: 89,
        posts: 67,
        views: 423
      },
      isPinned: false,
      createdAt: '5 hours ago'
    },
    {
      id: 3,
      title: 'Thermodynamics Problem Solving',
      description: 'Struggling with thermodynamics? Post your problems here and we\'ll work through them together. Enthalpy, entropy, and Gibbs free energy!',
      author: {
        name: 'Michael Chen',
        avatar: null
      },
      category: 'Physical Chemistry',
      tags: ['thermodynamics', 'problem-solving', 'help'],
      stats: {
        likes: 34,
        posts: 18,
        views: 201
      },
      isPinned: false,
      createdAt: '1 day ago'
    }
  ]

  const filteredTopics = mockTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Chemistry Topics
            </h1>
            <p className="text-gray-300">
              Join discussions and share knowledge with fellow chemistry enthusiasts
            </p>
          </div>
          
          {isAuthenticated && (
            <Link
              to="/create-topic"
              className="btn-primary mt-4 md:mt-0 inline-flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Topic
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-xl card-hover cursor-pointer"
          >
            <Link to={`/topics/${topic.id}`}>
              {/* Pinned Badge */}
              {topic.isPinned && (
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Pinned
                  </span>
                  <span className="text-gray-500 text-xs">{topic.createdAt}</span>
                </div>
              )}

              {/* Title and Description */}
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                {topic.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {topic.description}
              </p>

              {/* Category and Tags */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-white/10 text-primary-400 text-xs rounded-full mb-2">
                  {topic.category}
                </span>
                <div className="flex flex-wrap gap-1">
                  {topic.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {topic.tags.length > 2 && (
                    <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded">
                      +{topic.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center mb-4 pb-4 border-b border-white/10">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{topic.author.name}</p>
                  <p className="text-gray-500 text-xs">Topic creator</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-gray-400 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {topic.stats.likes}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {topic.stats.posts}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {topic.stats.views}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTopics.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No topics found</h3>
          <p className="text-gray-300 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Be the first to start a discussion!'
            }
          </p>
          {isAuthenticated && !searchTerm && selectedCategory === 'all' && (
            <Link to="/create-topic" className="btn-primary">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create First Topic
            </Link>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default Topics
