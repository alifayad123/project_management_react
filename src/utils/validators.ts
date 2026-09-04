import { z } from 'zod';

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Project Validators
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters')
    .optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

// Task Validators
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium').optional(),
  dueDate: z.string().datetime().optional().or(z.null()),
  assignedTo: z.string().optional().or(z.null()),
});

export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().or(z.null()),
  assignedTo: z.string().optional().or(z.null()),
});

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'inProgress', 'done']),
});

// Comment Validators
export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

// Member Validators
export const AddMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['member', 'owner']).default('member').optional(),
});

// Task Template Validators
export const CreateTaskTemplateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  defaultPriority: z.enum(['low', 'medium', 'high']).optional(),
  defaultAssignee: z.string().optional().or(z.null()),
});

// Pagination Validator
export const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1').optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).default('20').optional(),
  sort: z.string().optional(),
});

// Validator helper
export const validateData = <T>(schema: z.ZodSchema, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    throw errors;
  }
  return result.data as T;
};
