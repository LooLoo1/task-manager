import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspaceId?: number;
    }
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Authorization required');
  }

  const token = authHeader.substring(7);

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}

export function workspaceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const workspaceId = req.headers['x-workspace-id'];

  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new AppError(400, 'Workspace ID required');
  }

  req.workspaceId = parseInt(workspaceId, 10);
  next();
}
