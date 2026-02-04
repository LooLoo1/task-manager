export interface Comment {
  id: number;
  content: string;
  taskId: number;
  task?: { id: number; title: string };
  userId: number;
  user?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  taskId: number;
  userId: number;
}

export interface UpdateCommentDto {
  content: string;
}
