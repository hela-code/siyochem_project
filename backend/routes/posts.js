const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Topic = require('../models/Topic');
const User = require('../models/User');
const router = express.Router();

// Get posts for a topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      topic: req.params.topicId,
      isActive: true 
    })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate('comments')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({ 
      topic: req.params.topicId,
      isActive: true 
    });

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// Create new post
router.post('/', [
  body('content').isLength({ min: 1, max: 2000 }).trim(),
  body('topicId').isMongoId()
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

    const { content, topicId, images, chemicalEquations } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const post = new Post({
      content,
      author: decoded.userId,
      topic: topicId,
      images: images || [],
      chemicalEquations: chemicalEquations || []
    });

    await post.save();
    await post.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    // Update topic's posts array
    await Topic.findByIdAndUpdate(topicId, {
      $push: { posts: post._id }
    });

    // Update user's posts count
    await User.findByIdAndUpdate(decoded.userId, {
      $inc: { 'stats.postsCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// Like/unlike post
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

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId);
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();

    res.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

// Share post
router.post('/:id/share', [
  body('platform').isIn(['twitter', 'facebook', 'linkedin', 'whatsapp'])
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

    const { platform } = req.body;
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

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add share record
    post.shares.push({ user: userId, platform });
    await post.save();

    res.json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: post.shares.length
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sharing post'
    });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.id,
      parent: null, // Only top-level comments
      isActive: true 
    })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username profile.firstName profile.lastName profile.avatar'
      }
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
});

// Add comment to post
router.post('/:id/comments', [
  body('content').isLength({ min: 1, max: 1000 }).trim()
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

    const { content, parentId } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const comment = new Comment({
      content,
      author: decoded.userId,
      post: req.params.id,
      parent: parentId || null
    });

    await comment.save();
    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    // Update post's comments array
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: comment._id }
    });

    // If it's a reply, update parent comment's replies
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

module.exports = router;
