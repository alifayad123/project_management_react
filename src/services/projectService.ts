import { Project } from '../models/Project';
import { ProjectMember } from '../models/ProjectMember';
import { Task } from '../models/Task';
import { IProject, IProjectMember, MemberRole } from '../types';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
import { logger } from '../utils/logger';

export class ProjectService {
  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<IProject[]> {
    // Get all projects where user is member
    const memberProjects = await ProjectMember.find({ userId }).select(
      'projectId'
    );
    const projectIds = memberProjects.map((m) => m.projectId);

    const projects = await Project.find({ _id: { $in: projectIds } }).sort({
      createdAt: -1,
    });

    return projects;
  }

  /**
   * Get project by ID with member count
   */
  async getProjectById(projectId: string): Promise<IProject> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }
    return project;
  }

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    description: string | undefined,
    ownerId: string
  ): Promise<IProject> {
    const project = await Project.create({
      name,
      description,
      ownerId,
    });

    // Add owner as member
    await ProjectMember.create({
      projectId: project._id,
      userId: ownerId,
      role: 'owner',
    });

    logger.info('Project created', { projectId: project._id, ownerId });

    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    data: { name?: string; description?: string }
  ): Promise<IProject> {
    const project = await this.getProjectById(projectId);

    // Check authorization - only owner can update
    await this.checkOwnerAccess(projectId, userId);

    const updated = await Project.findByIdAndUpdate(projectId, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError('Project');
    }

    logger.info('Project updated', { projectId, userId });

    return updated;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Check authorization - only owner can delete
    await this.checkOwnerAccess(projectId, userId);

    // Delete project and all related data
    await Promise.all([
      Project.findByIdAndDelete(projectId),
      ProjectMember.deleteMany({ projectId }),
      Task.deleteMany({ projectId }),
    ]);

    logger.info('Project deleted', { projectId, userId });
  }

  /**
   * Add member to project
   */
  async addMember(
    projectId: string,
    userId: string,
    newMemberId: string,
    role: MemberRole = 'member'
  ): Promise<IProjectMember> {
    // Check authorization - only owner can add members
    await this.checkOwnerAccess(projectId, userId);

    // Check if project exists
    await this.getProjectById(projectId);

    // Check if member already exists
    const existingMember = await ProjectMember.findOne({
      projectId,
      userId: newMemberId,
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this project');
    }

    const member = await ProjectMember.create({
      projectId,
      userId: newMemberId,
      role,
    });

    logger.info('Member added to project', {
      projectId,
      newMemberId,
      role,
    });

    return member;
  }

  /**
   * Get project members
   */
  async getMembers(projectId: string): Promise<IProjectMember[]> {
    const members = await ProjectMember.find({ projectId }).populate('userId');
    return members;
  }

  /**
   * Remove member from project
   */
  async removeMember(
    projectId: string,
    userId: string,
    targetMemberId: string
  ): Promise<void> {
    // Check authorization - only owner can remove members
    await this.checkOwnerAccess(projectId, userId);

    // Prevent removing owner
    const targetMember = await ProjectMember.findOne({
      projectId,
      userId: targetMemberId,
    });

    if (targetMember?.role === 'owner') {
      throw new AuthorizationError('Cannot remove project owner');
    }

    // Unassign tasks from removed member
    await Task.updateMany(
      { projectId, assignedTo: targetMemberId },
      { $unset: { assignedTo: 1 } }
    );

    await ProjectMember.deleteOne({
      projectId,
      userId: targetMemberId,
    });

    logger.info('Member removed from project', { projectId, targetMemberId });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    targetMemberId: string,
    newRole: MemberRole
  ): Promise<IProjectMember> {
    // Check authorization - only owner can update roles
    await this.checkOwnerAccess(projectId, userId);

    // Prevent downgrading owner
    if (newRole !== 'owner') {
      const member = await ProjectMember.findOne({
        projectId,
        userId: targetMemberId,
      });

      if (member?.role === 'owner') {
        throw new AuthorizationError('Cannot downgrade project owner');
      }
    }

    const updated = await ProjectMember.findOneAndUpdate(
      { projectId, userId: targetMemberId },
      { role: newRole },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundError('Project member');
    }

    logger.info('Member role updated', {
      projectId,
      targetMemberId,
      newRole,
    });

    return updated;
  }

  /**
   * Check if user is project member
   */
  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await ProjectMember.findOne({ projectId, userId });
    return !!member;
  }

  /**
   * Check if user is project owner
   */
  async isOwner(projectId: string, userId: string): Promise<boolean> {
    const member = await ProjectMember.findOne({
      projectId,
      userId,
      role: 'owner',
    });
    return !!member;
  }

  /**
   * Check owner access and throw if unauthorized
   */
  private async checkOwnerAccess(
    projectId: string,
    userId: string
  ): Promise<void> {
    const isOwner = await this.isOwner(projectId, userId);
    if (!isOwner) {
      throw new AuthorizationError(
        'Only project owner can perform this action'
      );
    }
  }

  /**
   * Check member access and throw if unauthorized
   */
  async checkMemberAccess(
    projectId: string,
    userId: string
  ): Promise<void> {
    const isMember = await this.isMember(projectId, userId);
    if (!isMember) {
      throw new AuthorizationError(
        'You are not a member of this project'
      );
    }
  }
}

export const projectService = new ProjectService();
