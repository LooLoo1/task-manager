import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const updateUserSchema = createUserSchema.partial();

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  userId: z.number().int().positive(),
});

export const updateProjectSchema = createProjectSchema.partial();

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Task schemas
const dateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' });

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: dateStringSchema.optional().nullable(),
  projectId: z.number().int().positive(),
  userId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000),
  taskId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000),
});

// Query schemas
export const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional(),
});
