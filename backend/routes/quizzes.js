const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const router = express.Router();

// Get all quizzes (for students)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const difficulty = req.query.difficulty;

    let query = { isPublished: true, isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty) {
      query['questions.difficulty'] = difficulty;
    }

    const quizzes = await Quiz.find(query)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .select('-questions.correctAnswer -attempts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes'
    });
  }
});

// Get single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    let decoded = null;
    
    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        // Token is invalid, continue without authentication
      }
    }

    let quiz;
    if (decoded) {
      // Authenticated user - check if they are the author
      quiz = await Quiz.findById(req.params.id)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar');
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      // If not the author, don't include correct answers
      if (quiz.author._id.toString() !== decoded.userId) {
        const quizObj = quiz.toObject();
        quizObj.questions = quizObj.questions.map(q => ({
          ...q,
          correctAnswer: undefined
        }));
        quiz = quizObj;
      }
    } else {
      // Non-authenticated user - no correct answers
      quiz = await Quiz.findById(req.params.id)
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .select('-questions.correctAnswer');
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz'
    });
  }
});

// Create new quiz (teachers only)
router.post('/', [
  body('title').isLength({ min: 3, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 1000 }).trim(),
  body('duration').isInt({ min: 5, max: 180 }),
  body('category').isIn([
    'Organic Chemistry',
    'Inorganic Chemistry', 
    'Physical Chemistry',
    'Analytical Chemistry',
    'Biochemistry',
    'Environmental Chemistry',
    'Mixed Topics'
  ]),
  body('questions').isArray({ min: 1 })
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

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is a teacher
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create quizzes'
      });
    }

    const { title, description, duration, category, questions } = req.body;
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length !== 4 || 
          typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({
          success: false,
          message: `Invalid question at index ${i}`
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      author: decoded.userId,
      questions,
      category,
      duration
    });

    await quiz.save();
    await quiz.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating quiz'
    });
  }
});

// Submit quiz attempt
router.post('/:id/attempt', [
  body('answers').isArray(),
  body('timeSpent').isInt({ min: 0 })
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

    const { answers, timeSpent } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not published'
      });
    }

    // Check if user has already attempted this quiz
    const existingAttempt = quiz.attempts.find(attempt => 
      attempt.student.toString() === userId
    );
    
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this quiz'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });

    const score = correctAnswers;
    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= quiz.passingMarks;
    const averageTimePerQuestion = timeSpent / quiz.questions.length;

    // Add attempt to quiz
    quiz.attempts.push({
      student: userId,
      submittedAt: new Date(),
      answers: processedAnswers,
      score,
      percentage,
      passed,
      timeSpent,
      averageTimePerQuestion
    });

    await quiz.save();

    // Update user's stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.quizzesTaken': 1 },
      $set: { 
        'stats.averageScore': (
          (User.findById(userId).select('stats.averageScore').exec().then(user => {
            const currentAvg = user.stats.averageScore || 0;
            const totalQuizzes = user.stats.quizzesTaken;
            return ((currentAvg * totalQuizzes) + percentage) / (totalQuizzes + 1);
          }))
        )
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      results: {
        score,
        percentage,
        passed,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeSpent,
        averageTimePerQuestion
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting quiz'
    });
  }
});

// Get quiz analytics (teachers only)
router.get('/:id/analytics', async (req, res) => {
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
    
    const quiz = await Quiz.findById(req.params.id).populate({
      path: 'attempts.student',
      select: 'username profile.firstName profile.lastName profile.email'
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is the author
    if (quiz.author.toString() !== decoded.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the quiz author can view analytics'
      });
    }

    // Calculate detailed analytics
    const analytics = {
      totalAttempts: quiz.attempts.length,
      averageScore: quiz.averageScore,
      passRate: quiz.passRate,
      averageTimeSpent: quiz.attempts.length > 0 
        ? quiz.attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / quiz.attempts.length 
        : 0,
      questionAnalytics: quiz.questions.map((question, index) => {
        const attempts = quiz.attempts.filter(attempt => 
          attempt.answers[index]
        );
        
        const correctAttempts = attempts.filter(attempt => 
          attempt.answers[index].isCorrect
        ).length;
        
        const averageTime = attempts.length > 0 
          ? attempts.reduce((sum, attempt) => sum + attempt.answers[index].timeSpent, 0) / attempts.length 
          : 0;

        return {
          questionIndex: index,
          question: question.question,
          correctAttempts,
          totalAttempts: attempts.length,
          correctRate: attempts.length > 0 ? (correctAttempts / attempts.length) * 100 : 0,
          averageTime
        };
      }),
      attempts: quiz.attempts.map(attempt => ({
        student: attempt.student,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        averageTimePerQuestion: attempt.averageTimePerQuestion
      }))
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get quiz analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz analytics'
    });
  }
});

module.exports = router;
