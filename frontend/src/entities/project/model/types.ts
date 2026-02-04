export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  user?: { id: number; name: string };
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  userId: number;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
