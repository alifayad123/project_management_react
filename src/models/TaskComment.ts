import mongoose, { Schema } from 'mongoose';
import { ITaskComment } from '../types';

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TaskCommentSchema.index({ taskId: 1, createdAt: -1 });
TaskCommentSchema.index({ userId: 1 });

export const TaskComment = mongoose.model<ITaskComment>(
  'TaskComment',
  TaskCommentSchema
);
