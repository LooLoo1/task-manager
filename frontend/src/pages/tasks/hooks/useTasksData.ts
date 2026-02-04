import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/entities/task';
import { projectApi } from '@/entities/project';
import { userApi } from '@/entities/user';
import { categoryApi } from '@/entities/category';
import { useAuth } from '@/shared/lib';

interface Filters {
  statusFilter: string;
  projectFilter: string;
  categoryFilter: string;
  searchQuery: string;
}

export function useTasksData(filters: Filters) {
  const { currentWorkspace } = useAuth();

  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', currentWorkspace?.id],
    queryFn: () => taskApi.getAll(),
    enabled: !!currentWorkspace,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: projectApi.getAll,
    enabled: !!currentWorkspace,
  });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: userApi.getAll });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', currentWorkspace?.id],
    queryFn: categoryApi.getAll,
    enabled: !!currentWorkspace,
  });

  const tasks = allTasks.filter((task) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }
    // Status filter
    if (filters.statusFilter !== 'all' && task.status !== filters.statusFilter) return false;
    // Project filter
    if (filters.projectFilter !== 'all' && task.projectId !== parseInt(filters.projectFilter)) return false;
    // Category filter
    if (filters.categoryFilter === 'none' && task.categoryId !== null) return false;
    if (
      filters.categoryFilter !== 'all' &&
      filters.categoryFilter !== 'none' &&
      task.categoryId !== parseInt(filters.categoryFilter)
    )
      return false;
    return true;
  });

  return { tasks, allTasks, projects, users, categories, isLoading: isLoadingTasks };
}
