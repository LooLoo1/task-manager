import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createTaskSchema, updateTaskSchema, idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export const taskRouter = Router();

// GET all tasks in workspace
taskRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { projectId, userId, status, categoryId } = req.query;

    const where: Record<string, unknown> = {
      project: { workspaceId: req.workspaceId },
    };
    if (projectId) where.projectId = parseInt(projectId as string, 10);
    if (userId) where.userId = parseInt(userId as string, 10);
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId as string, 10);

    const tasks = await req.prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        category: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  })
);

// GET task by id
taskRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const task = await req.prisma.task.findFirst({
      where: { id, project: { workspaceId: req.workspaceId } },
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        category: true,
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!task) throw new AppError(404, 'Task not found');
    res.json(task);
  })
);

// POST create task
taskRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createTaskSchema.parse(req.body);

    // Verify project belongs to workspace
    const project = await req.prisma.project.findFirst({
      where: { id: data.projectId, workspaceId: req.workspaceId },
    });
    if (!project) throw new AppError(404, 'Project not found');

    const task = await req.prisma.task.create({
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null },
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        category: true,
      },
    });
    res.status(201).json(task);
  })
);

// PUT update task
taskRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = updateTaskSchema.parse(req.body);

    const existing = await req.prisma.task.findFirst({
      where: { id, project: { workspaceId: req.workspaceId } },
    });
    if (!existing) throw new AppError(404, 'Task not found');

    const task = await req.prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        category: true,
      },
    });
    res.json(task);
  })
);

// DELETE task
taskRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const existing = await req.prisma.task.findFirst({
      where: { id, project: { workspaceId: req.workspaceId } },
    });
    if (!existing) throw new AppError(404, 'Task not found');

    await req.prisma.task.delete({ where: { id } });
    res.status(204).send();
  })
);
