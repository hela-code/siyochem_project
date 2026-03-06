const express = require('express');
const { body, validationResult } = require('express-validator');
const Topic = require('../models/Topic');
const Post = require('../models/Post');
const router = express.Router();

// Get all topics with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const topics = await Topic.find(query)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('posts')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Topic.countDocuments(query);

    res.json({
      success: true,
      topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topics'
    });
  }
});

// Get single topic by ID
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
          select: 'username profile.firstName profile.lastName profile.avatar'
        }
      });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Increment views
    topic.views += 1;
    await topic.save();

    res.json({
      success: true,
      topic
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topic'
    });
  }
});

// Create new topic
router.post('/', [
  body('title').isLength({ min: 3, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 1000 }).trim(),
  body('category').isIn([
    'Organic Chemistry',
    'Inorganic Chemistry', 
    'Physical Chemistry',
    'Analytical Chemistry',
    'Biochemistry',
    'Environmental Chemistry',
    'General Discussion'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, category, tags, image } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const topic = new Topic({
      title,
      description,
      author: decoded.userId,
      category,
      tags: tags || [],
      image
    });

    await topic.save();
    await topic.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating topic'
    });
  }
});

// Like/unlike topic
router.post('/:id/like', async (req, res) => {
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
    const userId = decoded.userId;

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const likeIndex = topic.likes.findIndex(like => like.user.toString() === userId);
    
    if (likeIndex > -1) {
      // Unlike
      topic.likes.splice(likeIndex, 1);
    } else {
      // Like
      topic.likes.push({ user: userId });
    }

    await topic.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: topic.likes.length
    });
  } catch (error) {
    console.error('Like topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking topic'
    });
  }
});

// Get trending topics
router.get('/trending/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topics = await Topic.find({
      isActive: true,
      createdAt: { $gte: oneWeekAgo }
    })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ views: -1, 'likes.length': -1 })
    .limit(10);

    res.json({
      success: true,
      topics
    });
  } catch (error) {
    console.error('Get trending topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending topics'
    });
  }
});

module.exports = router;
