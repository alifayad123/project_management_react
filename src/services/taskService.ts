import { Task } from '../models/Task';
import { TaskComment } from '../models/TaskComment';
import { TaskAttachment } from '../models/TaskAttachment';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { ProjectMember } from '../models/ProjectMember';
import { ITask, TaskStatus, TaskPriority } from '../types';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { projectService } from './projectService';
import { logger } from '../utils/logger';
import { emitToProject } from '../socket/setup';

export class TaskService {
  /**
   * Get all tasks for a project
   */
  async getProjectTasks(projectId: string): Promise<ITask[]> {
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    return tasks;
  }

  /**
   * Get tasks by status (for Kanban board)
   */
  async getTasksByStatus(
    projectId: string,
    status: TaskStatus
  ): Promise<ITask[]> {
    const tasks = await Task.find({ projectId, status })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ priority: -1, createdAt: -1 });

    return tasks;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<ITask> {
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  /**
   * Create task
   */
  async createTask(
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: Date;
      assignedTo?: string;
    }
  ): Promise<ITask> {
    // Check member access
    await projectService.checkMemberAccess(projectId, userId);

    // If assigning to someone, verify they're a member
    if (data.assignedTo) {
      await projectService.checkMemberAccess(projectId, data.assignedTo);
    }

    const task = await Task.create({
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      assignedTo: data.assignedTo || undefined,
      createdBy: userId,
      status: 'todo',
    });

    await this.logActivity(projectId, userId, 'created', 'task', task._id.toString(), {
      title: task.title,
    });

    // Emit real-time event
    emitToProject(projectId, 'task:created', {
      task,
      createdBy: userId,
    });

    // Send notification if assigned
    if (data.assignedTo) {
      await this.createNotification(data.assignedTo, task._id.toString(), 'assigned');
    }

    logger.info('Task created', { taskId: task._id, projectId, userId });

    return task;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: Date | null;
      assignedTo?: string | null;
    }
  ): Promise<ITask> {
    const task = await this.getTaskById(taskId);

    // Check member access
    await projectService.checkMemberAccess(task.projectId.toString(), userId);

    // If updating assignee, verify they're a member
    if (data.assignedTo) {
      await projectService.checkMemberAccess(task.projectId.toString(), data.assignedTo);
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

    const updated = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!updated) {
      throw new NotFoundError('Task');
    }

    await this.logActivity(
      task.projectId.toString(),
      userId,
      'updated',
      'task',
      taskId,
      { changes: data }
    );

    emitToProject(task.projectId.toString(), 'task:updated', {
      task: updated,
      updatedBy: userId,
    });

    logger.info('Task updated', { taskId, userId });

    return updated;
  }

  /**
   * Update task status (Kanban move)
   */
  async updateTaskStatus(
    taskId: string,
    userId: string,
    newStatus: TaskStatus
  ): Promise<ITask> {
    const task = await this.getTaskById(taskId);

    // Check member access
    await projectService.checkMemberAccess(task.projectId.toString(), userId);

    // Validate status transition
    if (!this.isValidStatusTransition(task.status, newStatus)) {
      throw new AuthorizationError(
        `Cannot move task from ${task.status} to ${newStatus}`
      );
    }

    const updated = await Task.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!updated) {
      throw new NotFoundError('Task');
    }

    await this.logActivity(
      task.projectId.toString(),
      userId,
      'moved',
      'task',
      taskId,
      { from: task.status, to: newStatus }
    );

    emitToProject(task.projectId.toString(), 'task:statusChanged', {
      task: updated,
      movedBy: userId,
      oldStatus: task.status,
      newStatus,
    });

    logger.info('Task status updated', { taskId, oldStatus: task.status, newStatus });

    return updated;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.getTaskById(taskId);

    // Check member access
    await projectService.checkMemberAccess(task.projectId.toString(), userId);

    // Delete related data
    await Promise.all([
      Task.findByIdAndDelete(taskId),
      TaskComment.deleteMany({ taskId }),
      TaskAttachment.deleteMany({ taskId }),
      Notification.deleteMany({ taskId }),
    ]);

    await this.logActivity(
      task.projectId.toString(),
      userId,
      'deleted',
      'task',
      taskId,
      { title: task.title }
    );

    emitToProject(task.projectId.toString(), 'task:deleted', {
      taskId,
      deletedBy: userId,
    });

    logger.info('Task deleted', { taskId, userId });
  }

  /**
   * Validate status transitions
   */
  private isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    // Allow any transition for flexibility
    return true;
  }

  /**
   * Log activity
   */
  private async logActivity(
    projectId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: any
  ): Promise<void> {
    try {
      await ActivityLog.create({
        projectId,
        userId,
        action,
        entityType,
        entityId,
        details,
      });
    } catch (error) {
      logger.error('Failed to log activity', { error });
    }
  }

  /**
   * Create notification
   */
  private async createNotification(
    userId: string,
    taskId: string,
    type: 'assigned' | 'commented' | 'mentioned'
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

export const taskService = new TaskService();
