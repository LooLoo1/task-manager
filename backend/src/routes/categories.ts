import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createCategorySchema, updateCategorySchema, idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export const categoryRouter = Router();

// GET all categories in workspace
categoryRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await req.prisma.category.findMany({
      where: { workspaceId: req.workspaceId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  })
);

// GET category by id
categoryRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const category = await req.prisma.category.findFirst({
      where: { id, workspaceId: req.workspaceId },
      include: { _count: { select: { tasks: true } } },
    });
    if (!category) throw new AppError(404, 'Category not found');
    res.json(category);
  })
);

// POST create category
categoryRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createCategorySchema.parse(req.body);
    const category = await req.prisma.category.create({
      data: { ...data, workspaceId: req.workspaceId! },
      include: { _count: { select: { tasks: true } } },
    });
    res.status(201).json(category);
  })
);

// PUT update category
categoryRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = updateCategorySchema.parse(req.body);

    const existing = await req.prisma.category.findFirst({ where: { id, workspaceId: req.workspaceId } });
    if (!existing) throw new AppError(404, 'Category not found');

    const category = await req.prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });
    res.json(category);
  })
);

// DELETE category
categoryRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);

    const existing = await req.prisma.category.findFirst({ where: { id, workspaceId: req.workspaceId } });
    if (!existing) throw new AppError(404, 'Category not found');

    await req.prisma.category.delete({ where: { id } });
    res.status(204).send();
  })
);
