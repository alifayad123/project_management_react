import { authService } from '../../services/authService';
import { User } from '../../models/User';
import { ConflictError, AuthenticationError } from '../../utils/errors';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const result = await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('John Doe');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      await expect(
        authService.register(
          'test@example.com',
          'AnotherPassword123',
          'Jane Doe'
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );
    });

    it('should login user with correct credentials', async () => {
      const result = await authService.login(
        'test@example.com',
        'SecurePassword123'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with incorrect password', async () => {
      await expect(
        authService.login('test@example.com', 'WrongPassword123')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'SecurePassword123')
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const registered = await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      const user = await authService.getUserById(registered.user._id.toString());

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const registered = await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      const updated = await authService.updateProfile(
        registered.user._id.toString(),
        {
          name: 'Jane Doe',
        }
      );

      expect(updated.name).toBe('Jane Doe');
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const registered = await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      await authService.changePassword(
        registered.user._id.toString(),
        'SecurePassword123',
        'NewPassword456'
      );

      const result = await authService.login('test@example.com', 'NewPassword456');
      expect(result.user).toBeDefined();
    });

    it('should throw error with wrong old password', async () => {
      const registered = await authService.register(
        'test@example.com',
        'SecurePassword123',
        'John Doe'
      );

      await expect(
        authService.changePassword(
          registered.user._id.toString(),
          'WrongPassword123',
          'NewPassword456'
        )
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
