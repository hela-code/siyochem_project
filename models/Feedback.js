import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    authorName: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema)

export default Feedback
