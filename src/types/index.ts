import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface IProject extends Document {
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Member Types
export type MemberRole = 'owner' | 'member';

export interface IProjectMember extends Document {
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

// Task Types
export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Comment Types
export interface ITaskComment extends Document {
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Attachment Types
export interface ITaskAttachment extends Document {
  taskId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: Date;
}

// Notification Types
export type NotificationType = 'assigned' | 'commented' | 'mentioned';

export interface INotification extends Document {
  userId: string;
  taskId: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

// Activity Log Types
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'commented'
  | 'attached';
export type EntityType = 'task' | 'member' | 'project' | 'comment';

export interface IActivityLog extends Document {
  projectId: string;
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// Task Template Types
export interface ITaskTemplate extends Document {
  projectId: string;
  title: string;
  description?: string;
  defaultPriority?: TaskPriority;
  defaultAssignee?: string;
  createdBy: string;
  createdAt: Date;
}

// Automation Rule Types
export interface IAutomationRule extends Document {
  projectId: string;
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
}

// Auth Payload Types
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request with User
export interface RequestWithUser {
  userId?: string;
  user?: IUser;
}

// Error Types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}
