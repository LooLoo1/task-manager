import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createCommentSchema, updateCommentSchema, idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export const commentRouter = Router();

// GET all comments (optionally filtered by task)
commentRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { taskId } = req.query;
    const where: Record<string, unknown> = {
      task: { project: { workspaceId: req.workspaceId } },
    };
    if (taskId) where.taskId = parseInt(taskId as string, 10);

    const comments = await req.prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  })
);

// GET comment by id
commentRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const comment = await req.prisma.comment.findFirst({
      where: { id, task: { project: { workspaceId: req.workspaceId } } },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    if (!comment) throw new AppError(404, 'Comment not found');
    res.json(comment);
  })
);

// POST create comment
commentRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createCommentSchema.parse(req.body);

    // Verify task belongs to workspace
    const task = await req.prisma.task.findFirst({
      where: { id: data.taskId, project: { workspaceId: req.workspaceId } },
    });
    if (!task) throw new AppError(404, 'Task not found');

    const comment = await req.prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    res.status(201).json(comment);
  })
);

// PUT update comment
commentRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = updateCommentSchema.parse(req.body);

    const existing = await req.prisma.comment.findFirst({
      where: { id, task: { project: { workspaceId: req.workspaceId } } },
    });
    if (!existing) throw new AppError(404, 'Comment not found');

    const comment = await req.prisma.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    res.json(comment);
  })
);

// DELETE comment
commentRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const existing = await req.prisma.comment.findFirst({
      where: { id, task: { project: { workspaceId: req.workspaceId } } },
    });
    if (!existing) throw new AppError(404, 'Comment not found');

    await req.prisma.comment.delete({ where: { id } });
    res.status(204).send();
  })
);
