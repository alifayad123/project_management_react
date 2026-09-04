import { Request, Response } from 'express';
import { commentService } from '../services/commentService';
import { CreateCommentSchema } from '../utils/validators';

export class CommentController {
  async getTaskComments(req: Request, res: Response): Promise<void> {
    const { taskId } = req.params;

    const comments = await commentService.getTaskComments(taskId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  }

  async createComment(req: Request, res: Response): Promise<void> {
    const { taskId } = req.params;
    const { content } = await CreateCommentSchema.parseAsync(req.body);

    const comment = await commentService.createComment(taskId, req.userId!, content);

    res.status(201).json({
      success: true,
      data: comment,
    });
  }

  async updateComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { content } = await CreateCommentSchema.parseAsync(req.body);

    const comment = await commentService.updateComment(commentId, req.userId!, content);

    res.status(200).json({
      success: true,
      data: comment,
    });
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;

    await commentService.deleteComment(commentId, req.userId!);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  }
}

export const commentController = new CommentController();
