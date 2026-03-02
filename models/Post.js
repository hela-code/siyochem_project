import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    images: [{ type: String }],
    chemicalEquations: [
      {
        equation: String,
        description: String,
      },
    ],
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    shares: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        platform: { type: String, enum: ['twitter', 'facebook', 'linkedin', 'whatsapp'] },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    isEdited: { type: Boolean, default: false },
    editHistory: [
      {
        content: String,
        editedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

postSchema.virtual('likesCount').get(function () {
  return this.likes.length
})

postSchema.virtual('commentsCount').get(function () {
  return this.comments.length
})

postSchema.virtual('sharesCount').get(function () {
  return this.shares.length
})

postSchema.index({ content: 'text' })
postSchema.index({ author: 1 })
postSchema.index({ topic: 1 })
postSchema.index({ createdAt: -1 })

export default mongoose.models.Post || mongoose.model('Post', postSchema)
