import bcryptjs from 'bcryptjs';
import { User } from '../models/User';
import { IUser } from '../types';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    logger.info('User registered', { userId: user._id, email });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    logger.info('User logged in', { userId: user._id, email });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Remove password from response
    user.passwordHash = undefined as any;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(
      user._id.toString(),
      user.email
    );
    const newRefreshToken = generateRefreshToken(user._id.toString());

    logger.info('Token refreshed', { userId: user._id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; avatar?: string }
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    if (!user) {
      throw new NotFoundError('User');
    }

    logger.info('User profile updated', { userId });
    return user;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash and update new password
    const saltRounds = 10;
    const newPasswordHash = await bcryptjs.hash(newPassword, saltRounds);
    user.passwordHash = newPasswordHash;
    await user.save();

    logger.info('User password changed', { userId });
  }
}

export const authService = new AuthService();
