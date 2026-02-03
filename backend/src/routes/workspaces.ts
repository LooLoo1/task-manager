import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

export const workspaceRouter = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

// All routes require authentication
workspaceRouter.use(authMiddleware);

// GET /workspaces - Get user's workspaces
workspaceRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const memberships = await req.prisma.workspaceMember.findMany({
      where: { userId: req.user!.id },
      include: {
        workspace: {
          include: {
            _count: { select: { projects: true, members: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      description: m.workspace.description,
      role: m.role,
      projectsCount: m.workspace._count.projects,
      membersCount: m.workspace._count.members,
      createdAt: m.workspace.createdAt,
    }));

    res.json(workspaces);
  })
);

// POST /workspaces - Create workspace
workspaceRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description } = createWorkspaceSchema.parse(req.body);

    const workspace = await req.prisma.workspace.create({
      data: {
        name,
        description,
        members: {
          create: { userId: req.user!.id, role: 'OWNER' },
        },
      },
      include: {
        _count: { select: { projects: true, members: true } },
      },
    });

    res.status(201).json({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      role: 'OWNER',
      projectsCount: workspace._count.projects,
      membersCount: workspace._count.members,
    });
  })
);

// GET /workspaces/:id - Get workspace details
workspaceRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);

    const membership = await req.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId: id } },
      include: {
        workspace: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { projects: true } },
          },
        },
      },
    });

    if (!membership) {
      throw new AppError(404, 'Workspace not found');
    }

    res.json({
      id: membership.workspace.id,
      name: membership.workspace.name,
      description: membership.workspace.description,
      role: membership.role,
      members: membership.workspace.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      })),
      projectsCount: membership.workspace._count.projects,
    });
  })
);

// PUT /workspaces/:id - Update workspace
workspaceRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const { name, description } = createWorkspaceSchema.partial().parse(req.body);

    const membership = await req.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId: id } },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new AppError(403, 'Not authorized to update workspace');
    }

    const workspace = await req.prisma.workspace.update({
      where: { id },
      data: { name, description },
    });

    res.json(workspace);
  })
);

// POST /workspaces/:id/invite - Invite member
workspaceRouter.post(
  '/:id/invite',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);
    const { email, role = 'MEMBER' } = inviteMemberSchema.parse(req.body);

    const membership = await req.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId: id } },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      throw new AppError(403, 'Not authorized to invite members');
    }

    const userToInvite = await req.prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
      throw new AppError(404, 'User not found');
    }

    const existingMember = await req.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: userToInvite.id, workspaceId: id } },
    });

    if (existingMember) {
      throw new AppError(400, 'User is already a member');
    }

    await req.prisma.workspaceMember.create({
      data: { userId: userToInvite.id, workspaceId: id, role },
    });

    res.json({ message: 'Member invited successfully' });
  })
);

// DELETE /workspaces/:id - Delete workspace
workspaceRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id as string, 10);

    const membership = await req.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId: id } },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new AppError(403, 'Only owner can delete workspace');
    }

    await req.prisma.workspace.delete({ where: { id } });
    res.status(204).send();
  })
);
