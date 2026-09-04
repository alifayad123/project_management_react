import mongoose, { Schema } from 'mongoose';
import { IProjectMember, MemberRole } from '../types';

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'member'] as const,
        message: 'Role must be either owner or member',
      },
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
ProjectMemberSchema.index({ projectId: 1 });
ProjectMemberSchema.index({ userId: 1 });

export const ProjectMember = mongoose.model<IProjectMember>(
  'ProjectMember',
  ProjectMemberSchema
);
