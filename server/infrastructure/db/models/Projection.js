import mongoose from 'mongoose'

const projectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  cron: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Projection = mongoose.model('Projection', projectionSchema)
