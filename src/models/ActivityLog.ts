import mongoose, { Schema } from 'mongoose';
import { IActivityLog, ActivityAction, EntityType } from '../types';

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: [
          'created',
          'updated',
          'deleted',
          'moved',
          'commented',
          'attached',
        ] as const,
        message: 'Action must be a valid activity action',
      },
      required: [true, 'Action is required'],
    },
    entityType: {
      type: String,
      enum: {
        values: ['task', 'member', 'project', 'comment'] as const,
        message: 'Entity type must be one of: task, member, project, comment',
      },
      required: [true, 'Entity type is required'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
ActivityLogSchema.index({ projectId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  'ActivityLog',
  ActivityLogSchema
);
