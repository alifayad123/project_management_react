import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { extractToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

let io: Server;

export const setupSocketIO = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware - authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return next(new Error('JWT_ACCESS_SECRET not configured'));
      }

      const decoded = jwt.verify(token, secret) as JWTPayload;
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;

      next();
    } catch (error) {
      logger.error('Socket authentication failed', { error });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.data.userId });

    // Project namespace handlers
    socket.on('project:join', (projectId: string) => {
      const room = `project:${projectId}`;
      socket.join(room);
      logger.info('User joined project', { projectId, userId: socket.data.userId });

      // Notify others in the project
      socket.to(room).emit('project:user-joined', {
        userId: socket.data.userId,
        timestamp: new Date(),
      });
    });

    socket.on('project:leave', (projectId: string) => {
      const room = `project:${projectId}`;
      socket.leave(room);
      logger.info('User left project', { projectId, userId: socket.data.userId });

      socket.to(room).emit('project:user-left', {
        userId: socket.data.userId,
        timestamp: new Date(),
      });
    });

    // Task events
    socket.on('task:created', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('task:created', data);
      logger.debug('Task created event', { projectId: data.projectId });
    });

    socket.on('task:updated', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('task:updated', data);
      logger.debug('Task updated event', { projectId: data.projectId });
    });

    socket.on('task:statusChanged', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('task:statusChanged', data);
      logger.debug('Task status changed event', { projectId: data.projectId });
    });

    socket.on('task:deleted', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('task:deleted', data);
      logger.debug('Task deleted event', { projectId: data.projectId });
    });

    // Comment events
    socket.on('comment:added', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('comment:added', data);
      logger.debug('Comment added event', { projectId: data.projectId });
    });

    socket.on('comment:deleted', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('comment:deleted', data);
      logger.debug('Comment deleted event', { projectId: data.projectId });
    });

    // Member events
    socket.on('member:added', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('member:added', data);
      logger.debug('Member added event', { projectId: data.projectId });
    });

    socket.on('member:removed', (data: any) => {
      const room = `project:${data.projectId}`;
      io.to(room).emit('member:removed', data);
      logger.debug('Member removed event', { projectId: data.projectId });
    });

    // Notification event (to specific user)
    socket.on('notification:send', (data: any) => {
      io.to(`user:${data.userId}`).emit('notification:new', data);
      logger.debug('Notification sent', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToProject = (projectId: string, event: string, data: any): void => {
  getIO().to(`project:${projectId}`).emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  getIO().to(`user:${userId}`).emit(event, data);
};
