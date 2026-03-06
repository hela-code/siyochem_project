const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  options: [{
    type: String,
    required: true,
    maxlength: 200
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    maxlength: 1000
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: {
    type: String,
    required: true
  },
  chemicalEquation: {
    type: String
  },
  image: {
    type: String
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  category: {
    type: String,
    enum: [
      'Organic Chemistry',
      'Inorganic Chemistry', 
      'Physical Chemistry',
      'Analytical Chemistry',
      'Biochemistry',
      'Environmental Chemistry',
      'Mixed Topics'
    ],
    default: 'Mixed Topics'
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 5,
    max: 180
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 0
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 0
  },
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: Date,
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean,
      timeSpent: Number // in seconds
    }],
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // total time in seconds
      default: 0
    },
    averageTimePerQuestion: {
      type: Number, // in seconds
      default: 0
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtuals
quizSchema.virtual('totalAttempts').get(function() {
  return this.attempts.length;
});

quizSchema.virtual('averageScore').get(function() {
  if (this.attempts.length === 0) return 0;
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  return (totalScore / this.attempts.length).toFixed(2);
});

quizSchema.virtual('passRate').get(function() {
  if (this.attempts.length === 0) return 0;
  const passedAttempts = this.attempts.filter(attempt => attempt.passed).length;
  return ((passedAttempts / this.attempts.length) * 100).toFixed(2);
});

// Indexes
quizSchema.index({ author: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ isPublished: 1 });

// Pre-save middleware to calculate total marks
quizSchema.pre('save', function(next) {
  this.totalMarks = this.questions.length;
  this.passingMarks = Math.ceil(this.totalMarks * 0.6); // 60% passing criteria
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
