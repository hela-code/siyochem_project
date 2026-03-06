const express = require('express');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('stats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional user statistics
    const quizCount = await Quiz.countDocuments({ author: user._id });
    const topicCount = await Topic.countDocuments({ author: user._id });
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        quizCount,
        topicCount
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is updating their own profile
    if (decoded.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const { profile, socialLinks } = req.body;
    const updateData = {};
    
    if (profile) {
      updateData.profile = { ...profile };
    }
    
    if (socialLinks) {
      updateData.socialLinks = { ...socialLinks };
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Get user's quiz results
router.get('/:id/quizzes', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is requesting their own results or is a teacher
    const requestingUser = await User.findById(decoded.userId);
    if (decoded.userId !== req.params.id && requestingUser.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own quiz results'
      });
    }

    const quizzes = await Quiz.find({
      'attempts.student': req.params.id,
      isPublished: true
    })
    .populate('author', 'username profile.firstName profile.lastName')
    .select('title description category duration questions attempts createdAt');

    const userResults = quizzes.map(quiz => {
      const userAttempt = quiz.attempts.find(attempt => 
        attempt.student.toString() === req.params.id
      );
      
      return {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        duration: quiz.duration,
        totalQuestions: quiz.questions.length,
        author: quiz.author,
        attemptedAt: userAttempt.submittedAt,
        score: userAttempt.score,
        percentage: userAttempt.percentage,
        passed: userAttempt.passed,
        timeSpent: userAttempt.timeSpent,
        averageTimePerQuestion: userAttempt.averageTimePerQuestion
      };
    });

    res.json({
      success: true,
      results: userResults
    });
  } catch (error) {
    console.error('Get user quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz results'
    });
  }
});

// Get user's activity feed
router.get('/:id/activity', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's posts and topics
    const [posts, topics] = await Promise.all([
      Post.find({ author: req.params.id, isActive: true })
        .populate('topic', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Topic.find({ author: req.params.id, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    // Combine and sort activities
    const activities = [
      ...posts.map(post => ({
        type: 'post',
        id: post._id,
        content: post.content,
        topic: post.topic,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        createdAt: post.createdAt
      })),
      ...topics.map(topic => ({
        type: 'topic',
        id: topic._id,
        title: topic.title,
        description: topic.description,
        category: topic.category,
        likesCount: topic.likes.length,
        postsCount: topic.posts.length,
        views: topic.views,
        createdAt: topic.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user activity'
    });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } }
      ]
    })
    .select('username profile.firstName profile.lastName profile.avatar profile.school role stats')
    .sort({ 'stats.postsCount': -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      isActive: true,
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

module.exports = router;
