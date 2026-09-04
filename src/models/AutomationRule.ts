import mongoose, { Schema } from 'mongoose';
import { IAutomationRule } from '../types';

const AutomationRuleSchema = new Schema<IAutomationRule>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    trigger: {
      type: String,
      required: [true, 'Trigger is required'],
      enum: {
        values: ['on_task_created', 'on_task_assigned', 'on_comment_added'],
        message: 'Invalid trigger type',
      },
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: ['assign_user', 'move_to_status', 'set_priority'],
        message: 'Invalid action type',
      },
    },
    config: {
      type: Schema.Types.Mixed,
      required: [true, 'Configuration is required'],
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
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
AutomationRuleSchema.index({ projectId: 1, enabled: 1 });

export const AutomationRule = mongoose.model<IAutomationRule>(
  'AutomationRule',
  AutomationRuleSchema
);
