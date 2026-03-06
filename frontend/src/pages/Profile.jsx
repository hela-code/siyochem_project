import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Brain,
  Award,
  TrendingUp,
  Edit,
  Twitter,
  Linkedin,
  Instagram,
  FlaskConical
} from 'lucide-react'

const Profile = () => {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data - replace with actual API call
  const user = {
    id: id,
    username: 'sarahjohnson',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      bio: 'Passionate about chemistry and helping students understand complex concepts. A/L Chemistry teacher with 5+ years of experience.',
      avatar: null,
      school: 'Royal College',
      grade: 'A/L',
      role: 'teacher'
    },
    email: 'sarah.johnson@school.edu',
    socialLinks: {
      twitter: 'https://twitter.com/sarahchem',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      instagram: 'https://instagram.com/sarahchem'
    },
    stats: {
      postsCount: 45,
      likesReceived: 234,
      quizzesTaken: 67,
      averageScore: 85
    },
    joinedAt: 'January 2024',
    lastLogin: '2 hours ago'
  }

  const activities = [
    {
      type: 'quiz',
      title: 'Completed Organic Chemistry Quiz',
      description: 'Scored 18/20 (90%)',
      time: '2 hours ago',
      icon: Brain
    },
    {
      type: 'topic',
      title: 'Created "Chemical Bonding Discussion"',
      description: 'Started a new discussion topic',
      time: '1 day ago',
      icon: BookOpen
    },
    {
      type: 'achievement',
      title: 'Earned "Top Contributor" Badge',
      description: 'Received 100+ likes on posts',
      time: '3 days ago',
      icon: Award
    }
  ]

  const isOwnProfile = true // Check if current user is viewing their own profile

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-xl mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.profile.firstName[0]}{user.profile.lastName[0]}
              </span>
            </div>
            {user.profile.role === 'teacher' && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                {user.profile.firstName} {user.profile.lastName}
              </h1>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full capitalize">
                {user.profile.role}
              </span>
            </div>
            
            <p className="text-gray-300 mb-4">@{user.username}</p>
            
            {user.profile.bio && (
              <p className="text-gray-300 mb-4 max-w-2xl">{user.profile.bio}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </div>
              {user.profile.school && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.profile.school}
                </div>
              )}
              {user.profile.grade && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {user.profile.grade}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {user.joinedAt}
              </div>
            </div>

            {/* Social Links */}
            {user.socialLinks && (
              <div className="flex items-center gap-3 mt-4">
                {user.socialLinks.twitter && (
                  <a href={user.socialLinks.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a href={user.socialLinks.linkedin} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a href={user.socialLinks.instagram} className="text-gray-400 hover:text-pink-400 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
      >
        <div className="glass-card p-6 rounded-xl text-center">
          <BookOpen className="w-8 h-8 text-primary-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white mb-1">{user.stats.postsCount}</p>
          <p className="text-gray-300 text-sm">Posts</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl text-center">
          <TrendingUp className="w-8 h-8 text-primary-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white mb-1">{user.stats.likesReceived}</p>
          <p className="text-gray-300 text-sm">Likes Received</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl text-center">
          <Brain className="w-8 h-8 text-primary-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white mb-1">{user.stats.quizzesTaken}</p>
          <p className="text-gray-300 text-sm">Quizzes Taken</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl text-center">
          <Award className="w-8 h-8 text-primary-400 mx-auto mb-3" />
          <p className="text-2xl font-bold text-white mb-1">{user.stats.averageScore}%</p>
          <p className="text-gray-300 text-sm">Average Score</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{activity.title}</h3>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login</span>
                <span className="text-white">{user.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Type</span>
                <span className="text-white capitalize">{user.profile.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white">{user.joinedAt}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
