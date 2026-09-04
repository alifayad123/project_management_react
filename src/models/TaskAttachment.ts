import mongoose, { Schema } from 'mongoose';
import { ITaskAttachment } from '../types';

const TaskAttachmentSchema = new Schema<ITaskAttachment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
TaskAttachmentSchema.index({ taskId: 1 });
TaskAttachmentSchema.index({ uploadedBy: 1 });

export const TaskAttachment = mongoose.model<ITaskAttachment>(
  'TaskAttachment',
  TaskAttachmentSchema
);
