import mongoose, { Schema } from 'mongoose';
import { ITaskTemplate, TaskPriority } from '../types';

const TaskTemplateSchema = new Schema<ITaskTemplate>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    defaultPriority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'] as const,
        message: 'Priority must be one of: low, medium, high',
      },
      default: 'medium',
    },
    defaultAssignee: {
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

// Indexes
TaskTemplateSchema.index({ projectId: 1 });
TaskTemplateSchema.index({ createdBy: 1 });

export const TaskTemplate = mongoose.model<ITaskTemplate>(
  'TaskTemplate',
  TaskTemplateSchema
);
