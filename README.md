# Task Manager Backend API

Production-grade Kanban task management backend with real-time updates using Socket.io.

## Features

- ✅ User authentication with JWT (access + refresh tokens)
- ✅ Secure password hashing with bcryptjs
- ✅ Project management with role-based access control
- ✅ Kanban board with 3 task statuses (todo, in-progress, done)
- ✅ Real-time updates via Socket.io without page refresh
- ✅ Task comments and file attachments
- ✅ Notifications system
- ✅ Activity logging
- ✅ Advanced features (priorities, due dates, task templates)
- ✅ Comprehensive error handling
- ✅ Structured logging (Winston)
- ✅ TypeScript with strict mode
- ✅ Unit & integration tests with >80% coverage
- ✅ Docker support

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5
- **Framework**: Express.js 4
- **Database**: MongoDB 6+
- **Real-time**: Socket.io 4
- **Authentication**: JWT + bcryptjs
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Validation**: Zod

## Prerequisites

- Node.js 18+ or Docker
- MongoDB 6+ or Docker
- npm/pnpm

## Installation

### Using Docker (Recommended)

```bash
# Build and start services
docker-compose up --build

# Server will be available at http://localhost:3000
```

### Local Setup

```bash
# Install dependencies
pnpm install

# Create .env file from example
cp .env.example .env

# Modify .env with your local MongoDB URI:
# MONGODB_URI=mongodb://localhost:27017/task-manager

# Start MongoDB locally (if not using Docker)
# ... start your MongoDB instance

# Run development server
pnpm run dev

# Run tests
pnpm test

# Build for production
pnpm run build

# Start production server
pnpm start
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/task-manager
MONGODB_TEST_URI=mongodb://localhost:27017/task-manager-test

# JWT
JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

## API Endpoints

### Authentication
```
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login
POST   /api/auth/refresh               # Refresh token
GET    /api/auth/profile               # Get user profile (protected)
PUT    /api/auth/profile               # Update profile (protected)
POST   /api/auth/change-password       # Change password (protected)
POST   /api/auth/logout                # Logout (protected)
```

### Projects
```
GET    /api/projects                   # List user's projects (protected)
POST   /api/projects                   # Create project (protected)
GET    /api/projects/:id               # Get project details (protected)
PUT    /api/projects/:id               # Update project (protected, owner only)
DELETE /api/projects/:id               # Delete project (protected, owner only)

POST   /api/projects/:id/members       # Add member (protected, owner only)
GET    /api/projects/:id/members       # List members (protected)
DELETE /api/projects/:id/members/:uid  # Remove member (protected, owner only)
```

### Tasks
```
GET    /api/projects/:id/tasks         # List tasks (protected)
POST   /api/projects/:id/tasks         # Create task (protected)
GET    /api/tasks/:id                  # Get task details (protected)
PUT    /api/tasks/:id                  # Update task (protected)
PATCH  /api/tasks/:id/status           # Change task status (protected)
DELETE /api/tasks/:id                  # Delete task (protected)
```

### Comments & Attachments
```
POST   /api/tasks/:id/comments         # Add comment (protected)
GET    /api/tasks/:id/comments         # Get comments (protected)
DELETE /api/comments/:cid              # Delete comment (protected)

POST   /api/tasks/:id/attachments      # Upload file (protected)
DELETE /api/attachments/:aid           # Delete attachment (protected)
```

### Notifications
```
GET    /api/notifications              # Get notifications (protected)
PATCH  /api/notifications/:id/read     # Mark as read (protected)
```

### Activity
```
GET    /api/projects/:id/activity      # Get activity log (protected)
```

## Socket.io Events

### Connection
```
Authenticate with: { token: 'your_jwt_token' }
```

### Project Namespace
```
project:join                          # Join project room
project:leave                         # Leave project room

task:created                          # Task created event
task:updated                          # Task updated event
task:statusChanged                    # Task moved between columns
task:deleted                          # Task deleted event

comment:added                         # Comment added event
comment:deleted                       # Comment deleted event

member:added                          # Member added event
member:removed                        # Member removed event

notification:send                     # Send notification
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

## Development

```bash
# Start development server with hot reload
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

## Project Structure

```
src/
├── config/          # Database and app configuration
├── models/          # Mongoose schemas
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # Express routes
├── middleware/      # Express middleware (auth, error handling)
├── socket/          # Socket.io handlers
├── utils/           # Utilities (logger, errors, validators)
├── types/           # TypeScript interfaces
├── tests/           # Unit & integration tests
├── app.ts           # Express app setup
└── index.ts         # Application entry point
```

## Database Schema

### Collections
- **users**: User accounts
- **projects**: Projects
- **projectMembers**: Project members with roles
- **tasks**: Tasks in Kanban board
- **taskComments**: Comments on tasks
- **taskAttachments**: File attachments
- **notifications**: User notifications
- **activityLogs**: Activity history
- **taskTemplates**: Task templates
- **automationRules**: Automation rules

## Security

- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT authentication with secure secrets
- ✅ CORS configured for frontend
- ✅ Input validation with Zod
- ✅ Rate limiting ready
- ✅ XSS protection via input sanitization
- ✅ MongoDB parameterization (built into Mongoose)

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["error details"]
  }
}
```

## Logging

Logs are written to:
- Console (development only)
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## Performance

- Database indexes on frequently queried fields
- Connection pooling (max 10 connections)
- Async/await for non-blocking operations
- Efficient Socket.io namespaces

## Deployment

### Docker
```bash
docker build -t task-manager-backend .
docker run -p 3000:3000 --env-file .env task-manager-backend
```

### Production Checklist
- [ ] Change all secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your frontend domain
- [ ] Set up MongoDB Atlas or managed MongoDB
- [ ] Configure logging and monitoring
- [ ] Set up CI/CD pipeline
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure backup strategy

## Contributing

1. Create a feature branch
2. Write tests for new features
3. Ensure tests pass: `pnpm test`
4. Lint and format: `pnpm run lint:fix && pnpm run format`
5. Create pull request

## License

MIT
"# project_management_react" 
