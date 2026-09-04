import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { CreateProjectSchema, UpdateProjectSchema } from '../utils/validators';

export class ProjectController {
  async listProjects(req: Request, res: Response): Promise<void> {
    const projects = await projectService.getUserProjects(req.userId!);

    res.status(200).json({
      success: true,
      data: projects,
    });
  }

  async getProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await projectService.checkMemberAccess(id, req.userId!);
    const project = await projectService.getProjectById(id);

    res.status(200).json({
      success: true,
      data: project,
    });
  }

  async createProject(req: Request, res: Response): Promise<void> {
    const { name, description } = await CreateProjectSchema.parseAsync(
      req.body
    );

    const project = await projectService.createProject(
      name,
      description,
      req.userId!
    );

    res.status(201).json({
      success: true,
      data: project,
    });
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data = await UpdateProjectSchema.parseAsync(req.body);

    const project = await projectService.updateProject(id, req.userId!, data);

    res.status(200).json({
      success: true,
      data: project,
    });
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await projectService.deleteProject(id, req.userId!);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  }

  async getMembers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await projectService.checkMemberAccess(id, req.userId!);
    const members = await projectService.getMembers(id);

    res.status(200).json({
      success: true,
      data: members,
    });
  }

  async addMember(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const member = await projectService.addMember(
      id,
      req.userId!,
      userId,
      role || 'member'
    );

    res.status(201).json({
      success: true,
      data: member,
    });
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    const { id, memberId } = req.params;

    await projectService.removeMember(id, req.userId!, memberId);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  }

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    const { id, memberId } = req.params;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({
        success: false,
        error: 'Role is required',
      });
      return;
    }

    const member = await projectService.updateMemberRole(
      id,
      req.userId!,
      memberId,
      role
    );

    res.status(200).json({
      success: true,
      data: member,
    });
  }
}

export const projectController = new ProjectController();
