import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 500 },
  options: [{ type: String, required: true, maxlength: 200 }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, maxlength: 1000 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topic: { type: String, required: true },
  chemicalEquation: { type: String },
  image: { type: String },
})

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 1000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
        'Mixed Topics',
      ],
      default: 'Mixed Topics',
    },
    duration: { type: Number, required: true, min: 5, max: 180 },
    totalMarks: { type: Number, required: true, default: 0 },
    passingMarks: { type: Number, required: true, default: 0 },
    attempts: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        startedAt: { type: Date, default: Date.now },
        submittedAt: Date,
        answers: [
          {
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean,
            timeSpent: Number,
          },
        ],
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        timeSpent: { type: Number, default: 0 },
        averageTimePerQuestion: { type: Number, default: 0 },
      },
    ],
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

quizSchema.virtual('totalAttempts').get(function () {
  return this.attempts.length
})

quizSchema.virtual('averageScore').get(function () {
  if (this.attempts.length === 0) return 0
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.percentage, 0)
  return (totalScore / this.attempts.length).toFixed(2)
})

quizSchema.virtual('passRate').get(function () {
  if (this.attempts.length === 0) return 0
  const passedAttempts = this.attempts.filter((attempt) => attempt.passed).length
  return ((passedAttempts / this.attempts.length) * 100).toFixed(2)
})

quizSchema.index({ title: 'text', description: 'text' })
quizSchema.index({ author: 1 })
quizSchema.index({ category: 1 })
quizSchema.index({ isPublished: 1 })

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema)
