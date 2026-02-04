import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import type { Project } from '@/entities/project';
import type { Category } from '@/entities/category';

interface TaskFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  projects: Project[];
  categories: Category[];
}

export function TaskFilters({
  statusFilter,
  setStatusFilter,
  projectFilter,
  setProjectFilter,
  categoryFilter,
  setCategoryFilter,
  projects,
  categories,
}: TaskFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>
      <Select value={projectFilter} onValueChange={setProjectFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id.toString()}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="none">Uncategorized</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
