import path from 'path';
import fs from 'fs';
import { TaskAttachment } from '../models/TaskAttachment';
import { ITaskAttachment } from '../types';
import { NotFoundError } from '../utils/errors';
import { taskService } from './taskService';
import { projectService } from './projectService';
import { logger } from '../utils/logger';
import { emitToProject } from '../socket/setup';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class AttachmentService {
  /**
   * Get attachments for a task
   */
  async getTaskAttachments(taskId: string): Promise<ITaskAttachment[]> {
    const attachments = await TaskAttachment.find({ taskId })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    return attachments;
  }

  /**
   * Upload file
   */
  async uploadFile(
    taskId: string,
    userId: string,
    file: {
      originalname: string;
      size: number;
      buffer: Buffer;
      mimetype: string;
    }
  ): Promise<ITaskAttachment> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    // Get task to verify access
    const task = await taskService.getTaskById(taskId);

    // Check member access
    await projectService.checkMemberAccess(task.projectId.toString(), userId);

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomId}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    await fs.promises.writeFile(filepath, file.buffer);

    // Create attachment record
    const attachment = await TaskAttachment.create({
      taskId,
      fileName: file.originalname,
      fileUrl: `/uploads/${filename}`, // Relative URL for serving
      uploadedBy: userId,
    });

    const populatedAttachment = await TaskAttachment.findById(
      attachment._id
    ).populate('uploadedBy', 'name email avatar');

    if (!populatedAttachment) {
      throw new NotFoundError('Attachment');
    }

    // Emit real-time event
    emitToProject(task.projectId.toString(), 'attachment:added', {
      attachment: populatedAttachment,
      taskId,
    });

    logger.info('File uploaded', {
      attachmentId: attachment._id,
      taskId,
      filename,
      size: file.size,
    });

    return populatedAttachment;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await TaskAttachment.findById(attachmentId);
    if (!attachment) {
      throw new NotFoundError('Attachment');
    }

    // Check ownership
    if (attachment.uploadedBy.toString() !== userId) {
      throw new Error('Can only delete your own attachments');
    }

    // Get task for project info
    const task = await taskService.getTaskById(attachment.taskId.toString());

    // Delete file from filesystem
    const filepath = path.join(UPLOAD_DIR, path.basename(attachment.fileUrl));
    try {
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }
    } catch (error) {
      logger.error('Failed to delete file', { error, filepath });
    }

    // Delete attachment record
    await TaskAttachment.findByIdAndDelete(attachmentId);

    // Emit real-time event
    emitToProject(task.projectId.toString(), 'attachment:deleted', {
      attachmentId,
      taskId: attachment.taskId,
    });

    logger.info('Attachment deleted', { attachmentId, userId });
  }

  /**
   * Get file path for serving
   */
  getFilePath(fileUrl: string): string {
    return path.join(UPLOAD_DIR, path.basename(fileUrl));
  }

  /**
   * Check if file exists
   */
  fileExists(fileUrl: string): boolean {
    return fs.existsSync(this.getFilePath(fileUrl));
  }
}

export const attachmentService = new AttachmentService();
