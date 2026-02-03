import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../schemas';
import { AppError } from '../middleware/errorHandler';

export const userRouter = Router();

// GET all users (excludes password)
userRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await req.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  })
);

// GET user by id
userRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const user = await req.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { tasks: true, comments: true, projects: true } },
      },
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json(user);
  })
);
