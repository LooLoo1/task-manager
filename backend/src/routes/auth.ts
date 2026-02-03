import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { generateToken, authMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Seed test data for new workspace
async function seedTestData(prisma: PrismaClient, workspaceId: number, userId: number) {
  // Create test categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Bug', color: '#ef4444', workspaceId } }),
    prisma.category.create({ data: { name: 'Feature', color: '#22c55e', workspaceId } }),
    prisma.category.create({ data: { name: 'Documentation', color: '#3b82f6', workspaceId } }),
    prisma.category.create({ data: { name: 'Improvement', color: '#f59e0b', workspaceId } }),
  ]);

  // Create test project
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'This is a demo project to get you started!',
      workspaceId,
      userId,
    },
  });

  // Create test tasks
  const tasks = [
    { title: 'Welcome to Task Manager!', description: 'This is your first task. Click on it to see details and add comments.', status: 'TODO' as const, priority: 'MEDIUM' as const, categoryId: categories[1].id },
    { title: 'Explore the Dashboard', description: 'Check out the Dashboard tab to see statistics and overview of your tasks.', status: 'TODO' as const, priority: 'LOW' as const, categoryId: categories[2].id },
    { title: 'Create your first project', description: 'Go to Projects tab and create a new project for your team.', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, categoryId: categories[1].id },
    { title: 'Invite team members', description: 'Click on workspace selector and use "Manage Members" to invite your colleagues.', status: 'TODO' as const, priority: 'MEDIUM' as const, categoryId: categories[3].id },
    { title: 'Fix sample bug', description: 'This is an example bug task to show how bugs can be tracked.', status: 'DONE' as const, priority: 'HIGH' as const, categoryId: categories[0].id },
  ];

  for (const task of tasks) {
    const createdTask = await prisma.task.create({
      data: { ...task, projectId: project.id, userId },
    });

    // Add welcome comment to first task
    if (task.title === 'Welcome to Task Manager!') {
      await prisma.comment.create({
        data: {
          content: 'Welcome! Feel free to edit or delete this task. Happy task managing! 🎉',
          taskId: createdTask.id,
          userId,
        },
      });
    }
  }
}

// POST /auth/register
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await req.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await req.prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // Create default workspace for the user
    const workspace = await req.prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        description: 'Your personal workspace with demo data',
        members: {
          create: { userId: user.id, role: 'OWNER' },
        },
      },
    });

    // Seed test data
    await seedTestData(req.prisma, workspace.id, user.id);

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({
      user,
      token,
      workspace: { id: workspace.id, name: workspace.name },
    });
  })
);

// POST /auth/login
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await req.prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: { workspace: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    const workspaces = user.workspaces.map((m) => ({ id: m.workspace.id, name: m.workspace.name, role: m.role }));

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
      workspaces,
    });
  })
);

// GET /auth/me
authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const workspaces = await req.prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: { select: { id: true, name: true } } },
    });

    res.json({
      user,
      workspaces: workspaces.map((m) => ({ id: m.workspace.id, name: m.workspace.name, role: m.role })),
    });
  })
);
