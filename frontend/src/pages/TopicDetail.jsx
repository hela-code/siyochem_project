import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  PlusCircle,
  User,
  Clock,
  Eye,
  Bookmark
} from 'lucide-react'

const TopicDetail = () => {
  const { id } = useParams()
  const [newPost, setNewPost] = useState('')
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // Mock data - replace with actual API call
  const topic = {
    id: id,
    title: 'Understanding Chemical Bonding',
    description: 'Let\'s discuss the fundamentals of chemical bonding, including ionic, covalent, and metallic bonds. Share your questions and insights!',
    author: {
      name: 'Sarah Johnson',
      avatar: null,
      role: 'student'
    },
    category: 'Physical Chemistry',
    tags: ['bonding', 'basics', 'fundamentals'],
    stats: {
      likes: 45,
      posts: 23,
      views: 156
    },
    createdAt: '2 hours ago',
    isPinned: true
  }

  const posts = [
    {
      id: 1,
      content: 'Can someone explain the difference between polar and non-polar covalent bonds? I\'m confused about electronegativity differences.',
      author: {
        name: 'John Doe',
        avatar: null,
        role: 'student'
      },
      createdAt: '1 hour ago',
      likes: 12,
      comments: 5,
      isLiked: false
    },
    {
      id: 2,
      content: 'Great question! Polar covalent bonds occur when there\'s a moderate electronegativity difference (0.5-1.7) between atoms. The electrons are shared unequally, creating partial charges. Non-polar bonds have either no difference or very small differences (<0.5).',
      author: {
        name: 'Dr. Kumar',
        avatar: null,
        role: 'teacher'
      },
      createdAt: '45 minutes ago',
      likes: 28,
      comments: 3,
      isLiked: true
    }
  ]

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (newPost.trim()) {
      // Handle post submission
      console.log('New post:', newPost)
      setNewPost('')
    }
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  return (
    <div className="min-h-screen">
      {/* Topic Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl mb-6"
      >
        {/* Pinned Badge */}
        {topic.isPinned && (
          <div className="flex items-center mb-4">
            <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full flex items-center">
              📌 Pinned Topic
            </span>
          </div>
        )}

        {/* Title and Description */}
        <h1 className="text-3xl font-bold text-white mb-4">{topic.title}</h1>
        <p className="text-gray-300 text-lg mb-6">{topic.description}</p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="px-3 py-1 bg-white/10 text-primary-400 text-sm rounded-full">
            {topic.category}
          </span>
          {topic.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/5 text-gray-400 text-sm rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{topic.author.name}</p>
              <p className="text-gray-500 text-sm capitalize">{topic.author.role} • {topic.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{topic.stats.likes + (liked ? 1 : 0)}</span>
            </button>
            
            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-1 transition-colors ${
                bookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-1 text-gray-400">
              <Eye className="w-5 h-5" />
              <span>{topic.stats.views}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-xl mb-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Join the Discussion</h2>
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts, ask questions, or provide insights..."
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="btn-primary flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </button>
          </div>
        </form>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Discussion ({topic.stats.posts} posts)
        </h2>

        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card p-6 rounded-xl"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{post.author.name}</p>
                  <p className="text-gray-500 text-sm capitalize">{post.author.role} • {post.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-gray-300 mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
              <button
                className={`flex items-center space-x-1 transition-colors ${
                  post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
          <p className="text-gray-300">
            Be the first to share your thoughts on this topic!
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default TopicDetail
