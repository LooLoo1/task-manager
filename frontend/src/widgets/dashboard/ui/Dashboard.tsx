import { useQuery } from '@tanstack/react-query';
import { taskApi, type Task } from '@/entities/task';
import { projectApi } from '@/entities/project';
import { categoryApi } from '@/entities/category';
import { Card, CardContent, CardHeader, CardTitle, Badge, PageSpinner } from '@/shared/ui';
import { useAuth } from '@/shared/lib';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, CheckCircle2, Tags } from 'lucide-react';
import { StatsCard } from './StatsCard';

export function Dashboard() {
  const { currentWorkspace } = useAuth();
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', currentWorkspace?.id],
    queryFn: () => taskApi.getAll(),
    enabled: !!currentWorkspace,
  });
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: projectApi.getAll,
    enabled: !!currentWorkspace,
  });
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', currentWorkspace?.id],
    queryFn: categoryApi.getAll,
    enabled: !!currentWorkspace,
  });

  if (loadingTasks || loadingProjects || loadingCategories) return <PageSpinner />;

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your task manager</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Projects" value={projects.length} icon={FolderKanban} color="text-violet-500" />
        <StatsCard title="Categories" value={categories.length} icon={Tags} color="text-blue-500" />
        <StatsCard title="Total Tasks" value={tasks.length} icon={CheckSquare} color="text-emerald-500" />
        <StatsCard
          title="Overdue"
          value={overdueTasks.length}
          icon={AlertTriangle}
          color="text-red-500"
          description={overdueTasks.length > 0 ? 'Need attention!' : 'All good!'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todoTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inProgressTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{doneTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <RecentTaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecentTaskItem({ task }: { task: Task }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3 min-w-0">
        {task.category && (
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: task.category.color }} />
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.project?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOverdue && (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        )}
        <Badge
          variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'secondary'}
          className="text-xs"
        >
          {task.status === 'TODO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
        </Badge>
      </div>
    </div>
  );
}
