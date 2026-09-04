import { TaskComment } from '../models/TaskComment';
import { Notification } from '../models/Notification';
import { ITaskComment } from '../types';
import { NotFoundError } from '../utils/errors';
import { taskService } from './taskService';
import { projectService } from './projectService';
import { logger } from '../utils/logger';
import { emitToProject } from '../socket/setup';

export class CommentService {
  /**
   * Get comments for a task
   */
  async getTaskComments(taskId: string): Promise<ITaskComment[]> {
    const comments = await TaskComment.find({ taskId })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: 1 });

    return comments;
  }

  /**
   * Create comment
   */
  async createComment(
    taskId: string,
    userId: string,
    content: string
  ): Promise<ITaskComment> {
    // Get task to verify access
    const task = await taskService.getTaskById(taskId);

    // Check member access
    await projectService.checkMemberAccess(task.projectId.toString(), userId);

    const comment = await TaskComment.create({
      taskId,
      userId,
      content,
    });

    const populatedComment = await TaskComment.findById(comment._id).populate(
      'userId',
      'name email avatar'
    );

    if (!populatedComment) {
      throw new NotFoundError('Comment');
    }

    // Send notification to task creator if different user
    if (task.createdBy.toString() !== userId) {
      await this.createNotification(task.createdBy.toString(), taskId, 'commented');
    }

    // Emit real-time event
    emitToProject(task.projectId.toString(), 'comment:added', {
      comment: populatedComment,
      taskId,
    });

    logger.info('Comment created', { commentId: comment._id, taskId });

    return populatedComment;
  }

  /**
   * Update comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<ITaskComment> {
    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      throw new Error('Can only edit your own comments');
    }

    const updated = await TaskComment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate('userId', 'name email avatar');

    if (!updated) {
      throw new NotFoundError('Comment');
    }

    logger.info('Comment updated', { commentId, userId });

    return updated;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    // Check ownership
    if (comment.userId.toString() !== userId) {
      throw new Error('Can only delete your own comments');
    }

    // Get task for project info
    const task = await taskService.getTaskById(comment.taskId.toString());

    await TaskComment.findByIdAndDelete(commentId);

    // Emit real-time event
    emitToProject(task.projectId.toString(), 'comment:deleted', {
      commentId,
      taskId: comment.taskId,
    });

    logger.info('Comment deleted', { commentId, userId });
  }

  /**
   * Create notification
   */
  private async createNotification(
    userId: string,
    taskId: string,
    type: 'commented'
  ): Promise<void> {
    try {
      await Notification.create({
        userId,
        taskId,
        type,
        read: false,
      });
    } catch (error) {
      logger.error('Failed to create notification', { error });
    }
  }
}

export const commentService = new CommentService();
