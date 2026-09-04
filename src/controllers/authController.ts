import { Request, Response } from 'express';
import { authService } from '../services/authService';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from '../utils/validators';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, name } = await RegisterSchema.parseAsync(req.body);

    const { user, accessToken, refreshToken } = await authService.register(
      email,
      password,
      name
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = await LoginSchema.parseAsync(req.body);

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = await RefreshTokenSchema.parseAsync(req.body);

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    const user = await authService.getUserById(req.userId!);

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const { name, avatar } = req.body;

    const user = await authService.updateProfile(req.userId!, {
      ...(name && { name }),
      ...(avatar && { avatar }),
    });

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Old password and new password are required',
      });
      return;
    }

    await authService.changePassword(req.userId!, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    logger.info('User logged out', { userId: req.userId });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export const authController = new AuthController();
