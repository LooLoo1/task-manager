import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createProjectSchema, updateProjectSchema, idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export const projectRouter = Router();

// GET all projects in workspace
projectRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await req.prisma.project.findMany({
      where: { workspaceId: req.workspaceId },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  })
);

// GET project by id
projectRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const project = await req.prisma.project.findFirst({
      where: { id, workspaceId: req.workspaceId },
      include: {
        user: { select: { id: true, name: true } },
        tasks: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!project) throw new AppError(404, 'Project not found');
    res.json(project);
  })
);

// POST create project
projectRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createProjectSchema.parse(req.body);
    const project = await req.prisma.project.create({
      data: { ...data, workspaceId: req.workspaceId! },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });
    res.status(201).json(project);
  })
);

// PUT update project
projectRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = updateProjectSchema.parse(req.body);

    const existing = await req.prisma.project.findFirst({ where: { id, workspaceId: req.workspaceId } });
    if (!existing) throw new AppError(404, 'Project not found');

    const project = await req.prisma.project.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });
    res.json(project);
  })
);

// DELETE project
projectRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const existing = await req.prisma.project.findFirst({ where: { id, workspaceId: req.workspaceId } });
    if (!existing) throw new AppError(404, 'Project not found');

    await req.prisma.project.delete({ where: { id } });
    res.status(204).send();
  })
);
