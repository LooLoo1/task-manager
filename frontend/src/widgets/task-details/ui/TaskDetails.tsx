import { useQuery } from '@tanstack/react-query';
import { commentApi } from '@/entities/comment';
import { STATUS_CONFIG, PRIORITY_CONFIG, type Task } from '@/entities/task';
import type { User } from '@/entities/user';
import { Badge, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui';
import { Calendar, FolderKanban, User as UserIcon } from 'lucide-react';
import { TaskComments } from './TaskComments';

interface TaskDetailsProps {
  task: Task;
  users: User[];
}

export function TaskDetails({ task, users }: TaskDetailsProps) {
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => commentApi.getAll(task.id),
  });

  const StatusIcon = STATUS_CONFIG[task.status].icon;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          {task.category && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: task.category.color }} />}
          <DialogTitle>{task.title}</DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-4">
        {task.description && <p className="text-muted-foreground">{task.description}</p>}
        <div className="flex flex-wrap gap-2">
          <Badge variant={STATUS_CONFIG[task.status].variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {STATUS_CONFIG[task.status].label}
          </Badge>
          <Badge variant="outline" className={PRIORITY_CONFIG[task.priority].class}>
            {PRIORITY_CONFIG[task.priority].label}
          </Badge>
          {task.category && (
            <Badge variant="outline" style={{ borderColor: task.category.color, color: task.category.color }}>
              {task.category.name}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Project:</span>
            {task.project?.name}
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assignee:</span>
            {task.user?.name}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <TaskComments taskId={task.id} comments={comments} users={users} />
      </div>
    </DialogContent>
  );
}
