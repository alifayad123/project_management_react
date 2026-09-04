import { Request, Response } from 'express';
import { taskService } from '../services/taskService';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
} from '../utils/validators';

export class TaskController {
  async listProjectTasks(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;

    const tasks = await taskService.getProjectTasks(projectId);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  }

  async getTasksByStatus(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;
    const { status } = req.query;

    if (!status || !['todo', 'inProgress', 'done'].includes(status as string)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status parameter',
      });
      return;
    }

    const tasks = await taskService.getTasksByStatus(projectId, status as any);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  }

  async getTask(req: Request, res: Response): Promise<void> {
    const { id: taskId } = req.params;

    const task = await taskService.getTaskById(taskId);

    res.status(200).json({
      success: true,
      data: task,
    });
  }

  async createTask(req: Request, res: Response): Promise<void> {
    const { id: projectId } = req.params;
    const data = await CreateTaskSchema.parseAsync(req.body);

    const task = await taskService.createTask(projectId, req.userId!, data);

    res.status(201).json({
      success: true,
      data: task,
    });
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    const { id: taskId } = req.params;
    const data = await UpdateTaskSchema.parseAsync(req.body);

    const task = await taskService.updateTask(taskId, req.userId!, data);

    res.status(200).json({
      success: true,
      data: task,
    });
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    const { id: taskId } = req.params;
    const { status } = await UpdateTaskStatusSchema.parseAsync(req.body);

    const task = await taskService.updateTaskStatus(taskId, req.userId!, status);

    res.status(200).json({
      success: true,
      data: task,
    });
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    const { id: taskId } = req.params;

    await taskService.deleteTask(taskId, req.userId!);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  }
}

export const taskController = new TaskController();
