const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: { type: String, maxlength: 500 },
    avatar: { type: String },
    school: { type: String },
    grade: { type: String } // For A/L students
  },
  stats: {
    postsCount: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
