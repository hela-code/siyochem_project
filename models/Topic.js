import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Organic Chemistry',
        'Inorganic Chemistry',
        'Physical Chemistry',
        'Analytical Chemistry',
        'Biochemistry',
        'Environmental Chemistry',
        'General Discussion',
      ],
      default: 'General Discussion',
    },
    tags: [{ type: String, trim: true }],
    image: { type: String },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

topicSchema.virtual('likesCount').get(function () {
  return this.likes.length
})

topicSchema.virtual('postsCount').get(function () {
  return this.posts.length
})

topicSchema.index({ title: 'text', description: 'text' })
topicSchema.index({ author: 1 })
topicSchema.index({ category: 1 })
topicSchema.index({ createdAt: -1 })
topicSchema.index({ tags: 1 })

export default mongoose.models.Topic || mongoose.model('Topic', topicSchema)
