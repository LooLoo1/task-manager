import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { workspaceRouter } from './routes/workspaces';
import { userRouter } from './routes/users';
import { projectRouter } from './routes/projects';
import { taskRouter } from './routes/tasks';
import { categoryRouter } from './routes/categories';
import { commentRouter } from './routes/comments';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware, workspaceMiddleware } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Make prisma available in routes
app.use((req, _res, next) => {
  req.prisma = prisma;
  next();
});

// Public routes
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes (require auth)
app.use('/api/workspaces', workspaceRouter);

// Workspace-scoped routes (require auth + workspace)
app.use('/api/users', authMiddleware, userRouter);
app.use('/api/projects', authMiddleware, workspaceMiddleware, projectRouter);
app.use('/api/tasks', authMiddleware, workspaceMiddleware, taskRouter);
app.use('/api/categories', authMiddleware, workspaceMiddleware, categoryRouter);
app.use('/api/comments', authMiddleware, workspaceMiddleware, commentRouter);

// Error handler
app.use(errorHandler);

// Start server
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
