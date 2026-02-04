export interface Category {
  id: number;
  name: string;
  color: string;
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
