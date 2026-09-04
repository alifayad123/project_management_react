import mongoose, { Schema } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '../types';

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'inProgress', 'done'] as const,
        message: 'Status must be one of: todo, inProgress, done',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'] as const,
        message: 'Priority must be one of: low, medium, high',
      },
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - Critical for Kanban board queries
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ projectId: 1, priority: 1 });
TaskSchema.index({ projectId: 1, createdAt: -1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
